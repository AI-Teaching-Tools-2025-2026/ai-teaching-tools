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

SCRIPT_DIR = Path(__file__).resolve().parent
QUIZ_OUTPUT_DIR = SCRIPT_DIR / "generated_quizzes"

# The textbook PDF lives one level up in rag_pipeline/
DEFAULT_PDF = (
    SCRIPT_DIR.parent / "rag_pipeline"
    / "Research-Methods-in-Psychology-1641401927 (1) copy.pdf"
)

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
        log.info("STEP 2: Would build 1 question_bank doc from %d quiz JSON files",
                 len(json_files))
        log.info("=" * 60)
        total_questions = 0
        for fp in json_files:
            quiz = json.loads(fp.read_text(encoding="utf-8"))
            n_q = len(quiz.get("questions", []))
            total_questions += n_q
            log.info(
                "  + %s/%s  →  quizId=%s  section=%s  questions=%d",
                fp.parent.name,
                fp.name,
                quiz.get("quizId", "?"),
                quiz.get("section", "?"),
                n_q,
            )
        log.info("  Would upsert 1 question_bank doc: %d sections, %d questions",
                 len(json_files), total_questions)
        log.info("")
        log.info("Run without --dry-run to actually write to MongoDB.")
        return


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
        textbook_title = existing.get("title", "")
    else:
        textbook_title = args.pdf.stem.replace("_", " ").replace("-", " ")
        doc = {
            "textbookId": textbook_id,
            "filename": args.pdf.name,
            "title": textbook_title,
            "sha256": sha,
            "totalChapters": 13,
            "pipelineStatus": "uploaded",
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
        }
        textbooks_coll.insert_one(doc)
        log.info("  Inserted textbook metadata: %s", textbook_id)

    log.info("")
    log.info("=" * 60)
    log.info("STEP 2: Building question bank (one doc per textbook)")
    log.info("=" * 60)
    log.info("  Found %d quiz JSON files", len(json_files))

    qbank_coll = db["question_bank"]

    # Drop legacy multi-field index from prior schema, if it exists
    try:
        qbank_coll.drop_index("textbookId_quizId_unique")
        log.info("  Dropped legacy index textbookId_quizId_unique")
    except Exception:
        pass  # Index does not exist — that is fine

    # Unique index on textbookId (one question bank doc per textbook)
    qbank_coll.create_index(
        "textbookId",
        unique=True,
        name="textbookId_unique",
    )

    # ── Build the sections array ─────────────────────────────────────

    sections = []
    skipped = 0

    for fp in json_files:
        quiz = json.loads(fp.read_text(encoding="utf-8"))

        if quiz.get("_validation_errors"):
            log.warning("  SKIP %s (has validation errors)", fp.name)
            skipped += 1
            continue

        sections.append({
            "section":     quiz.get("section"),        # e.g. "Chapter 1"
            "quizId":      quiz.get("quizId"),         # e.g. "QUIZ_SONNET_CH01"
            "sourceModel": fp.parent.name,             # "opus" or "sonnet"
            "sourceFile":  fp.name,
            "questions":   quiz.get("questions", []),
        })
        log.info(
            "  + %s/%s  →  quizId=%s  (%d questions)",
            fp.parent.name,
            fp.name,
            quiz.get("quizId"),
            len(quiz.get("questions", [])),
        )

    # ── Upsert the single question_bank document ─────────────────────

    now_iso = datetime.now(timezone.utc).isoformat()
    bank_doc = {
        "textbookId":    textbook_id,
        "title":         textbook_title,
        "sectionCount":  len(sections),
        "questionCount": sum(len(s["questions"]) for s in sections),
        "sections":      sections,
        "seededAt":      now_iso,
    }

    qbank_coll.replace_one(
        {"textbookId": textbook_id},
        bank_doc,
        upsert=True,
    )

    # Update pipeline status
    textbooks_coll.update_one(
        {"textbookId": textbook_id},
        {"$set": {"pipelineStatus": "quizzes_seeded"}},
    )

if __name__ == "__main__":
    main()