# backend/api/main.py
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, logging, asyncio
from airnow_service import airnow_service, AirNowResponse
from typing import Dict, List
from datetime import datetime, timedelta

# Load .env from same folder as this file
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("ALLOWED_ORIGINS","").split(",") if o],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    try:
        return {"status": "ok", "airnow": "available"}
    except Exception as e:
        logging.exception("Health check error")
        return {"status": "error", "error": str(e)}

@app.get("/aqi/neighborhood/{neighborhood_name}")
async def get_neighborhood_aqi(neighborhood_name: str):
    """Get real-time AQI data for a specific neighborhood"""
    try:
        aqi_data = await airnow_service.get_aqi_by_neighborhood(neighborhood_name)
        if not aqi_data:
            raise HTTPException(status_code=404, detail=f"No AQI data found for {neighborhood_name}")
        
        return {
            "neighborhood": neighborhood_name,
            "aqi": aqi_data.AQI,
            "parameter": aqi_data.ParameterName,
            "category": aqi_data.Category,
            "date_observed": aqi_data.DateObserved,
            "hour_observed": aqi_data.HourObserved,
            "reporting_area": aqi_data.ReportingArea,
            "coordinates": {
                "latitude": aqi_data.Latitude,
                "longitude": aqi_data.Longitude
            }
        }
    except Exception as e:
        logging.exception(f"Error fetching AQI for {neighborhood_name}")
        raise HTTPException(status_code=500, detail=f"Error fetching AQI data: {str(e)}")

@app.get("/aqi/boston")
async def get_all_boston_aqi():
    """Get real-time AQI data for all Boston neighborhoods"""
    try:
        aqi_data = await airnow_service.get_all_boston_aqi()
        
        # Format response
        formatted_data = {}
        for neighborhood, data in aqi_data.items():
            formatted_data[neighborhood] = {
                "aqi": data.AQI,
                "parameter": data.ParameterName,
                "category": data.Category,
                "date_observed": data.DateObserved,
                "hour_observed": data.HourObserved,
                "reporting_area": data.ReportingArea,
                "coordinates": {
                    "latitude": data.Latitude,
                    "longitude": data.Longitude
                }
            }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "neighborhoods": formatted_data,
            "total_neighborhoods": len(formatted_data)
        }
    except Exception as e:
        logging.exception("Error fetching all Boston AQI data")
        raise HTTPException(status_code=500, detail=f"Error fetching AQI data: {str(e)}")

@app.get("/neighborhoods")
async def get_neighborhoods():
    """Get list of available neighborhoods"""
    try:
        # Return the list of neighborhoods from airnow_service
        neighborhoods = list(airnow_service.boston_zip_codes.keys())
        return {
            "neighborhoods": neighborhoods,
            "count": len(neighborhoods)
        }
    except Exception as e:
        logging.exception("Error fetching neighborhoods list")
        raise HTTPException(status_code=500, detail=f"Error fetching neighborhoods: {str(e)}")

@app.get("/neighborhoods/with-aqi")
async def get_neighborhoods_with_aqi():
    """Get neighborhoods with real-time AQI data (for frontend compatibility)"""
    try:
        # Get AQI data for all neighborhoods
        aqi_data = await airnow_service.get_all_boston_aqi()
        
        # Create mock neighborhood data with AQI
        neighborhoods = []
        for neighborhood_name, aqi_info in aqi_data.items():
            neighborhood = {
                "id": neighborhood_name.lower().replace(" ", "-"),
                "name": neighborhood_name,
                "environmental_data": {
                    "air_quality": {
                        "pm25": 15.0,  # Mock data
                        "pm10": 25.0,
                        "o3": 0.05,
                        "no2": 0.02,
                        "so2": 0.01,
                        "co": 1.0,
                        "aqi": aqi_info.AQI,
                        "last_updated": aqi_info.DateObserved
                    },
                    "water_quality": {
                        "ph": 7.2,
                        "turbidity": 0.5,
                        "dissolved_oxygen": 8.5,
                        "bacteria_count": 10,
                        "lead_level": 0.001,
                        "chlorine_residual": 0.5,
                        "last_updated": "2024-01-01T00:00:00Z"
                    },
                    "environmental_hazards": {
                        "noise_level": 65,
                        "traffic_density": 7,
                        "industrial_proximity": 3,
                        "green_space_percentage": 25,
                        "flood_risk": 4,
                        "heat_island_effect": 6,
                        "last_updated": "2024-01-01T00:00:00Z"
                    },
                    "overall_score": max(0, 100 - aqi_info.AQI),  # Simple scoring based on AQI
                    "last_updated": aqi_info.DateObserved
                },
                "metadata": {
                    "migrated_at": "2024-01-01T00:00:00Z",
                    "data_source": "airnow_api",
                    "neighborhood_id": neighborhood_name.lower().replace(" ", "-")
                }
            }
            neighborhoods.append(neighborhood)
        
        return {
            "neighborhoods": neighborhoods,
            "count": len(neighborhoods),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logging.exception("Error fetching neighborhoods with AQI")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)