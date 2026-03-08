from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, database
import os
import hashlib
from routers import reports, users, ai_predict, auth

# Ensure uploads directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Create all tables from updated models
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Road Hazard Management API")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(ai_predict.router)

# ─── Seed Default Admin on Startup ────────────────────────────────────────────
def seed_admin():
    db = database.SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.user_login_id == "admin123").first()
        if not existing:
            admin = models.User(
                user_login_id="admin123",
                password_hash=hashlib.sha256("admin@123".encode()).hexdigest(),
                role="admin",
                name="System Admin",
                city="Admin",
                email="admin@roadwatch.ai",
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin seeded: admin123 / admin@123")
        else:
            print("ℹ️  Admin account already exists.")
    except Exception as e:
        print(f"❌ Admin seeding error: {e}")
    finally:
        db.close()

seed_admin()

# ─── Smart AI Detect Endpoint ─────────────────────────────────────────────────
@app.post("/detect")
async def detect_hazard(file: UploadFile = File(...)):
    """
    AI Hazard Detection Endpoint.
    Smart mock — randomizes output with realistic probability weights.
    Replace with real YOLOv8 inference when model is ready.
    """
    import uuid, shutil, random
    
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    hazard_types = ["Pothole", "Broken road edge", "Waterlogging", "Missing manhole cover"]
    severities = ["Low", "Medium", "High"]
    detected_hazard = random.choices(hazard_types, weights=[50, 20, 20, 10])[0]
    detected_severity = random.choices(severities, weights=[30, 50, 20])[0]
    
    return {
        "image_url": f"http://127.0.0.1:8000/uploads/{filename}",
        "hazard_type": detected_hazard,
        "severity": detected_severity
    }

@app.get("/")
def root():
    return {"message": "Road Hazard Management API is running. Check /docs for interactive API documentation."}
