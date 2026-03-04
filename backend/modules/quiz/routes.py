from fastapi import APIRouter, Depends, HTTPException
from db.utils import get_instructor_db
from datetime import datetime
import uuid

quiz_router = APIRouter(prefix="/quiz", tags=["Quiz"])

@quiz_router.get("/fetch_quizzes")
async def fetch_quizzes(courseId: str, db=Depends(get_instructor_db)):
    quizzes = await db["quizzes"].find({"courseId": courseId}).to_list(None)
    return quizzes

@quiz_router.get("/{quizId}")
async def get_quiz_by_id(quizId: str, db=Depends(get_instructor_db)):
    quiz = await db["quizzes"].find_one({"_id": quizId})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

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

    new_quiz_id = f"QUIZ{uuid.uuid4().hex[:6].upper()}"
    quiz["_id"] = new_quiz_id
    quiz["quizStatus"] = "Draft"
    quiz["createdAt"] = datetime.now().isoformat()

    await db["quizzes"].insert_one(quiz)
    
    return quiz
