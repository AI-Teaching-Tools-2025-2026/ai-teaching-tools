"""
Question Bank Pipeline — Configuration
======================================

Centralized configuration for the question bank generation pipeline.
All tunable parameters (models, paths, question counts, MongoDB
connection details) live here so nothing is hard-coded elsewhere.

Usage
-----
    from config import CONFIG
    print(CONFIG["MODELS"])
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Anthropic API
# ---------------------------------------------------------------------------
ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")

# Change this string to swap in any Anthropic model.
# best: claude-opus-4-7
# good: claude-sonnet-4-6
# okay: claude-haiku-4-5-20251001
MODEL = "claude-haiku-4-5-20251001"

# ---------------------------------------------------------------------------
# Base Path Resolution
# ---------------------------------------------------------------------------
# This ensures the script always finds files relative to this config file's 
# actual location, regardless of where you run the Python command from.
BASE_DIR: Path = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Question Bank Generation Parameters
# ---------------------------------------------------------------------------
QUESTIONS_PER_CHAPTER: int = 20   # questions generated per LLM call
ANSWERS_PER_QUESTION: int = 4     # exactly 4 multiple-choice options

# Maximum tokens the LLM may return (generous to avoid truncation on 20 Qs)
MAX_TOKENS: int = 8192

# ---------------------------------------------------------------------------
# Convenience bundle
# ---------------------------------------------------------------------------
CONFIG: dict = {
    "ANTHROPIC_API_KEY": ANTHROPIC_API_KEY,
    "MODEL": MODEL,
    "QUESTIONS_PER_CHAPTER": QUESTIONS_PER_CHAPTER,
    "ANSWERS_PER_QUESTION": ANSWERS_PER_QUESTION,
    "MAX_TOKENS": MAX_TOKENS
}