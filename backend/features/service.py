from fastapi import APIRouter, HTTPException, status
from .models import UserLogin, UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])

# imports the app basically, to avoid circular dependency from main 
def get_current_app(): 
    import importlib 
    module = importlib.import_module("main")
    return getattr(module, "app")


@router.post("/signup")
async def signup_user(user_data: UserCreate) -> dict:
    app = get_current_app()

    collection_name = "users"
    collection = app.mongodb.get_collection(collection_name)

    existing_user = await collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="username already exists."
        )

    await collection.insert_one(user_data.model_dump())
    return {"message": "User created successfully!"}


@router.post("/login")
async def login_user(user_data: UserLogin) -> dict:
    app = get_current_app()

    collection_name = "users"
    collection = app.mongodb.get_collection(collection_name)

    user = await collection.find_one({"username": user_data.username})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )

    if user["password"] != user_data.password: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect password"
        )

    return {"message": "Login successful!"}