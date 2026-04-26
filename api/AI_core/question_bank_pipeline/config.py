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

# Two models are used so the team can compare output quality side-by-side.
# Change these strings to swap in any Anthropic model.
MODELS: dict[str, str] = {
    "opus":   "claude-opus-4-5-20251101",
    "sonnet": "claude-sonnet-4-5-20250929",
}

# ---------------------------------------------------------------------------
# Base Path Resolution
# ---------------------------------------------------------------------------
# This ensures the script always finds files relative to this config file's 
# actual location, regardless of where you run the Python command from.
BASE_DIR: Path = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Chapter / Content Settings
# ---------------------------------------------------------------------------
TEXTBOOK_DIR: Path = BASE_DIR / "textbook_chapters"  # directory containing .txt chapter files

# Expected chapter file naming convention (matches the screenshot):
#   research_methods_in_psychology_chapter_01.txt  …  chapter_13.txt
CHAPTER_FILE_TEMPLATE: str = "research_methods_in_psychology_chapter_{chapter_num:02d}.txt"
TOTAL_CHAPTERS: int = 13  # chapters 01 – 13

# ---------------------------------------------------------------------------
# Question Bank Generation Parameters
# ---------------------------------------------------------------------------
QUESTIONS_PER_CHAPTER: int = 20   # questions generated per LLM call
ANSWERS_PER_QUESTION: int = 4     # exactly 4 multiple-choice options
COURSE_ID: str = "PSY_METHODS_01" # course identifier stored in every question bank doc

# Maximum tokens the LLM may return (generous to avoid truncation on 20 Qs)
MAX_TOKENS: int = 8192

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------
MONGO_URI: str = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME: str = "aiToolsDev"
MONGO_COLLECTION: str = "question_banks"

# ---------------------------------------------------------------------------
# Output / Logging
# ---------------------------------------------------------------------------
OUTPUT_DIR: Path = BASE_DIR / "generated_question_banks"  # raw JSON outputs saved here
LOG_LEVEL: str = "INFO"

# ---------------------------------------------------------------------------
# Convenience bundle
# ---------------------------------------------------------------------------
CONFIG: dict = {
    "ANTHROPIC_API_KEY": ANTHROPIC_API_KEY,
    "MODELS": MODELS,
    "TEXTBOOK_DIR": TEXTBOOK_DIR,
    "CHAPTER_FILE_TEMPLATE": CHAPTER_FILE_TEMPLATE,
    "TOTAL_CHAPTERS": TOTAL_CHAPTERS,
    "QUESTIONS_PER_CHAPTER": QUESTIONS_PER_CHAPTER,
    "ANSWERS_PER_QUESTION": ANSWERS_PER_QUESTION,
    "COURSE_ID": COURSE_ID,
    "MAX_TOKENS": MAX_TOKENS,
    "MONGO_URI": MONGO_URI,
    "MONGO_DB_NAME": MONGO_DB_NAME,
    "MONGO_COLLECTION": MONGO_COLLECTION,
    "OUTPUT_DIR": OUTPUT_DIR,
    "LOG_LEVEL": LOG_LEVEL,
}