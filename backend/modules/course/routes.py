from fastapi import APIRouter, Depends, HTTPException, Request
from db.utils import get_instructor_db
from .models import CourseCreate
from modules.auth.jwt_service import verify_access_token
from datetime import datetime, timezone
from bson import ObjectId
import uuid
import logging

log = logging.getLogger(__name__)

courses_router = APIRouter(prefix="/courses", tags=["Courses"])


def _get_current_user(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "Not authenticated")
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "Invalid or expired token")
    return user_id


@courses_router.post("/create_course")
async def create_course(course: CourseCreate, request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)

    course_id = str(ObjectId())

    new_course = {
        "_id": course_id,
        "userID": user_id,
        "textbookID": course.textbookID,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "courseTitle": course.courseTitle,
        "courseTerm": course.courseTerm,
        "courseDescription": course.courseDescription,
        "imageSrc": course.imageSrc or "",
    }

    await db["courses"].insert_one(new_course)

    # ── Copy question bank into course-specific quizzes ──────────────
    # Find all master quizzes for this textbook
    bank_quizzes = await db["question_bank"].find(
        {"textbookId": course.textbookID}
    ).to_list(None)

    copied = 0
    for bq in bank_quizzes:
        course_quiz = {
            "_id": f"QUIZ{uuid.uuid4().hex[:6].upper()}",
            "courseId": course_id,
            "textbookId": course.textbookID,
            "quizTitle": f"{bq.get('section', 'Quiz')} Quiz",
            "quizStatus": "Draft",
            "section": bq.get("section", ""),
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "description": f"Auto-generated from question bank ({bq.get('sourceModel', 'unknown')})",
            "dueDate": "",
            "totalPoints": len(bq.get("questions", [])),
            "questions": [
                {
                    "questionId": q["questionId"],
                    "questionPoints": 1,
                    "question": q["question"],
                    "answers": q["answers"],
                }
                for q in bq.get("questions", [])
            ],
            # Lineage back to the master copy
            "sourceQuizId": bq.get("quizId"),
            "sourceModel": bq.get("sourceModel"),
        }
        await db["quizzes"].insert_one(course_quiz)
        copied += 1

    log.info("Course %s created — copied %d quizzes from question bank", course_id, copied)

    new_course["quizzesCopied"] = copied
    return new_course

@courses_router.get("/fetch_courses")
async def fetch_courses(request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)
    courses = await db["courses"].find({"userID": user_id}).to_list()
    return courses

# Make sure user actually owns the course (Dylantest shoudl not be able to access it)
@courses_router.get("/{course_id}")
async def get_course(course_id: str, request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)

    course = await db["courses"].find_one({"_id": course_id, "userID": user_id})
    if not course:
        raise HTTPException(403, "Not authorized to access this course or it does not exist")

    return {"message": "Access granted"}