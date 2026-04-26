from fastapi import APIRouter, Depends, HTTPException
from db.utils import get_instructor_db
from .models import QuestionBankCreate
from datetime import datetime
import uuid

question_bank_router = APIRouter(prefix="/question_bank", tags=["Question Bank"])

@question_bank_router.get("/fetch_question_banks")
async def fetch_question_banks(courseId: str, db=Depends(get_instructor_db)):
    # Only return fields needed by the frontend table to reduce payload size
    projection = {
        "_id": 1,
        "title": 1,
        "chapter": 1,
        "courseID": 1,
        "sourceFile": 1,
        "createdAt": 1,
        "lastModified": 1,
        "questionCount": 1,
        "questions": 1, 
    }

    question_banks = await db["question_banks"].find(
        {"courseID": courseId},
        projection,
    ).to_list(None)
    return question_banks

@question_bank_router.get("/{questionBankId}")
async def get_question_bank_by_id(questionBankId: str, db=Depends(get_instructor_db)):
    question_bank = await db["question_banks"].find_one({"_id": questionBankId})

    if not question_bank:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    return question_bank

@question_bank_router.post("")
async def create_question_bank(payload: QuestionBankCreate, db=Depends(get_instructor_db)):
    question_bank = payload.model_dump()
    
    question_bank["_id"] = f"QB{uuid.uuid4().hex[:6].upper()}"

    await db["question_banks"].insert_one(question_bank)
    
    return question_bank

@question_bank_router.put("/{questionBankId}")
async def update_question_bank(questionBankId: str, payload: QuestionBankCreate, db=Depends(get_instructor_db)):
    question_bank = payload.model_dump()
    question_bank["_id"] = questionBankId
    
    question_bank["lastModified"] = datetime.now().isoformat()

    await db["question_banks"].replace_one({"_id": questionBankId}, question_bank)

    return question_bank

@question_bank_router.delete("/{questionBankId}")
async def delete_question_bank_by_id(questionBankId: str, db=Depends(get_instructor_db)):
    result = await db["question_banks"].delete_one({"_id": questionBankId})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    return {"message": "Question Bank deleted successfully"}

@question_bank_router.post("/{questionBankId}/duplicate")
async def duplicate_question_bank(questionBankId: str, db=Depends(get_instructor_db)):
    question_bank = await db["question_banks"].find_one({"_id": questionBankId})

    if not question_bank:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    question_bank.pop("_id", None)

    current_time = datetime.now().isoformat()
    
    question_bank["_id"] = f"QB{uuid.uuid4().hex[:6].upper()}"
    question_bank["title"] = f"{question_bank.get('title', '')} Copy"
    question_bank["createdAt"] = current_time
    question_bank["lastModified"] = current_time

    await db["question_banks"].insert_one(question_bank)
    
    return question_bank