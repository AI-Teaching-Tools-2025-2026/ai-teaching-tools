from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from db.utils import get_instructor_db
from modules.auth.jwt_service import verify_access_token
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import shutil

textbook_router = APIRouter(prefix="/textbook", tags=["Textbook"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploaded_textbooks"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
QUIZ_OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent
    / "AI_core" / "quiz_pipeline" / "generated_quizzes"
)


def _get_current_user(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "Not authenticated")
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "Invalid or expired token")
    return user_id


def _hash_bytes(data: bytes) -> str:
    """Return the full SHA-256 hex digest of *data*."""
    return hashlib.sha256(data).hexdigest()


def _make_textbook_id(sha: str) -> str:
    """Deterministic short ID derived from the SHA-256 digest."""
    return f"TB_{sha[:12]}"


# ── Upload ────────────────────────────────────────────────────────────────

@textbook_router.post("/upload")
async def upload_textbook(
    request: Request,
    file: UploadFile = File(...),
    db=Depends(get_instructor_db),
):
    """
    Upload a textbook PDF.

    Returns the *textbookId*.  If the exact same PDF was uploaded before,
    this returns the existing textbookId (idempotent).
    """
    _get_current_user(request)

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(400, "Uploaded file is empty")

    sha = _hash_bytes(pdf_bytes)
    textbook_id = _make_textbook_id(sha)

    # Check if this exact PDF already exists
    existing = await db["textbooks"].find_one({"textbookId": textbook_id})
    if existing:
        existing["_id"] = str(existing["_id"])
        return {"textbookId": textbook_id, "alreadyExisted": True, **existing}

    # Save the PDF to disk
    pdf_path = UPLOAD_DIR / f"{textbook_id}.pdf"
    pdf_path.write_bytes(pdf_bytes)

    # Store metadata in MongoDB
    doc = {
        "textbookId": textbook_id,
        "filename": file.filename,
        "title": Path(file.filename).stem.replace("_", " ").replace("-", " "),
        "sha256": sha,
        "totalChapters": 0,           # updated after chapter extraction
        "pipelineStatus": "uploaded",  # uploaded → chapters_extracted → quizzes_seeded
        "uploadedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db["textbooks"].insert_one(doc)
    doc["_id"] = str(doc["_id"])

    return {"textbookId": textbook_id, "alreadyExisted": False, **doc}


# ── List / Get ────────────────────────────────────────────────────────────

@textbook_router.get("/list")
async def list_textbooks(request: Request, db=Depends(get_instructor_db)):
    _get_current_user(request)
    docs = await db["textbooks"].find({}, {"sha256": 0}).to_list(None)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs


@textbook_router.get("/{textbook_id}")
async def get_textbook(
    textbook_id: str,
    request: Request,
    db=Depends(get_instructor_db),
):
    _get_current_user(request)
    doc = await db["textbooks"].find_one({"textbookId": textbook_id})
    if not doc:
        raise HTTPException(404, "Textbook not found")
    doc["_id"] = str(doc["_id"])
    return doc


# ── Seed question bank ───────────────────────────────────────────────────

@textbook_router.post("/{textbook_id}/seed_quiz_bank")
async def seed_quiz_bank(
    textbook_id: str,
    request: Request,
    db=Depends(get_instructor_db),):
    
    _get_current_user(request)

    tb = await db["textbooks"].find_one({"textbookId": textbook_id})
    if not tb:
        raise HTTPException(404, "Textbook not found")

    if not QUIZ_OUTPUT_DIR.exists():
        raise HTTPException(
            404,
            f"Quiz output directory not found at {QUIZ_OUTPUT_DIR}. "
            "Run the quiz pipeline first.",
        )

    import json

    json_files = sorted(QUIZ_OUTPUT_DIR.rglob("*.json"))
    if not json_files:
        raise HTTPException(404, "No generated quiz JSON files found")

    sections = []
    skipped = 0
    errors = []

    for fp in json_files:
        try:
            quiz = json.loads(fp.read_text(encoding="utf-8"))
        except Exception as e:
            errors.append(f"{fp.name}: {e}")
            continue

        if quiz.get("_validation_errors"):
            skipped += 1
            continue

        sections.append({
            "section":     quiz.get("section"),
            "quizId":      quiz.get("quizId"),
            "sourceModel": fp.parent.name,
            "sourceFile":  fp.name,
            "questions":   quiz.get("questions", []),
        })

  
    bank_doc = {
        "textbookId":    textbook_id,
        "title":         tb.get("title", ""),
        "sectionCount":  len(sections),
        "questionCount": sum(len(s["questions"]) for s in sections),
        "sections":      sections,
        "seededAt":      datetime.now(timezone.utc).isoformat(),
    }

    await db["question_bank"].replace_one(
        {"textbookId": textbook_id},
        bank_doc,
        upsert=True,
    )

    # Update textbook pipeline status
    await db["textbooks"].update_one(
        {"textbookId": textbook_id},
        {"$set": {"pipelineStatus": "quizzes_seeded"}},
    )

    return {
        "textbookId":    textbook_id,
        "sectionCount":  bank_doc["sectionCount"],
        "questionCount": bank_doc["questionCount"],
        "skipped":       skipped,
        "errors":        errors,
    }