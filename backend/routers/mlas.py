"""
routers/mlas.py — MLA Directory endpoints
- GET /mlas/         : List all MLAs
- POST /mlas/        : Add a new MLA
- DELETE /mlas/{id}  : Delete an MLA
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database

router = APIRouter(
    prefix="/mlas",
    tags=["MLAs"]
)

@router.get("/", response_model=List[schemas.MLA])
def get_mlas(db: Session = Depends(database.get_db)):
    """Fetch all MLAs in the directory."""
    return db.query(models.MLA).all()

@router.post("/", response_model=schemas.MLA)
def create_mla(mla: schemas.MLACreate, db: Session = Depends(database.get_db)):
    """Add a new MLA into the directory."""
    db_mla = models.MLA(
        name=mla.name,
        constituency=mla.constituency,
        mobile=mla.mobile,
        address=mla.address
    )
    db.add(db_mla)
    db.commit()
    db.refresh(db_mla)
    return db_mla

@router.delete("/{mla_id}")
def delete_mla(mla_id: int, db: Session = Depends(database.get_db)):
    """Delete an MLA by ID."""
    db_mla = db.query(models.MLA).filter(models.MLA.id == mla_id).first()
    if not db_mla:
        raise HTTPException(status_code=404, detail="MLA not found")
    db.delete(db_mla)
    db.commit()
    return {"message": "MLA deleted successfully"}
