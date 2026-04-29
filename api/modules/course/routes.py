from fastapi import APIRouter, Depends, HTTPException, Request
from db.utils import get_instructor_db
from .models import CourseCreate, CourseUpdate
from modules.auth.jwt_service import verify_access_token
from datetime import datetime
from bson import ObjectId

courses_router = APIRouter(prefix="/courses", tags=["Courses"])

@courses_router.post("/create_course")
async def create_course(course: CourseCreate, request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    new_course = {
        "_id": str(ObjectId()),
        "userID": user_id,
        # "textbookID": course.textbookID,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "courseTitle": course.courseTitle,
        "courseTerm": course.courseTerm,
        "courseDescription": course.courseDescription,
        "imageSrc": course.imageSrc or "",
        "cardColor": course.cardColor or "#2563eb",
    }

    await db["courses"].insert_one(new_course)
    return new_course

@courses_router.get("/fetch_courses")
async def fetch_courses(request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    courses = await db["courses"].find({"userID": user_id}).to_list()
    return courses

# Make sure user actually owns the course (Dylantest shoudl not be able to access it)
@courses_router.get("/{course_id}")
async def get_course(course_id: str, request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    course = await db["courses"].find_one({"_id": course_id, "userID": user_id})
    if not course:
        raise HTTPException(403, "Not authorized to access this course or it does not exist")

    return course



@courses_router.put("/{course_id}")
async def update_course(course_id: str, course_update: CourseUpdate, request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    # Ensure the user owns the course
    existing = await db["courses"].find_one({"_id": course_id, "userID": user_id})
    if not existing:
        raise HTTPException(403, "Not authorized to edit this course or it does not exist")

    update_data = {k: v for k, v in course_update.dict().items() if v is not None}
    if not update_data:
        return existing

    await db["courses"].update_one({"_id": course_id}, {"$set": update_data})
    updated = await db["courses"].find_one({"_id": course_id})
    return updated

@courses_router.delete("/{course_id}")
async def delete_course(course_id: str, request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    # Ensure the user owns the course
    existing = await db["courses"].find_one({"_id": course_id, "userID": user_id})
    if not existing:
        raise HTTPException(403, "Not authorized to delete this course or it does not exist")

    await db["courses"].delete_one({"_id": course_id})

    return {"message": "Course deleted successfully"}