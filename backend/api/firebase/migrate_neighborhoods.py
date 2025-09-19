# backend/api/migrate_neighborhoods.py
"""
Migration script to create neighborhoods collection in Firestore
Combines geographic data with environmental quality information
"""
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from firebase_config import db
import random
from datetime import datetime, timezone

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def generate_environmental_data():
    """Generate realistic environmental quality data for neighborhoods"""
    return {
        "air_quality": {
            "pm25": round(random.uniform(8.0, 25.0), 1),  # PM2.5 in μg/m³
            "pm10": round(random.uniform(15.0, 40.0), 1),  # PM10 in μg/m³
            "o3": round(random.uniform(0.02, 0.08), 3),    # Ozone in ppm
            "no2": round(random.uniform(0.01, 0.05), 3),   # Nitrogen dioxide in ppm
            "so2": round(random.uniform(0.001, 0.01), 3),  # Sulfur dioxide in ppm
            "co": round(random.uniform(0.5, 3.0), 1),      # Carbon monoxide in ppm
            "aqi": random.randint(25, 150),                # Air Quality Index
            "last_updated": datetime.now(timezone.utc).isoformat()
        },
        "water_quality": {
            "ph": round(random.uniform(6.5, 8.5), 1),      # pH level
            "turbidity": round(random.uniform(0.1, 5.0), 1), # NTU
            "dissolved_oxygen": round(random.uniform(6.0, 12.0), 1), # mg/L
            "bacteria_count": random.randint(0, 200),      # CFU/100mL
            "lead_level": round(random.uniform(0.001, 0.015), 3), # mg/L
            "chlorine_residual": round(random.uniform(0.2, 2.0), 1), # mg/L
            "last_updated": datetime.now(timezone.utc).isoformat()
        },
        "environmental_hazards": {
            "noise_level": random.randint(45, 85),         # dB
            "traffic_density": random.randint(1, 10),      # 1-10 scale
            "industrial_proximity": random.randint(1, 10), # 1-10 scale
            "green_space_percentage": round(random.uniform(5.0, 45.0), 1), # %
            "flood_risk": random.randint(1, 10),           # 1-10 scale
            "heat_island_effect": random.randint(1, 10),   # 1-10 scale
            "last_updated": datetime.now(timezone.utc).isoformat()
        },
        "overall_score": round(random.uniform(60.0, 95.0), 1), # Overall environmental score
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

def migrate_neighborhoods():
    """Migrate neighborhoods from GeoJSON to Firestore"""
    print("Starting neighborhoods migration to Firebase...")
    
    try:
        # Load the GeoJSON file
        geojson_path = Path(__file__).parent.parent.parent / "frontend" / "public" / "neighborhoods.json"
        
        if not geojson_path.exists():
            print(f"Error: {geojson_path} not found")
            return False
        
        with open(geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
        
        print(f"Found {len(geojson_data['features'])} neighborhoods to migrate")
        
        # Migrate to Firestore
        batch = db.batch()
        neighborhoods_ref = db.collection('neighborhoods')
        
        for i, feature in enumerate(geojson_data['features']):
            neighborhood_name = feature['properties']['name']
            
            # Generate environmental data
            env_data = generate_environmental_data()
            
            # Create neighborhood document
            neighborhood_data = {
                "name": neighborhood_name,
                "geometry_type": feature['geometry']['type'],
                "geometry_coordinates": json.dumps(feature['geometry']['coordinates']),
                "environmental_data": env_data,
                "metadata": {
                    "migrated_at": datetime.now(timezone.utc).isoformat(),
                    "data_source": "geojson_migration",
                    "neighborhood_id": f"neighborhood_{i+1:03d}"
                }
            }
            
            # Use neighborhood name as document ID (sanitized)
            doc_id = neighborhood_name.lower().replace(" ", "_").replace("-", "_")
            doc_ref = neighborhoods_ref.document(doc_id)
            batch.set(doc_ref, neighborhood_data)
            
            print(f"Prepared {neighborhood_name} for migration...")
        
        # Commit the batch
        batch.commit()
        print(f"Successfully migrated {len(geojson_data['features'])} neighborhoods to Firebase!")
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        return False

def create_neighborhoods_collection_structure():
    """Create a sample neighborhood to show the data structure"""
    print("Creating sample neighborhood structure...")
    
    sample_data = {
        "name": "Sample Neighborhood",
        "geometry_type": "Polygon",
        "geometry_coordinates": json.dumps([[[-71.0, 42.0], [-71.1, 42.0], [-71.1, 42.1], [-71.0, 42.1], [-71.0, 42.0]]]),
        "environmental_data": generate_environmental_data(),
        "metadata": {
            "migrated_at": datetime.now(timezone.utc).isoformat(),
            "data_source": "sample_creation",
            "neighborhood_id": "sample_001"
        }
    }
    
    try:
        doc_ref = db.collection('neighborhoods').document('sample_neighborhood')
        doc_ref.set(sample_data)
        print("Sample neighborhood created successfully!")
        return True
    except Exception as e:
        print(f"Sample creation failed: {e}")
        return False

if __name__ == "__main__":
    print("EnvTrack Neighborhoods Migration Tool")
    print("====================================")
    
    # Try to migrate from GeoJSON
    if migrate_neighborhoods():
        print("Neighborhoods migration completed successfully!")
    else:
        print("GeoJSON migration failed. Creating sample structure instead...")
        if create_neighborhoods_collection_structure():
            print("Sample neighborhood created successfully!")
        else:
            print("Failed to create sample data. Please check your Firebase configuration.")
