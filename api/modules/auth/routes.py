from fastapi import APIRouter, HTTPException, Response, Request, Depends
from .models import UserLogin, UserCreate, UserUpdate
from .jwt_service import create_access_token, verify_access_token
from configs.settings import settings
from db.utils import get_instructor_db
import uuid
from passlib.context import CryptContext

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

@auth_router.post("/register")
async def register_user(user_data: UserCreate, db = Depends(get_instructor_db)) -> dict:

    collection = db["users"]

    existing_user = await collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="username already exists."
        )
    
    user_id = str(uuid.uuid4())

    user_doc = {
        "_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": pwd_context.hash(user_data.password)
    }

    await collection.insert_one(user_doc)
    return {"message": "User created successfully!"}


@auth_router.post("/login")
async def login_user(user_data: UserLogin, response: Response, db = Depends(get_instructor_db)) -> dict:

    collection = db["users"]

    user = await collection.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(status_code=404, detail="user not found" )

    if not pwd_context.verify(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="incorrect password")

    token = create_access_token(user["_id"])

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=int(settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60),
        samesite="lax",
        secure=False, 
        path="/",
    )

    return {"message": "Logged in successfully"}


@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")

    return {"message": "Logged out"}


@auth_router.get("/user")
async def me(request: Request, db = Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid or expired token")

    user = await db["users"].find_one({"_id": user_id})

    return {
        "username": user["username"],
        "email": user["email"]
    }

@auth_router.put("/update")
async def update_user(request: Request, user_data: UserUpdate, db = Depends(get_instructor_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid or expired token")

    collection = db["users"]

    user = await collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    update_fields = {}

    if user_data.username is not None:
        # check if taken
        existing = await collection.find_one({
            "username": user_data.username,
            "_id": {"$ne": user_id}
        })
        if existing:
            raise HTTPException(status_code=409, detail="This username already exists")

        update_fields["username"] = user_data.username

    if user_data.email is not None:
        update_fields["email"] = user_data.email

    if user_data.new_password is not None:
        # verify current password
        if not pwd_context.verify(user_data.current_password, user["hashed_password"]):
            raise HTTPException(status_code=409, detail="Incorrect password")

        # hash new password
        update_fields["hashed_password"] = pwd_context.hash(user_data.new_password)

    await collection.update_one(
        {"_id": user_id},
        {"$set": update_fields}
    )

    return {"message": "User updated successfully"}