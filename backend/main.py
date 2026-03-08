from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, database
import os
import hashlib
from routers import reports, users, ai_predict, auth, mlas

# Ensure models are created in the database
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
app.include_router(mlas.router)

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

def seed_mlas():
    db = database.SessionLocal()
    try:
        if db.query(models.MLA).count() == 0:
            seed_data = [
                {"name": "M. K. Stalin", "constituency": "Kolathur", "mobile": "9876543210", "address": "Kolathur MLA Office, Chennai"},
                {"name": "Udhayanidhi Stalin", "constituency": "Chepauk–Thiruvallikeni", "mobile": "9876500001", "address": "Chepauk Constituency Office, Chennai"},
                {"name": "P. K. Sekar Babu", "constituency": "Harbour", "mobile": "9876500002", "address": "Harbour MLA Office, Chennai"},
                {"name": "Ma. Subramanian", "constituency": "Saidapet", "mobile": "9876500003", "address": "Saidapet MLA Office, Chennai"},
                {"name": "J. Karunanidhi", "constituency": "T. Nagar", "mobile": "9876500004", "address": "T Nagar MLA Office, Chennai"},
                {"name": "Thamimun Ansari", "constituency": "Manamadurai", "mobile": "9876500005", "address": "Manamadurai MLA Office"},
                {"name": "K. Ponmudi", "constituency": "Tirukkoyilur", "mobile": "9876500006", "address": "Tirukkoyilur MLA Office"},
                {"name": "S. Muthusamy", "constituency": "Erode West", "mobile": "9876500007", "address": "Erode West MLA Office"},
                {"name": "V. Senthilbalaji", "constituency": "Karur", "mobile": "9876500008", "address": "Karur MLA Office"},
                {"name": "K. N. Nehru", "constituency": "Tiruchirappalli West", "mobile": "9876500009", "address": "Trichy MLA Office"},
            ]
            for m in seed_data:
                db.add(models.MLA(**m))
            db.commit()
            print("✅ Default MLAs seeded.")
        else:
            print("ℹ️  MLA directory already seeded.")
    except Exception as e:
        print(f"❌ MLA seeding error: {e}")
    finally:
        db.close()

seed_admin()
seed_mlas()

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
