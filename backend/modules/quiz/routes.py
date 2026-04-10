from fastapi import APIRouter, Depends, HTTPException
from db.utils import get_instructor_db
from .models import QuizCreate
from datetime import datetime
import uuid

quiz_router = APIRouter(prefix="/quiz", tags=["Quiz"])

@quiz_router.get("/fetch_quizzes")
async def fetch_quizzes(courseId: str, db=Depends(get_instructor_db)):
    # Only return fields needed by the frontend table to reduce payload size
    projection = {
        "_id": 1,
        "quizTitle": 1,
        "quizStatus": 1,
        "section": 1,
        "courseId": 1,
        "createdAt": 1,
        "dueDate": 1,
        "totalPoints": 1,
        "questions": 1,
    }

    quizzes = await db["quizzes"].find(
        {"courseId": courseId},
        projection,
    ).to_list(None)
    return quizzes

@quiz_router.get("/{quizId}")
async def get_quiz_by_id(quizId: str, db=Depends(get_instructor_db)):
    quiz = await db["quizzes"].find_one({"_id": quizId})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return quiz

@quiz_router.post("")
async def create_quiz(payload: QuizCreate, db=Depends(get_instructor_db)):
    quiz = payload.model_dump()
    quiz["_id"] = f"QUIZ{uuid.uuid4().hex[:6].upper()}"

    await db["quizzes"].insert_one(quiz)
    
    return quiz

@quiz_router.put("/{quizId}")
async def update_quiz(quizId: str, payload: QuizCreate, db=Depends(get_instructor_db)):
    quiz = payload.model_dump()
    quiz["_id"] = quizId

    await db["quizzes"].replace_one({"_id": quizId}, quiz)

    return quiz

@quiz_router.delete("/{quizId}")
async def delete_quiz_by_id(quizId: str, db=Depends(get_instructor_db)):
    result = await db["quizzes"].delete_one({"_id": quizId})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {"message": "Quiz deleted successfully"}

@quiz_router.post("/{quizId}/duplicate")
async def duplicate_quiz(quizId: str, db=Depends(get_instructor_db)):
    quiz = await db["quizzes"].find_one({"_id": quizId})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz.pop("_id", None)

    quiz["_id"] = f"QUIZ{uuid.uuid4().hex[:6].upper()}"
    quiz["quizTitle"] = f"{quiz.get("quizTitle", "")} Copy"
    quiz["quizStatus"] = "Draft"
    quiz["createdAt"] = datetime.now().isoformat()

    await db["quizzes"].insert_one(quiz)
    
    return quiz