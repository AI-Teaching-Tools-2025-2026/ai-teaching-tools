"""
Quiz Bank Pipeline — Quiz Generator
=====================================

Core generation script. For each chapter (01-13) and each configured model
(Opus, Sonnet), this script:

  1. Reads the full chapter .txt file from disk.
  2. Builds a prompt that passes the ENTIRE chapter in the context window.
  3. Calls the Anthropic Messages API **once per chapter** requesting all
     20 multiple-choice questions in a single response.
  4. Parses and validates the returned JSON against the Quiz schema.
  5. Saves the validated quiz object to a local JSON file.

Design decisions
----------------
* **One call per chapter** — the entire chapter text is injected into the user
  message so the LLM has full context (no RAG / embedding retrieval).
* **Strict 4 options** — the prompt enforces exactly 4 answer choices with
  exactly 1 correct answer per question.
* **Two-model comparison** — results are saved in separate directories
  (``generated_quizzes/opus/`` and ``generated_quizzes/sonnet/``) so output
  quality can be reviewed side-by-side.

Usage
-----
    # Set your API key first:
    export ANTHROPIC_API_KEY="sk-ant-..."

    # Generate quizzes for ALL chapters with BOTH models:
    python quiz_generator.py

    # Generate for specific chapters only:
    python quiz_generator.py --chapters 1 3 5

    # Generate with a single model:
    python quiz_generator.py --model sonnet

    # Dry-run (prints the prompt, does NOT call the API):
    python quiz_generator.py --dry-run --chapters 1
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time
import uuid
from typing import Any

import anthropic

from backend.AI_core.quiz_pipeline.config import (
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
)
from backend.AI_core.quiz_pipeline.schema_validator import validate_quiz

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

client: anthropic.Anthropic | None = None


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

def _build_system_prompt() -> str:
    """System prompt that instructs the LLM to output valid JSON."""
    return (
        "You are an expert educational assessment designer specializing in "
        "psychology research methods. Your task is to generate high-quality "
        "multiple-choice quiz questions based EXCLUSIVELY on the textbook "
        "chapter content provided by the user.\n\n"
        "RULES:\n"
        f"1. Generate exactly {QUESTIONS_PER_CHAPTER} questions.\n"
        f"2. Each question must have exactly {ANSWERS_PER_QUESTION} answer options.\n"
        "3. Exactly ONE answer per question must be correct (isCorrect: true).\n"
        "4. Questions must cover diverse topics from the chapter — avoid clustering.\n"
        "5. Distractors (wrong answers) must be plausible but clearly incorrect "
        "given the chapter content.\n"
        "6. Question IDs must be sequential integers starting at 1.\n"
        "7. Do NOT reference content from other chapters or outside sources.\n\n"
        "OUTPUT FORMAT — respond with ONLY a valid JSON array (no markdown, no "
        "explanation, no backticks). Each element must match this schema:\n"
        "{\n"
        '  "questionId": <int>,\n'
        '  "question": "<string>",\n'
        '  "answers": [\n'
        '    { "text": "<string>", "isCorrect": <bool> },\n'
        '    { "text": "<string>", "isCorrect": <bool> },\n'
        '    { "text": "<string>", "isCorrect": <bool> },\n'
        '    { "text": "<string>", "isCorrect": <bool> }\n'
        "  ]\n"
        "}\n\n"
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
# API call
# ---------------------------------------------------------------------------

def call_anthropic(
    model: str,
    system_prompt: str,
    user_message: str,
) -> str:
    """Send a single request to the Anthropic Messages API via the official
    SDK and return the assistant's text response.

    The SDK automatically reads ANTHROPIC_API_KEY from the environment,
    handles retries on transient errors, and raises typed exceptions
    (e.g. ``anthropic.NotFoundError``, ``anthropic.RateLimitError``).
    """
    assert client is not None, "Anthropic client not initialized — call run() first"

    log.info("  -> Calling model=%s  (message ~ %d chars)", model, len(user_message))

    response = client.messages.create(
        model=model,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    # Extract text from content blocks
    text_blocks = [
        block.text
        for block in response.content
        if block.type == "text"
    ]
    if not text_blocks:
        raise RuntimeError(f"No text content in API response: {response}")

    return "\n".join(text_blocks)


# ---------------------------------------------------------------------------
# Parsing & validation
# ---------------------------------------------------------------------------

def _generate_objectid() -> str:
    """Generate a 24-hex-char string resembling a MongoDB ObjectId."""
    return uuid.uuid4().hex[:24]


def parse_questions(raw_text: str) -> list[dict[str, Any]]:
    """Parse the LLM's raw text output into a list of question dicts.
    """
    text = raw_text.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[: text.rfind("```")]
    text = text.strip()

    try:
        questions = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM output is not valid JSON: {exc}\nRaw text:\n{text[:500]}")

    if not isinstance(questions, list):
        raise ValueError(f"Expected a JSON array, got {type(questions).__name__}")

    return questions


def build_quiz_document(
    questions: list[dict[str, Any]],
    chapter_num: int,
    model_label: str,
) -> dict[str, Any]:
    """Wrap a questions array into a full Quiz document ready for MongoDB."""
    quiz: dict[str, Any] = {
        "_id": _generate_objectid(),
        "courseId": COURSE_ID,
        "section": f"Chapter {chapter_num}",
        "quizId": f"QUIZ_{model_label.upper()}_CH{chapter_num:02d}",
        "questions": questions,
    }
    return quiz


# ---------------------------------------------------------------------------
# Chapter I/O
# ---------------------------------------------------------------------------

def load_chapter(chapter_num: int) -> str:
    """Read a chapter .txt file and return its full text content.
    """
    filename = CHAPTER_FILE_TEMPLATE.format(chapter_num=chapter_num)
    filepath = TEXTBOOK_DIR / filename

    if not filepath.exists():
        raise FileNotFoundError(f"Chapter file not found: {filepath}")

    text = filepath.read_text(encoding="utf-8")
    log.info("  Loaded %s  (%d chars)", filepath.name, len(text))
    return text


# ---------------------------------------------------------------------------
# Main generation loop
# ---------------------------------------------------------------------------

def generate_for_chapter(
    chapter_num: int,
    model_label: str,
    model_id: str,
    dry_run: bool = False,
) -> dict[str, Any] | None:
    """Generate a quiz for one chapter with one model.

    Returns the validated Quiz dict, or None on failure.
    """
    log.info("Chapter %02d  |  Model: %s (%s)", chapter_num, model_label, model_id)

    # 1. Load chapter text
    chapter_text = load_chapter(chapter_num)

    # 2. Build prompts
    system_prompt = _build_system_prompt()
    user_message = _build_user_message(chapter_text, chapter_num)

    if dry_run:
        log.info("  [DRY RUN] Would send %d chars to %s", len(user_message), model_id)
        print(f"\n{'='*60}\nSYSTEM PROMPT:\n{'='*60}\n{system_prompt}")
        print(f"\n{'='*60}\nUSER MESSAGE (first 500 chars):\n{'='*60}\n{user_message[:500]}...")
        return None

    # 3. Call the API
    raw_response = call_anthropic(model_id, system_prompt, user_message)

    # 4. Parse questions
    questions = parse_questions(raw_response)

    # 5. Build full Quiz document
    quiz = build_quiz_document(questions, chapter_num, model_label)

    # 6. Validate
    errors = validate_quiz(quiz)
    if errors:
        log.warning("  Warning: Validation errors for Chapter %02d / %s:", chapter_num, model_label)
        for e in errors:
            log.warning("    - %s", e)
        # Save anyway (with a flag) so the team can inspect
        quiz["_validation_errors"] = errors
    else:
        log.info("  OK: Quiz validated successfully (%d questions)", len(questions))

    # 7. Save to disk
    out_dir = OUTPUT_DIR / model_label
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"quiz_chapter_{chapter_num:02d}.json"
    out_path.write_text(json.dumps(quiz, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info("  Saved -> %s", out_path)

    return quiz


def run(
    chapters: list[int] | None = None,
    models: list[str] | None = None,
    dry_run: bool = False,
) -> list[dict[str, Any]]:
    """Run the full generation pipeline.
    """
    global client

    if not ANTHROPIC_API_KEY and not dry_run:
        log.error("ANTHROPIC_API_KEY is not set. Export it or add to .env")
        sys.exit(1)

    # Initialize the Anthropic client.
    # The SDK automatically reads ANTHROPIC_API_KEY from the environment.
    if not dry_run:
        client = anthropic.Anthropic()

    chapter_nums = chapters or list(range(1, TOTAL_CHAPTERS + 1))
    model_labels = models or list(MODELS.keys())

    all_quizzes: list[dict[str, Any]] = []

    for model_label in model_labels:
        model_id = MODELS[model_label]
        log.info("=" * 60)
        log.info("MODEL: %s  (%s)", model_label.upper(), model_id)
        log.info("=" * 60)

        for ch in chapter_nums:
            try:
                quiz = generate_for_chapter(ch, model_label, model_id, dry_run)
                if quiz:
                    all_quizzes.append(quiz)
            except Exception as exc:
                log.error("  FAILED Chapter %02d / %s: %s", ch, model_label, exc)

            # Brief pause between calls to respect rate limits
            if not dry_run:
                time.sleep(2)

    log.info("=" * 60)
    log.info("Done. Generated %d quiz documents total.", len(all_quizzes))
    return all_quizzes


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate quiz banks from textbook chapters via the Anthropic API."
    )
    parser.add_argument(
        "--chapters",
        nargs="+",
        type=int,
        default=None,
        help="Specific chapter numbers to process (e.g. 1 3 5). Default: all 1-13.",
    )
    parser.add_argument(
        "--model",
        choices=list(MODELS.keys()),
        default=None,
        help="Generate with a single model only. Default: both opus and sonnet.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print prompts without calling the API.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    selected_models = [args.model] if args.model else None
    run(chapters=args.chapters, models=selected_models, dry_run=args.dry_run)