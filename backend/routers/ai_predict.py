from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
import random
import models, database


router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)

# In-memory mock trained model for demonstration
mock_model = None

@router.post("/simulate")
def generate_simulated_dataset(db: Session = Depends(database.get_db)):
    """
    Generate 6 months of fake hazard records to train the model.
    """
    from sklearn.ensemble import RandomForestClassifier
    import numpy as np
    import pandas as pd
    roads = ["Highway", "City", "Rural"]
    weathers = ["Clear", "Rain", "Storm"]
    
    cities = ["Mumbai", "Delhi", "Bangalore"]
    
    # We won't actually store all these in DB to avoid cluttering demo,
    # just create a dataframe to train a Random Forest model.
    
    data = []
    
    for _ in range(500):
        road_type = random.choice(roads)
        weather = random.choice(weathers)
        traffic_density = random.randint(1, 10)
        previous_hazard_count = random.randint(0, 5)
        
        # Hazard probability logic matching requirement:
        prob = 0.1
        if weather in ["Rain", "Storm"]: prob += 0.4
        if road_type == "Highway": prob += 0.2
        if previous_hazard_count > 2: prob += 0.2
        
        has_hazard = 1 if random.random() < prob else 0
        
        data.append([
            road_type, weather, traffic_density, previous_hazard_count, has_hazard
        ])
        
    df = pd.DataFrame(data, columns=["road_type", "weather", "traffic_density", "prev_hazards", "has_hazard"])
    
    # Simple encoding for demo
    df['road_encoded'] = df['road_type'].map({"Highway": 2, "City": 1, "Rural": 0})
    df['weather_encoded'] = df['weather'].map({"Storm": 2, "Rain": 1, "Clear": 0})
    
    X = df[['road_encoded', 'weather_encoded', 'traffic_density', 'prev_hazards']]
    y = df['has_hazard']
    
    global mock_model
    mock_model = RandomForestClassifier(n_estimators=50, max_depth=5)
    mock_model.fit(X, y)
    
    return {"message": "Simulated dataset generated and RandomForest model trained."}

@router.get("/hotspots")
def get_predictive_hotspots():
    """
    Returns regions and their probability of hazard in the next 30 days.
    """
    import pandas as pd
    global mock_model
    if mock_model is None:
        return {"error": "Model not trained. Call /ai/simulate first."}
        
    # Generate some fake coordinate centers for heatmaps based on probability
    # e.g. (lat, lng, weight)
    # Using mock predictions:
    
    hotspots = []
    
    # Sample locations
    locations = [
        (19.0760, 72.8777, "City", "Rain", 8, 3),    # Mumbai center mock
        (19.0860, 72.8877, "City", "Clear", 5, 1),
        (19.0660, 72.8677, "Highway", "Storm", 9, 4),
    ]
    
    for lat, lng, road, weather, traffic, prev in locations:
        r_enc = {"Highway": 2, "City": 1, "Rural": 0}.get(road)
        w_enc = {"Storm": 2, "Rain": 1, "Clear": 0}.get(weather)
        
        X_pred = pd.DataFrame([[r_enc, w_enc, traffic, prev]], columns=['road_encoded', 'weather_encoded', 'traffic_density', 'prev_hazards'])
        
        prob = mock_model.predict_proba(X_pred)[0][1]  # Probability of class 1 (hazard)
        
        if prob > 0.7:
            zone_color = "red"
        elif prob > 0.4:
            zone_color = "yellow"
        else:
            zone_color = "green"
            
        hotspots.append({
            "lat": lat,
            "lng": lng,
            "probability": prob,
            "zone_color": zone_color
        })
        
    return {"hotspots": hotspots}
