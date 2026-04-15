"""
Quiz Bank Pipeline — MongoDB Operations

Prerequisites
-------------
    pip install pymongo

Usage
-----
    # Upload all generated JSON files:
    python mongo_operations.py upload

    # List all stored quizzes:
    python mongo_operations.py list

    # Retrieve a specific quiz:
    python mongo_operations.py get QUIZ_OPUS_CH01

    # Retrieve all quizzes for a chapter:
    python mongo_operations.py chapter "Chapter 1"

    # Delete a quiz:
    python mongo_operations.py delete QUIZ_OPUS_CH01
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

from backend.AI_core.quiz_pipeline.config import (
    MONGO_COLLECTION,
    MONGO_DB_NAME,
    MONGO_URI,
    OUTPUT_DIR,
)

log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)

# ---------------------------------------------------------------------------
# MongoDB connection 
# ---------------------------------------------------------------------------

_client = None
_collection = None


def _get_collection():
    """Return the pymongo Collection, creating the connection on first call."""
    global _client, _collection
    if _collection is not None:
        return _collection

    try:
        from pymongo import MongoClient
    except ImportError:
        log.error("pymongo is not installed.  Run:  pip install pymongo")
        sys.exit(1)

    _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Verify connectivity
    _client.admin.command("ping")
    log.info("Connected to MongoDB at %s", MONGO_URI)

    db = _client[MONGO_DB_NAME]
    _collection = db[MONGO_COLLECTION]

    # Ensure a unique index on quizId within each courseId
    _collection.create_index(
        [("courseId", 1), ("quizId", 1)],
        unique=True,
        name="courseId_quizId_unique",
    )
    return _collection


# ---------------------------------------------------------------------------
# CRUD operations
# ---------------------------------------------------------------------------

def upload_one(quiz: dict[str, Any]) -> str:
    """Insert a single quiz document into MongoDB.

    Parameters
    ----------
    quiz : dict
        A validated Quiz document (must include ``_id``, ``courseId``,
        ``section``, ``quizId``, and ``questions``).

    Returns
    -------
    str
        The inserted document's ``_id``.
    """
    coll = _get_collection()
    result = coll.insert_one(quiz)
    log.info("Inserted quiz '%s' → _id=%s", quiz.get("quizId"), result.inserted_id)
    return str(result.inserted_id)


def upload_quizzes(directory: Path | None = None) -> int:
    """Bulk-upload all quiz JSON files from the output directory.

    Walks the ``generated_quizzes/`` tree (or a custom *directory*) and
    inserts every ``.json`` file as a quiz document.  Existing documents
    with the same ``courseId + quizId`` are skipped (upsert is NOT used
    to prevent accidental overwrites).

    Returns
    -------
    int
        Number of documents successfully inserted.
    """
    root = directory or OUTPUT_DIR
    json_files = sorted(root.rglob("*.json"))
    if not json_files:
        log.warning("No .json files found under %s", root)
        return 0

    coll = _get_collection()
    inserted = 0

    for fp in json_files:
        quiz = json.loads(fp.read_text(encoding="utf-8"))

        if quiz.get("_validation_errors"):
            log.warning("Skipping %s (has validation errors)", fp.name)
            continue

        try:
            coll.insert_one(quiz)
            inserted += 1
            log.info("  ✓ Uploaded %s", fp.name)
        except Exception as exc:
            # Likely a duplicate-key error
            log.warning("  ⚠ Skipped %s: %s", fp.name, exc)

    log.info("Uploaded %d / %d files.", inserted, len(json_files))
    return inserted


def get_quiz(quiz_id: str) -> dict[str, Any] | None:
    """Retrieve a single quiz by its ``quizId`` field.
    """
    coll = _get_collection()
    doc = coll.find_one({"quizId": quiz_id})
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])  # make JSON-serializable
    return doc


def get_quizzes_for_chapter(section: str) -> list[dict[str, Any]]:
    """Retrieve all quiz documents for a given chapter/section.
    """
    coll = _get_collection()
    docs = list(coll.find({"section": section}))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


def get_all_quizzes() -> list[dict[str, Any]]:
    """Retrieve every quiz document in the collection."""
    coll = _get_collection()
    docs = list(coll.find())
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


def list_quiz_ids() -> list[dict[str, str]]:
    """Return a summary list of all quizzes: quizId, section, and question count."""
    coll = _get_collection()
    docs = coll.find({}, {"quizId": 1, "section": 1, "questions": 1})
    summaries = []
    for doc in docs:
        summaries.append({
            "quizId": doc.get("quizId", "?"),
            "section": doc.get("section", "?"),
            "questionCount": len(doc.get("questions", [])),
        })
    return summaries


def delete_quiz(quiz_id: str) -> bool:
    """Delete a quiz by its ``quizId``.
    """
    coll = _get_collection()
    result = coll.delete_one({"quizId": quiz_id})
    deleted = result.deleted_count > 0
    if deleted:
        log.info("Deleted quiz '%s'", quiz_id)
    else:
        log.warning("Quiz '%s' not found — nothing deleted", quiz_id)
    return deleted


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="MongoDB operations for the Quiz Bank pipeline."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("upload", help="Bulk-upload all generated quiz JSON files.")
    sub.add_parser("list", help="List all stored quiz IDs.")

    get_p = sub.add_parser("get", help="Retrieve a quiz by quizId.")
    get_p.add_argument("quiz_id", help="The quizId to retrieve (e.g. QUIZ_OPUS_CH01)")

    ch_p = sub.add_parser("chapter", help="Retrieve all quizzes for a chapter.")
    ch_p.add_argument("section", help='Section name (e.g. "Chapter 1")')

    del_p = sub.add_parser("delete", help="Delete a quiz by quizId.")
    del_p.add_argument("quiz_id", help="The quizId to delete")

    return parser.parse_args()


def main() -> None:
    args = _parse_args()

    if args.command == "upload":
        count = upload_quizzes()
        print(f"\nUploaded {count} quiz document(s) to MongoDB.")

    elif args.command == "list":
        summaries = list_quiz_ids()
        if not summaries:
            print("No quizzes found in the database.")
        else:
            print(f"\n{'quizId':<25} {'section':<15} {'# questions':>11}")
            print("-" * 53)
            for s in summaries:
                print(f"{s['quizId']:<25} {s['section']:<15} {s['questionCount']:>11}")

    elif args.command == "get":
        doc = get_quiz(args.quiz_id)
        if doc:
            print(json.dumps(doc, indent=2, ensure_ascii=False))
        else:
            print(f"Quiz '{args.quiz_id}' not found.")

    elif args.command == "chapter":
        docs = get_quizzes_for_chapter(args.section)
        if docs:
            print(json.dumps(docs, indent=2, ensure_ascii=False))
        else:
            print(f"No quizzes found for section '{args.section}'.")

    elif args.command == "delete":
        if delete_quiz(args.quiz_id):
            print(f"Deleted '{args.quiz_id}'.")
        else:
            print(f"Quiz '{args.quiz_id}' not found.")


if __name__ == "__main__":
    main()
