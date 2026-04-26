"""
Quiz Bank Pipeline — Schema Validator
======================================

Validates generated quiz objects against the schema defined in the
*Quiz Bank Generator: Retrieval Pipeline Technical Specification*.

Schema recap (from the spec, Section 3):

    Quiz
    ├── _id         : str   (MongoDB ObjectId hex string)
    ├── courseId     : str
    ├── section      : str   (e.g. "Chapter 1")
    ├── quizId       : str   (unique within courseId)
    └── questions    : list[Question]
            ├── questionId : int  (sequential, starts at 1)
            ├── question   : str
            └── answers    : list[Answer]   (exactly 4 items)
                    ├── text       : str
                    └── isCorrect  : bool  (exactly one True per question)

"""

from __future__ import annotations

import re
from typing import Any


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_quiz(quiz: dict[str, Any]) -> list[str]:
    """Return a list of human-readable error strings. Empty list = valid."""
    errors: list[str] = []

    # --- Top-level required fields ---
    for field in ("_id", "courseId", "section", "quizId", "questions"):
        if field not in quiz:
            errors.append(f"Missing required field: '{field}'")

    if errors:
        return errors  # can't continue without structure

    # --- Field-type checks ---
    if not isinstance(quiz["_id"], str) or not quiz["_id"].strip():
        errors.append("'_id' must be a non-empty string")
    elif not _is_valid_objectid(quiz["_id"]):
        errors.append(f"'_id' does not look like a valid ObjectId: {quiz['_id']}")

    if not isinstance(quiz["courseId"], str) or not quiz["courseId"].strip():
        errors.append("'courseId' must be a non-empty string")

    if not isinstance(quiz["section"], str) or not quiz["section"].strip():
        errors.append("'section' must be a non-empty string")

    if not isinstance(quiz["quizId"], str) or not quiz["quizId"].strip():
        errors.append("'quizId' must be a non-empty string")

    # --- Questions array ---
    questions = quiz.get("questions", [])
    if not isinstance(questions, list) or len(questions) == 0:
        errors.append("'questions' must be a non-empty array")
        return errors

    for idx, q in enumerate(questions):
        q_errors = validate_question(q, expected_id=idx + 1)
        errors.extend(f"questions[{idx}]: {e}" for e in q_errors)

    return errors


def validate_question(
    question: dict[str, Any],
    expected_id: int | None = None,
    expected_answer_count: int = 4,
) -> list[str]:
    """Validate a single Question object. Returns list of error strings."""
    errors: list[str] = []

    # --- Required fields ---
    for field in ("questionId", "question", "answers"):
        if field not in question:
            errors.append(f"Missing required field: '{field}'")
    if errors:
        return errors

    # --- questionId ---
    qid = question["questionId"]
    if not isinstance(qid, int):
        errors.append(f"'questionId' must be an integer, got {type(qid).__name__}")
    elif expected_id is not None and qid != expected_id:
        errors.append(f"'questionId' should be {expected_id}, got {qid}")

    # --- question text ---
    if not isinstance(question["question"], str) or not question["question"].strip():
        errors.append("'question' text must be a non-empty string")

    # --- answers ---
    answers = question.get("answers", [])
    if not isinstance(answers, list):
        errors.append("'answers' must be an array")
        return errors

    if len(answers) != expected_answer_count:
        errors.append(
            f"Expected exactly {expected_answer_count} answer options, got {len(answers)}"
        )

    correct_count = 0
    for a_idx, ans in enumerate(answers):
        if not isinstance(ans, dict):
            errors.append(f"answers[{a_idx}]: must be an object")
            continue
        if "text" not in ans or not isinstance(ans.get("text"), str) or not ans["text"].strip():
            errors.append(f"answers[{a_idx}]: 'text' must be a non-empty string")
        if "isCorrect" not in ans or not isinstance(ans.get("isCorrect"), bool):
            errors.append(f"answers[{a_idx}]: 'isCorrect' must be a boolean")
        elif ans["isCorrect"]:
            correct_count += 1

    if correct_count != 1:
        errors.append(f"Exactly 1 answer must be correct, found {correct_count}")

    return errors


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_OBJECTID_RE = re.compile(r"^[0-9a-fA-F]{24}$")


def _is_valid_objectid(value: str) -> bool:
    """Check if a string looks like a 24-hex-char MongoDB ObjectId."""
    return bool(_OBJECTID_RE.match(value))