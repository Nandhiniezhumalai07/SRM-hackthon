# Road Hazard Management System 🛡️

A premium, localized hazard reporting and monitoring application powered by deep-learning telemetry.

## 🚀 Getting Started

To run the full system, follow these steps in two separate terminals.

### 1. Backend Setup (FastAPI)
```powershell
# Navigate to backend directory
cd backend

# Ensure dependencies are installed (first time)
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic

# Run the backend server
python -m uvicorn main:app --reload
```
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Live Server**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 2. Frontend Setup (React + Vite)
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time)
npm install

# Start the dev server
npm run dev
```
- **App URL**: [http://localhost:5175](http://localhost:5175)

## 🛠️ Tech Stack
- **Frontend**: React, React Leaflet (Map), Axios, Lucide Icons, Vanilla CSS (Glassmorphism)
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite
- **Intelligence**: YOLOv8 Mock Telemetry

## 🔗 Integrated Features
- **Neural Registry**: Citizen identity protocol.
- **Spectral Telemetry**: High-precision localized hazard reporting.
- **Vanguard Leaderboard**: Community ranking system.
- **Live Env**: Real-time map monitoring with AI Predictor layer.
