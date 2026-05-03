import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from db.utils import get_instructor_db
from .models import QuestionBankCreate
from datetime import datetime
from questionBankPipeline.question_bank_generator import generate_for_chapter
from questionBankPipeline.pdfParser import pdfParser
from pydantic import ValidationError
import uuid
import aiofiles
import tempfile
import os

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

async def process_question_bank_background(courseId: str, temp_filename: str, original_filename: str, db, jobId: str):
    print(f"Background task started for {original_filename}")
    
    # Open the file and parse it
    print(f"Starting PDF parsing for {original_filename}")
    parsed_data = await asyncio.to_thread(pdfParser, temp_filename)
    
    textbook_name = parsed_data["textbookName"]
    chapters = parsed_data["chapters"]
    print(f"PDF parsed successfully. Textbook: {textbook_name}, Chapters: {len(chapters)}")

    for chapter_data in chapters:
        chapter_num = chapter_data["chapterNum"]
        chapter_title = chapter_data["chapterTitle"]
        chapter_text = chapter_data["text"]
        
        print(f"Chapter {chapter_num}: {chapter_title} - Text length: {len(chapter_text)}")
        print(f"Generating questions for Chapter {chapter_num}: {chapter_title}")
        try:
            question_bank = await asyncio.to_thread(
                generate_for_chapter,
                textbook_name=textbook_name, 
                chapter_num=chapter_num, 
                chapter_title=chapter_title, 
                chapter_text=chapter_text
            )
        except ValueError as e:
            print(f"Failed to generate questions for Chapter {chapter_num}: {e}")
            question_bank = None 
        
        if question_bank is None:
            print(f"No question bank generated for Chapter {chapter_num}")
            continue

        current_time = datetime.now().isoformat()

        question_bank.update({
            "courseID": courseId,
            "sourceFile": original_filename,
            "createdAt": current_time,
            "lastModified": current_time,
        })
        
        print(f"Validating and saving question bank for Chapter {chapter_num}")
        try:
            validated_qb = QuestionBankCreate(**question_bank)
            final_db_document = validated_qb.model_dump(by_alias=True)
            final_db_document["_id"] = f"QB{uuid.uuid4().hex[:6].upper()}"
            await db["question_banks"].insert_one(final_db_document)
            print(f"Successfully saved Question Bank for Chapter {chapter_num}")
            
        except ValidationError as e:
            print(f"CRITICAL VALIDATION FAILED for Chapter {chapter_num}. Not saving to DB.")
            print(e.errors())
            continue

    # update job status
    await db["jobs"].update_one(
        {"_id": jobId}, 
        {"$set": {"status": "completed", "completedAt": datetime.now().isoformat()}}
    )
    print(f"Background task completed for {original_filename}")
    
    # Clean up temp file
    try:
        os.unlink(temp_filename)
        print(f"Temporary file {temp_filename} cleaned up")
    except OSError:
        print(f"Failed to clean up temporary file {temp_filename}")

# CODE CITATION (Lines 167 - 176)
# Author: Chris
# Link: https://stackoverflow.com/questions/65342833/fastapi-uploadfile-is-slow-compared-to-flask/70667530#70667530 
# Purpose: More efficient way to handle files larger than 1 MB (which is most textbook files) 
@question_bank_router.post("/generate_question_banks")
async def generate_question_bank(courseId: str, request: Request, background_tasks: BackgroundTasks, db=Depends(get_instructor_db)):
    try: 
        original_filename = request.headers.get('filename', 'uploaded_file.pdf')
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_filename = temp_file.name
        
        async with aiofiles.open(temp_filename, 'wb') as f:
            async for chunk in request.stream():
                await f.write(chunk)

        # create job to track status 
        jobId = f"JOB{uuid.uuid4().hex[:6].upper()}"
        job_document = {
            "_id": jobId,
            "courseId": courseId,
            "filename": original_filename,
            "status": "processing",
            "createdAt": datetime.now().isoformat()
        }
        await db["jobs"].insert_one(job_document)

        background_tasks.add_task(process_question_bank_background, courseId, temp_filename, original_filename, db, jobId)
        
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong.")
   
    return {
        "message": "Question Bank generation started in the background.", 
        "jobId": jobId 
    }

@question_bank_router.get("/jobs/{jobId}")
async def get_job_status(jobId: str, db=Depends(get_instructor_db)):
    job = await db["jobs"].find_one({"_id": jobId})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"jobId": job["_id"], "status": job["status"]}