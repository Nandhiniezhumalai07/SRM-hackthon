"""
routers/auth.py — Authentication endpoints
- POST /auth/register  : Register a new user account
- POST /auth/login     : Login as user or admin
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import models, schemas, database

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(password: str) -> str:
    """Simple SHA-256 hash (no external deps needed)."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed


@router.post("/register", response_model=schemas.LoginResponse)
def register(data: schemas.UserRegister, db: Session = Depends(database.get_db)):
    """Register a new user. Admins cannot register from the UI."""
    # Check if login ID already taken
    existing = db.query(models.User).filter(models.User.user_login_id == data.user_login_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="User ID already taken. Please choose another.")

    # Check email uniqueness
    if data.email:
        email_taken = db.query(models.User).filter(models.User.email == data.email).first()
        if email_taken:
            raise HTTPException(status_code=409, detail="Email already registered.")

    db_user = models.User(
        user_login_id=data.user_login_id,
        password_hash=hash_password(data.password),
        role="user",  # Always user on self-registration
        name=data.name,
        phone=data.phone,
        email=data.email,
        city=data.city,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.LoginResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    """Login as user or admin."""
    user = db.query(models.User).filter(models.User.user_login_id == data.user_login_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid ID or password.")

    if not verify_password(data.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Invalid ID or password.")

    # Role check — admin cannot login as user and vice versa
    if data.role == "admin" and user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not an admin.")
    if data.role == "user" and user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins must login with Admin role.")

    return user
