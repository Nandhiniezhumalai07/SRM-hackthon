from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists — return existing user instead of crashing
    if user.email:
        existing = db.query(models.User).filter(models.User.email == user.email).first()
        if existing:
            return existing

    db_user = models.User(
        name=user.name, 
        city=user.city,
        email=user.email,
        phone=user.phone,
        bio=user.bio,
        constituency=user.constituency,
        village=user.village,
        ward=user.ward,
        panchayat=user.panchayat
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/leaderboard/{city}", response_model=List[schemas.User])
def get_leaderboard(city: str, db: Session = Depends(database.get_db)):
    """Get top 10 users per city for leaderboard."""
    top_users = db.query(models.User).filter(models.User.city == city).order_by(models.User.points.desc()).limit(10).all()
    return top_users
