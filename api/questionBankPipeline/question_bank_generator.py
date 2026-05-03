from __future__ import annotations
import sys
from pathlib import Path
project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
import json
import logging
import anthropic
from typing import Any
from dotenv import load_dotenv
from pydantic import ValidationError

load_dotenv()

from questionBankPipeline.config import (
    MODEL,
    ANTHROPIC_API_KEY,
    ANSWERS_PER_QUESTION,
    MAX_TOKENS,
    QUESTIONS_PER_CHAPTER
)
from modules.questionbank.models import QuestionBankGenerated

# ---------------------------------------------------------------------------
# Logging & Globals
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

if not ANTHROPIC_API_KEY:
    log.error("ANTHROPIC_API_KEY is not set.")
    sys.exit(1)

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

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

def _build_user_message(textbook_name: str, chapter_num: str, chapter_title: str, chapter_text: str) -> str:
    """User message containing the dynamic title, chapter details, and full chapter text."""
    return (
        f"Below is the FULL text of Chapter {chapter_num}: '{chapter_title}' from the textbook "
        f"'{textbook_name}'. Generate {QUESTIONS_PER_CHAPTER} "
        f"multiple-choice questions based ONLY on this content.\n\n"
        f"--- BEGIN CHAPTER {chapter_num} ---\n"
        f"{chapter_text}\n"
        f"--- END CHAPTER {chapter_num} ---"
    )

# ---------------------------------------------------------------------------
# API Operations
# ---------------------------------------------------------------------------

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

def generate_for_chapter(textbook_name: str, chapter_num: str, chapter_title: str, chapter_text: str, model_id: str = MODEL) -> dict[str, Any] | None:
    """
    Generates and validates a question bank for a specific chapter.
    Returns the validated dictionary, or None if validation fails.
    """
    log.info(f"Generating questions for: {textbook_name} | Chapter {chapter_num}: {chapter_title}")

    # 1. Build & Call
    system_prompt = _build_system_prompt()
    user_message = _build_user_message(textbook_name, chapter_num, chapter_title, chapter_text)
    raw_response = call_anthropic(model_id, system_prompt, user_message)

    # 2. Parse JSON
    text = raw_response.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    if text.startswith("json"):
        text = text[4:].strip()
    
    try:
        questions_array = json.loads(text)
    except json.JSONDecodeError as exc:
        log.error(f"LLM output is not valid JSON: {text}")
        raise ValueError(f"LLM output is not valid JSON: {exc}")

    # 3. Build Partial Document
    question_bank = {
        "title": f"{textbook_name} - Chapter {chapter_num}: {chapter_title}",
        "chapter": str(chapter_num),
        "questionCount": len(questions_array),
        "questions": questions_array,
    }

    # 4. Validate using Pydantic
    try:
        validated_data = QuestionBankGenerated(**question_bank)
        log.info(f"  OK: Validated successfully ({len(questions_array)} questions)")
        # Return as a standard dictionary for MongoDB insertion later
        return validated_data.model_dump() 
    except ValidationError as e:
        log.error(f"  VALIDATION FAILED for Chapter {chapter_num}:\n{e.json()}")
        # Returning None allows the router to handle the failure gracefully (e.g., skip or retry)
        return None

if __name__ == "__main__":    
    sample_textbook_name = "Research Methods in Psychology"
    sample_chapter_num = "1"
    sample_chapter_title = "The Science of Psychology"
    sample_text = "This is a placeholder for chapter text. In research, a hypothesis is a testable prediction..."
    
    try:
        # Call the generation function with the correct keyword arguments
        result_dict = generate_for_chapter(
            textbook_name=sample_textbook_name, 
            chapter_num=sample_chapter_num, 
            chapter_title=sample_chapter_title,
            chapter_text=sample_text
        )
        
        # If the LLM generates bad output or Pydantic fails, result_dict will be None
        if result_dict:
            # Output to file for inspection
            output_file = Path("test_question_bank.json")
            output_file.write_text(json.dumps(result_dict, indent=2), encoding="utf-8")
            log.info(f"Test complete! Wrote sample question bank to {output_file.absolute()}")
        else:
            log.warning("Test failed: generator returned None (likely a validation error).")
            
    except Exception as e:
        log.error(f"Test failed: {e}")