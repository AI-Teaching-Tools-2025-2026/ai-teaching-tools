from fastapi import APIRouter, HTTPException, Response, Request
from .models import UserLogin, UserCreate
from .jwt_service import create_access_token, verify_access_token
from configs.settings import settings
import uuid
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# imports the app basically, to avoid circular dependency from main 
def get_current_app(): 
    import importlib 
    module = importlib.import_module("main")
    return getattr(module, "app")


@router.post("/register")
async def register_user(user_data: UserCreate) -> dict:
    app = get_current_app()

    collection = app.mongodb.get_collection("users")

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


@router.post("/login")
async def login_user(user_data: UserLogin, response: Response) -> dict:
    app = get_current_app()

    collection = app.mongodb.get_collection("users")

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


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")

    return {"message": "Logged out"}


@router.get("/username")
async def me(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="not authenticated")

    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid or expired token")

    app = get_current_app()
    user = await app.mongodb.get_collection("users").find_one({"_id": user_id})

    return {
        "username": user["username"]
    }