from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Auth fields
    user_login_id = Column(String, unique=True, index=True, nullable=True)  # login username
    password_hash = Column(String, nullable=True)
    role = Column(String, default="user")  # "user" or "admin"
    # Profile fields
    name = Column(String, index=True)
    profile_completed = Column(Boolean, default=False)
    points = Column(Integer, default=0)
    city = Column(String, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    constituency = Column(String, nullable=True)
    village = Column(String, nullable=True)
    ward = Column(String, nullable=True)
    panchayat = Column(String, nullable=True)
    
    reports = relationship("Report", back_populates="reporter")
    confirmations = relationship("Confirmation", back_populates="user")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    area_name = Column(String, nullable=True)
    hazard_type = Column(String, index=True)
    severity = Column(String, nullable=True)       # Low, Medium, High
    severity_score = Column(Float, default=0.0)
    predicted_risk = Column(Float, default=0.0)
    status = Column(String, default="Submitted")
    admin_status = Column(String, default="Submitted")
    is_approved = Column(Boolean, default=True)   # Admin approve/reject
    estimated_cost = Column(Float, default=0.0)
    priority = Column(String, nullable=True)       # Low, Moderate, Critical
    recommended_action = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reporter = relationship("User", back_populates="reports")
    confirmations = relationship("Confirmation", back_populates="report")


class Confirmation(Base):
    __tablename__ = "confirmations"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    confirmation_status = Column(String)   # "Fixed", "Still Not Fixed"
    
    report = relationship("Report", back_populates="confirmations")
    user = relationship("User", back_populates="confirmations")

class MLA(Base):
    __tablename__ = "mlas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    constituency = Column(String, index=True)
    mobile = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
