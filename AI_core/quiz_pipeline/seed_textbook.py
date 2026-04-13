#!/usr/bin/env python3
"""
seed_textbook.py — One-shot script to compile a textbook into MongoDB

  1. Hashes the textbook PDF → deterministic textbookId
  2. Stores textbook metadata in the ``textbooks`` collection
  3. Reads all generated quiz JSONs from ``generated_quizzes/``
  4. Inserts them into the ``question_bank`` collection, tagged with textbookId
  5. Creates a unique index on (textbookId, quizId) for dedup

After this, when an instructor creates a course and picks this textbook,
the course-creation endpoint copies quizzes from ``question_bank`` into
the course-specific ``quizzes`` collection.

Usage
    # With defaults (reads the PDF from rag_pipeline/, uses MONGO_URI env var):
    python seed_textbook.py

    # Point at a specific PDF and Mongo:
    python seed_textbook.py \\
        --pdf path/to/textbook.pdf \\
        --mongo "mongodb+srv://user:pass@cluster.mongodb.net" \\
        --db instructor_main

    # Dry run (shows what would happen, no writes):
    python seed_textbook.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)

# ── Paths (relative to this script in AI_core/quiz_pipeline/) ─────────

SCRIPT_DIR = Path(__file__).resolve().parent
QUIZ_OUTPUT_DIR = SCRIPT_DIR / "generated_quizzes"

# The textbook PDF lives one level up in rag_pipeline/
DEFAULT_PDF = (
    SCRIPT_DIR.parent / "rag_pipeline"
    / "Research-Methods-in-Psychology-1641401927 (1) copy.pdf"
)

# ── Helpers ───────────────────────────────────────────────────────────

def hash_pdf(pdf_path: Path) -> str:
    """SHA-256 hash of the PDF file."""
    h = hashlib.sha256()
    with open(pdf_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def make_textbook_id(sha: str) -> str:
    return f"TB_{sha[:12]}"


# ── Main ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Seed a textbook + its question bank into MongoDB."
    )
    parser.add_argument(
        "--pdf",
        type=Path,
        default=DEFAULT_PDF,
        help=f"Path to the textbook PDF (default: {DEFAULT_PDF.name})",
    )
    parser.add_argument(
        "--mongo",
        default=os.environ.get("MONGO_URI")
             or os.environ.get("INSTRUCTOR_MONGODB_URL")
             or "mongodb://localhost:27017",
        help="MongoDB connection URI (or set MONGO_URI / INSTRUCTOR_MONGODB_URL env var)",
    )
    parser.add_argument(
        "--db",
        default=os.environ.get("INSTRUCTOR_MAIN_DB", "instructor_main"),
        help="MongoDB database name (default: instructor_main)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would happen without writing to MongoDB.",
    )
    args = parser.parse_args()

    # ── Validate inputs ──────────────────────────────────────────────

    if not args.pdf.exists():
        log.error("PDF not found: %s", args.pdf)
        sys.exit(1)

    if not QUIZ_OUTPUT_DIR.exists():
        log.error("Quiz output directory not found: %s", QUIZ_OUTPUT_DIR)
        log.error("Run quiz_generator.py first to generate quiz JSONs.")
        sys.exit(1)

    json_files = sorted(QUIZ_OUTPUT_DIR.rglob("*.json"))
    if not json_files:
        log.error("No .json files found in %s", QUIZ_OUTPUT_DIR)
        sys.exit(1)

    log.info("=" * 60)
    log.info("STEP 1: Hashing PDF")
    log.info("=" * 60)
    log.info("  PDF: %s", args.pdf.name)

    sha = hash_pdf(args.pdf)
    textbook_id = make_textbook_id(sha)

    log.info("  SHA-256:     %s", sha[:24] + "...")
    log.info("  textbookId:  %s", textbook_id)

    if args.dry_run:
        log.info("  [DRY RUN] Would store textbook metadata in MongoDB")
        log.info("")
        log.info("=" * 60)
        log.info("STEP 2: Would seed %d quiz JSON files", len(json_files))
        log.info("=" * 60)
        for fp in json_files:
            quiz = json.loads(fp.read_text(encoding="utf-8"))
            log.info(
                "  %s/%s  →  quizId=%s  section=%s  questions=%d",
                fp.parent.name,
                fp.name,
                quiz.get("quizId", "?"),
                quiz.get("section", "?"),
                len(quiz.get("questions", [])),
            )
        log.info("")
        log.info("Run without --dry-run to actually write to MongoDB.")
        return

    # ── Connect to MongoDB ───────────────────────────────────────────

    try:
        from pymongo import MongoClient
    except ImportError:
        log.error("pymongo not installed.  Run:  pip install pymongo")
        sys.exit(1)

    client = MongoClient(args.mongo, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    log.info("  Connected to MongoDB")

    db = client[args.db]

    textbooks_coll = db["textbooks"]
    existing = textbooks_coll.find_one({"textbookId": textbook_id})

    if existing:
        log.info("  Textbook %s already exists in MongoDB — skipping insert", textbook_id)
    else:
        doc = {
            "textbookId": textbook_id,
            "filename": args.pdf.name,
            "title": args.pdf.stem.replace("_", " ").replace("-", " "),
            "sha256": sha,
            "totalChapters": 13,
            "pipelineStatus": "uploaded",
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
        }
        textbooks_coll.insert_one(doc)
        log.info("  Inserted textbook metadata: %s", textbook_id)

    log.info("")
    log.info("=" * 60)
    log.info("STEP 2: Seeding question bank")
    log.info("=" * 60)
    log.info("  Found %d quiz JSON files", len(json_files))

    qbank_coll = db["question_bank"]

    # Create unique index
    qbank_coll.create_index(
        [("textbookId", 1), ("quizId", 1)],
        unique=True,
        name="textbookId_quizId_unique",
    )

    inserted = 0
    skipped = 0

    for fp in json_files:
        quiz = json.loads(fp.read_text(encoding="utf-8"))

        if quiz.get("_validation_errors"):
            log.warning("  SKIP %s (has validation errors)", fp.name)
            skipped += 1
            continue

        # Tag with real textbookId + source info
        quiz["textbookId"] = textbook_id
        quiz["sourceModel"] = fp.parent.name   # "opus" or "sonnet"
        quiz["sourceFile"] = fp.name
        quiz["seededAt"] = datetime.now(timezone.utc).isoformat()

        try:
            qbank_coll.insert_one(quiz)
            inserted += 1
            log.info(
                "  ✓ %s/%s  →  quizId=%s  (%d questions)",
                fp.parent.name,
                fp.name,
                quiz.get("quizId"),
                len(quiz.get("questions", [])),
            )
        except Exception as exc:
            # Duplicate key = already seeded
            log.info("  ○ %s/%s  →  already exists, skipped", fp.parent.name, fp.name)
            skipped += 1

    # Update pipeline status
    textbooks_coll.update_one(
        {"textbookId": textbook_id},
        {"$set": {"pipelineStatus": "quizzes_seeded"}},
    )


    log.info("")
    log.info("=" * 60)
    log.info("DONE")
    log.info("=" * 60)
    log.info("  textbookId:  %s", textbook_id)
    log.info("  Inserted:    %d quiz documents", inserted)
    log.info("  Skipped:     %d (dupes or validation errors)", skipped)
    log.info("")
    log.info("  Next steps:")
    log.info("    1. Use this textbookId when creating courses in the UI")
    log.info("    2. The course creation endpoint will auto-copy these")
    log.info("       quizzes into the course-specific quiz collection")
    log.info("")
    log.info("  To verify, run:")
    log.info("    python seed_textbook.py --dry-run")
    log.info("  Or in mongo shell:")
    log.info('    db.question_bank.find({textbookId: "%s"}).count()', textbook_id)


if __name__ == "__main__":
    main()
