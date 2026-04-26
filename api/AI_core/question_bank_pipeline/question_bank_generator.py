from __future__ import annotations

import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import argparse
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any

import anthropic
from dotenv import load_dotenv
from pydantic import ValidationError
from pymongo import MongoClient

load_dotenv()

from api.AI_core.question_bank_pipeline.config import (
    ANTHROPIC_API_KEY,
    ANSWERS_PER_QUESTION,
    CHAPTER_FILE_TEMPLATE,
    COURSE_ID,
    MAX_TOKENS,
    MODELS,
    OUTPUT_DIR,
    QUESTIONS_PER_CHAPTER,
    TEXTBOOK_DIR,
    TOTAL_CHAPTERS,
    MONGO_URI,
    MONGO_DB_NAME,
    MONGO_COLLECTION
)
from api.modules.questionbank.models import QuestionBankCreate

# ---------------------------------------------------------------------------
# Logging & Globals
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

client: anthropic.Anthropic | None = None
db_client: MongoClient | None = None

# ---------------------------------------------------------------------------
# Prompt Builders
# ---------------------------------------------------------------------------

def _build_system_prompt() -> str:
    """Instructs the LLM to output valid JSON matching the current schema."""
    return (
        "You are an expert educational assessment designer specializing in psychology research methods. "
        "Your task is to generate high-quality multiple-choice questions based EXCLUSIVELY on the textbook chapter "
        "content provided by the user.\n\n"
        "RULES:\n"
        f"1. Generate exactly {QUESTIONS_PER_CHAPTER} questions.\n"
        f"2. Each question must have exactly {ANSWERS_PER_QUESTION} answer options.\n"
        "3. Exactly ONE answer per question must be correct (isCorrect: true).\n"
        "4. Questions must cover diverse topics from the chapter — avoid clustering.\n"
        "5. Distractors (wrong answers) must be plausible but clearly incorrect.\n"
        "6. Question IDs must follow the format 'ch<num>-q<num>' (e.g., ch1-q1).\n"
        "7. Assign 5 points per question.\n"
        "8. Do NOT reference content from other chapters or outside sources.\n\n"
        "OUTPUT FORMAT — respond with ONLY a valid JSON array. Each element must match this schema exactly:\n"
        "[\n"
        "  {\n"
        '    "questionId": "<string>",\n'
        '    "questionType": "multiple-choice",\n'
        '    "questionText": "<string>",\n'
        '    "questionPoints": <int>,\n'
        '    "answers": [\n'
        '      { "text": "<string>", "isCorrect": <bool> },\n'
        '      { "text": "<string>", "isCorrect": <bool> },\n'
        '      { "text": "<string>", "isCorrect": <bool> },\n'
        '      { "text": "<string>", "isCorrect": <bool> }\n'
        "    ]\n"
        "  }\n"
        "]\n\n"
        "Return ONLY the JSON array. No preamble, no trailing text."
    )

def _build_user_message(chapter_text: str, chapter_num: int) -> str:
    """User message containing the full chapter text."""
    return (
        f"Below is the FULL text of Chapter {chapter_num} from the textbook "
        f"'Research Methods in Psychology'. Generate {QUESTIONS_PER_CHAPTER} "
        f"multiple-choice questions based ONLY on this content.\n\n"
        f"--- BEGIN CHAPTER {chapter_num} ---\n"
        f"{chapter_text}\n"
        f"--- END CHAPTER {chapter_num} ---"
    )

# ---------------------------------------------------------------------------
# API & Database Operations
# ---------------------------------------------------------------------------

def save_to_mongodb(question_bank: dict[str, Any]):
    """Upserts the question bank into MongoDB based on Title/Chapter/Course."""
    if db_client is None:
        log.warning("  Skipping MongoDB sync: No connection.")
        return

    db = db_client[MONGO_DB_NAME]
    collection = db[MONGO_COLLECTION]

    # Matching criteria for upsert
    query = {
        "title": question_bank["title"],
        "chapter": question_bank["chapter"],
        "courseID": question_bank["courseID"]
    }
    
    collection.replace_one(query, question_bank, upsert=True)
    log.info("  Synced to MongoDB -> %s", MONGO_COLLECTION)

def call_anthropic(model: str, system_prompt: str, user_message: str) -> str:
    """Send a single request to the Anthropic Messages API."""
    assert client is not None, "Anthropic client not initialized."

    log.info("  -> Calling model=%s (message ~ %d chars)", model, len(user_message))

    response = client.messages.create(
        model=model,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    text_blocks = [block.text for block in response.content if block.type == "text"]
    if not text_blocks:
        raise RuntimeError(f"No text content in API response: {response}")

    return "\n".join(text_blocks)

# ---------------------------------------------------------------------------
# Main Generation Logic
# ---------------------------------------------------------------------------

def generate_for_chapter(chapter_num: int, model_label: str, model_id: str, dry_run: bool = False):
    log.info("Chapter %02d  |  Model: %s", chapter_num, model_label)

    # 1. Load chapter text
    filename = CHAPTER_FILE_TEMPLATE.format(chapter_num=chapter_num)
    filepath = TEXTBOOK_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Chapter file not found: {filepath}")
    
    chapter_text = filepath.read_text(encoding="utf-8")

    # 2. Build prompts
    system_prompt = _build_system_prompt()
    user_message = _build_user_message(chapter_text, chapter_num)

    if dry_run:
        log.info("  [DRY RUN] Would send %d chars to %s", len(user_message), model_id)
        return None

    # 3. Call API
    raw_response = call_anthropic(model_id, system_prompt, user_message)

    # 4. Parse & Clean JSON
    text = raw_response.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    
    try:
        questions = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM output is not valid JSON: {exc}")

    # 5. Build full Document
    now_iso = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    question_bank: dict[str, Any] = {
        "_id": f"QB{uuid.uuid4().hex[:6].upper()}",
        "title": f"Research Methods in Psychology - Chapter {chapter_num}",
        "chapter": str(chapter_num),
        "courseID": COURSE_ID,
        "sourceFile": filename,
        "createdAt": now_iso,
        "lastModified": now_iso,
        "questionCount": len(questions),
        "questions": questions,
    }

    # 6. Validate using Pydantic
    try:
        QuestionBankCreate(**question_bank)
        log.info("  OK: Validated successfully (%d questions)", len(questions))
    except ValidationError as e:
        log.error("  VALIDATION FAILED for Chapter %d: %s", chapter_num, e.json())
        question_bank["_validation_errors"] = e.errors()
        # We don't save to Mongo if validation fails
        return

    # 7. Save to local disk
    out_dir = OUTPUT_DIR / model_label
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"chapter_{chapter_num:02d}.json"
    out_path.write_text(json.dumps(question_bank, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info("  Saved locally -> %s", out_path)

    # 8. Sync to MongoDB
    save_to_mongodb(question_bank)

def run(chapters: list[int] | None = None, models: list[str] | None = None, dry_run: bool = False):
    global client, db_client

    if not ANTHROPIC_API_KEY and not dry_run:
        log.error("ANTHROPIC_API_KEY is not set.")
        sys.exit(1)

    if not dry_run:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        db_client = MongoClient(MONGO_URI)
        db_client.admin.command('ping')
        log.info("  Connected to MongoDB")

    chapter_nums = chapters or list(range(1, TOTAL_CHAPTERS + 1))
    model_labels = models or list(MODELS.keys())

    for model_label in model_labels:
        model_id = MODELS[model_label]
        for ch in chapter_nums:
            try:
                generate_for_chapter(ch, model_label, model_id, dry_run)
            except Exception as exc:
                log.error("  FAILED Chapter %02d / %s: %s", ch, model_label, exc)

            if not dry_run:
                time.sleep(2) # Respect rate limits

    log.info("=" * 60)
    log.info("Pipeline Complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate question banks and sync to MongoDB.")
    parser.add_argument("--chapters", nargs="+", type=int, help="Chapter numbers (e.g. 1 2)")
    parser.add_argument("--model", choices=list(MODELS.keys()), help="Specify 'opus' or 'sonnet'")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without calling API")
    args = parser.parse_args()
    
    run(chapters=args.chapters, models=[args.model] if args.model else None, dry_run=args.dry_run)