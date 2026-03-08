from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
import shutil
import os
import uuid

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"http://127.0.0.1:8000/uploads/{filename}"}

REPAIR_CONFIG = {
    "Pothole": {"base": 1500, "actions": {"Low": "Monitor", "Medium": "Schedule repair", "High": "Immediate repair"}},
    "Broken road edge": {"base": 2000, "actions": {"Low": "Surface patch", "Medium": "Refill edge", "High": "Reconstruct edge"}},
    "Waterlogging": {"base": 1000, "actions": {"Low": "Clean drain", "Medium": "Upgrade pipe", "High": "New drainage system"}},
    "Missing manhole cover": {"base": 5000, "actions": {"Low": "Barricade", "Medium": "Order cover", "High": "Immediate replacement"}}
}

SEVERITY_MULTIPLIERS = {
    "Low": 1.0,
    "Medium": 1.5,
    "High": 2.0
}

PRIORITY_MAP = {
    "Low": "Low",
    "Medium": "Moderate",
    "High": "Critical"
}

def calculate_resolution_metrics(hazard_type: str, severity_level: str):
    config = REPAIR_CONFIG.get(hazard_type, REPAIR_CONFIG["Pothole"])
    base_cost = float(config.get("base", 1500))
    multiplier = float(SEVERITY_MULTIPLIERS.get(severity_level, 1.0))
    
    # Formula: repair_cost = base_cost * severity_multiplier
    estimated_cost = base_cost * multiplier
    priority = PRIORITY_MAP.get(severity_level, "Low")
    
    actions_dict = config.get("actions", {})
    recommended_action = actions_dict.get(severity_level, "Assessment required")
    
    return estimated_cost, priority, recommended_action

@router.post("/", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, db: Session = Depends(database.get_db)):
    # Calculate metrics based on type and severity
    cost, priority, action = calculate_resolution_metrics(report.hazard_type, report.severity)
    
    db_report = models.Report(
        user_id=report.user_id,
        latitude=report.latitude,
        longitude=report.longitude,
        image_url=report.image_url,
        area_name=report.area_name,
        hazard_type=report.hazard_type,
        severity=report.severity,
        severity_score=1.0 if report.severity == "Low" else (2.0 if report.severity == "Medium" else 3.0), # For legacy compat
        estimated_cost=cost,
        priority=priority,
        recommended_action=action
    )
    db.add(db_report)
    
    # Add points to user
    db_user = db.query(models.User).filter(models.User.id == report.user_id).first()
    if db_user:
        db_user.points += 10
        
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/", response_model=List[schemas.Report])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    reports = db.query(models.Report).offset(skip).limit(limit).all()
    for report in reports:
        report.verification_count = db.query(models.Confirmation).filter(
            models.Confirmation.report_id == report.id,
            models.Confirmation.confirmation_status == "Fixed"
        ).count()
    return reports

import math

def haversine(lat1, lon1, lat2, lon2):
    # Radius of the Earth in km
    R = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

@router.post("/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(database.get_db)):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db_report.status = "Marked Resolved"
    db.commit()
    return {"status": "Marked Resolved", "detail": "Waiting for community verification."}

@router.post("/{report_id}/confirm", response_model=schemas.Confirmation)
def confirm_repair(report_id: int, confirmation: schemas.ConfirmationCreate, db: Session = Depends(database.get_db)):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if db_report.status != "Marked Resolved":
        raise HTTPException(status_code=400, detail="Community verification only allowed for 'Marked Resolved' hazards.")

    # 1. Radius Check (1km)
    # Note: In a real app, we'd get user_lat/lon from the request or user profile
    # For this demo, we assume the confirmation includes coords or we mock it
    # schemas.ConfirmationCreate needs to support lat/lon, or we trust frontend
    dist = haversine(db_report.latitude, db_report.longitude, confirmation.latitude, confirmation.longitude)
    if dist > 1.0:
        raise HTTPException(status_code=403, detail=f"User too far for verification ({dist:.2f}km). Radius lock: 1km.")

    # 2. Prevent Duplicate Confirmation
    existing = db.query(models.Confirmation).filter(
        models.Confirmation.report_id == report_id,
        models.Confirmation.user_id == confirmation.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a verification protocol for this node.")

    # Create Confirmation
    db_confirm = models.Confirmation(
        report_id=report_id,
        user_id=confirmation.user_id,
        confirmation_status=confirmation.confirmation_status
    )
    db.add(db_confirm)
    
    # Add +5 points to confirming user
    conf_user = db.query(models.User).filter(models.User.id == confirmation.user_id).first()
    if conf_user:
        conf_user.points += 5
        
    # Consensus Logic
    if confirmation.confirmation_status == "Still Not Fixed":
        # IMMEDIATE REVERSION — clear all prior confirmations to restart
        db_report.status = "Reported"
        db.query(models.Confirmation).filter(models.Confirmation.report_id == report_id).delete()
    else:
        # BUG FIX: flush to include current confirmation in count before querying
        db.flush()
        fixed_count = db.query(models.Confirmation).filter(
            models.Confirmation.report_id == report_id,
            models.Confirmation.confirmation_status == "Fixed"
        ).count()
        
        # Now correctly triggers at exactly 3 votes
        if fixed_count >= 3:
            db_report.status = "Verified Resolved"
            # Award original reporter +30 points bonus
            reporter = db.query(models.User).filter(models.User.id == db_report.user_id).first()
            if reporter:
                reporter.points += 30

# ─── Admin Management Endpoints ───────────────────────────────────────────────

@router.patch("/{report_id}/admin", response_model=schemas.Report)
def admin_update_report(
    report_id: int,
    update: schemas.ReportStatusUpdate,
    db: Session = Depends(database.get_db)
):
    """Admin — update status, priority, or approve/reject a report."""
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    if update.admin_status is not None:
        valid_statuses = ["Pending", "In Progress", "Completed", "Rejected"]
        if update.admin_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")
        db_report.admin_status = update.admin_status
        db_report.status = update.admin_status  # Keep in sync with community status

    if update.priority is not None:
        db_report.priority = update.priority

    if update.is_approved is not None:
        db_report.is_approved = update.is_approved
        if not update.is_approved:
            db_report.status = "Rejected"
            db_report.admin_status = "Rejected"

    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    import datetime
    total_hazards = db.query(models.Report).count()
    unresolved_count = db.query(models.Report).filter(models.Report.status != "Verified Resolved").count()
    high_severity_pending = db.query(models.Report).filter(
        models.Report.severity == "High",
        models.Report.status != "Verified Resolved"
    ).count()
    
    resolved_reports = db.query(models.Report).filter(
        models.Report.status == "Verified Resolved"
    ).all()
    
    avg_resolution_hours = 0.0
    if resolved_reports:
        now = datetime.datetime.utcnow()
        total_hours = sum(
            (now - r.created_at).total_seconds() / 3600
            for r in resolved_reports if r.created_at
        )
        avg_resolution_hours = round(total_hours / len(resolved_reports), 1)
    
    return {
        "total_hazards": total_hazards,
        "unresolved_count": unresolved_count,
        "high_severity_pending": high_severity_pending,
        "avg_resolution_time_hours": avg_resolution_hours
    }
