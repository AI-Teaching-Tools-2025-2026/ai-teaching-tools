from fastapi import APIRouter, Depends, HTTPException, Request
from db.utils import get_instructor_db
from modules.auth.jwt_service import verify_access_token

courses_router = APIRouter(prefix="/courses", tags=["Courses"])

@courses_router.get("/retrieve_courses")
async def retrieve_courses(request: Request, db=Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(401, "invalid or expired token")

    courses = await db["courses"].find({"userID": user_id}).to_list()
    return courses