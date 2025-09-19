# backend/api/query_neighborhoods.py
"""
Script to query and display neighborhoods data from Firestore
"""
from firebase_config import db
from datetime import datetime

def list_all_neighborhoods():
    """List all neighborhoods in the collection"""
    try:
        neighborhoods_ref = db.collection('neighborhoods')
        docs = neighborhoods_ref.get()
        
        print(f"Found {len(docs)} neighborhoods:")
        print("=" * 50)
        
        for doc in docs:
            data = doc.to_dict()
            env_data = data.get('environmental_data', {})
            
            print(f"Name: {data.get('name', 'Unknown')}")
            print(f"Document ID: {doc.id}")
            print(f"Overall Score: {env_data.get('overall_score', 'N/A')}")
            
            air_quality = env_data.get('air_quality', {})
            water_quality = env_data.get('water_quality', {})
            
            print(f"Air Quality (AQI): {air_quality.get('aqi', 'N/A')}")
            print(f"Water pH: {water_quality.get('ph', 'N/A')}")
            print(f"Last Updated: {env_data.get('last_updated', 'N/A')}")
            print("-" * 30)
        
        return True
        
    except Exception as e:
        print(f"Error querying neighborhoods: {e}")
        return False

def get_neighborhood_by_name(name):
    """Get a specific neighborhood by name"""
    try:
        # Try different possible document IDs
        possible_ids = [
            name.lower().replace(" ", "_").replace("-", "_"),
            name.lower().replace(" ", "-"),
            name.lower()
        ]
        
        neighborhoods_ref = db.collection('neighborhoods')
        
        for doc_id in possible_ids:
            doc = neighborhoods_ref.document(doc_id).get()
            if doc.exists:
                data = doc.to_dict()
                print(f"Found neighborhood: {data.get('name')}")
                print(f"Document ID: {doc.id}")
                
                env_data = data.get('environmental_data', {})
                print(f"Overall Score: {env_data.get('overall_score')}")
                
                air_quality = env_data.get('air_quality', {})
                water_quality = env_data.get('water_quality', {})
                hazards = env_data.get('environmental_hazards', {})
                
                print("\nAir Quality:")
                for key, value in air_quality.items():
                    if key != 'last_updated':
                        print(f"  {key}: {value}")
                
                print("\nWater Quality:")
                for key, value in water_quality.items():
                    if key != 'last_updated':
                        print(f"  {key}: {value}")
                
                print("\nEnvironmental Hazards:")
                for key, value in hazards.items():
                    if key != 'last_updated':
                        print(f"  {key}: {value}")
                
                return True
        
        print(f"Neighborhood '{name}' not found")
        return False
        
    except Exception as e:
        print(f"Error querying neighborhood: {e}")
        return False

def get_top_neighborhoods(limit=5):
    """Get top neighborhoods by overall score"""
    try:
        neighborhoods_ref = db.collection('neighborhoods')
        docs = neighborhoods_ref.get()
        
        # Sort by overall score
        neighborhoods = []
        for doc in docs:
            data = doc.to_dict()
            env_data = data.get('environmental_data', {})
            score = env_data.get('overall_score', 0)
            neighborhoods.append({
                'name': data.get('name'),
                'score': score,
                'doc_id': doc.id
            })
        
        # Sort by score (descending)
        neighborhoods.sort(key=lambda x: x['score'], reverse=True)
        
        print(f"Top {min(limit, len(neighborhoods))} neighborhoods by environmental score:")
        print("=" * 60)
        
        for i, neighborhood in enumerate(neighborhoods[:limit]):
            print(f"{i+1}. {neighborhood['name']} - Score: {neighborhood['score']}")
        
        return True
        
    except Exception as e:
        print(f"Error querying top neighborhoods: {e}")
        return False

if __name__ == "__main__":
    print("EnvTrack Neighborhoods Query Tool")
    print("================================")
    
    while True:
        print("\nOptions:")
        print("1. List all neighborhoods")
        print("2. Get specific neighborhood")
        print("3. Get top neighborhoods")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            list_all_neighborhoods()
        elif choice == "2":
            name = input("Enter neighborhood name: ").strip()
            get_neighborhood_by_name(name)
        elif choice == "3":
            limit = input("Enter number of top neighborhoods (default 5): ").strip()
            limit = int(limit) if limit.isdigit() else 5
            get_top_neighborhoods(limit)
        elif choice == "4":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")
