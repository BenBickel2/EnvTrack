# airnow_service.py
import httpx
import os
import logging
import asyncio
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class AirNowResponse(BaseModel):
    DateObserved: str
    HourObserved: int
    LocalTimeZone: str
    ReportingArea: str
    StateCode: str
    Latitude: float
    Longitude: float
    ParameterName: str
    AQI: int
    Category: Dict[str, Any]

class AirNowService:
    def __init__(self):
        self.api_key = os.getenv("AIRNOW_API_KEY")
        if not self.api_key:
            raise ValueError("AIRNOW_API_KEY environment variable is required")
        self.base_url = "https://www.airnowapi.org/aq/observation/zipCode/current/"
        self.cache = {}  # Simple in-memory cache
        self.cache_duration = timedelta(minutes=30)  # Cache for 30 minutes
        
        # Boston zip codes mapped to neighborhoods
        self.boston_zip_codes = {
            'Allston': '02134',
            'Back Bay': '02116', 
            'Bay Village': '02116',
            'Beacon Hill': '02108',
            'Brighton': '02135',
            'Charlestown': '02129',
            'Chinatown': '02111',
            'Dorchester': '02122',
            'East Boston': '02128',
            'Fenway': '02215',
            'Hyde Park': '02136',
            'Jamaica Plain': '02130',
            'Longwood': '02115',
            'Mattapan': '02126',
            'Mission Hill': '02120',
            'North End': '02113',
            'Roslindale': '02131',
            'Roxbury': '02119',
            'South End': '02118',
            'South Boston': '02127',
            'West Roxbury': '02132'
        }
    
    async def get_aqi_by_zip(self, zip_code: str) -> Optional[AirNowResponse]:
        """Get AQI data for a specific zip code"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    'zipCode': zip_code,
                    'format': 'application/json',
                    'API_KEY': self.api_key,
                    'distance': 25  # 25 mile radius
                }
                
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                if data and len(data) > 0:
                    # Return the first result (most recent)
                    return AirNowResponse(**data[0])
                return None
                
        except Exception as e:
            logging.error(f"Error fetching AQI for zip {zip_code}: {e}")
            return None
    
    async def get_aqi_by_neighborhood(self, neighborhood: str) -> Optional[AirNowResponse]:
        """Get AQI data for a neighborhood by mapping to zip code"""
        zip_code = self.boston_zip_codes.get(neighborhood)
        if not zip_code:
            logging.warning(f"No zip code found for neighborhood: {neighborhood}")
            return None
            
        # Check cache first
        cache_key = f"{neighborhood}_{zip_code}"
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_data
        
        # Fetch from API
        aqi_data = await self.get_aqi_by_zip(zip_code)
        
        # Cache the result
        if aqi_data:
            self.cache[cache_key] = (aqi_data, datetime.now())
        
        return aqi_data
    
    async def get_all_boston_aqi(self) -> Dict[str, AirNowResponse]:
        """Get AQI data for all Boston neighborhoods"""
        results = {}
        
        # Process all neighborhoods concurrently
        tasks = []
        for neighborhood in self.boston_zip_codes.keys():
            tasks.append(self.get_aqi_by_neighborhood(neighborhood))
        
        # Wait for all requests to complete
        aqi_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, neighborhood in enumerate(self.boston_zip_codes.keys()):
            result = aqi_results[i]
            if isinstance(result, AirNowResponse):
                results[neighborhood] = result
            else:
                logging.error(f"Failed to get AQI for {neighborhood}: {result}")
        
        return results

# Global instance
airnow_service = AirNowService()

# Add this at the end of the file:
if __name__ == "__main__":
    import asyncio
    
    async def test_service():
        # Set your API key here (or set it as an environment variable)
        api_key = "D14B043E-2B25-4F5D-96B9-7E6A8B978F22"  # Replace with your actual API key
        os.environ["AIRNOW_API_KEY"] = api_key
        
        print("Testing AirNow Service...")
        print("=" * 50)
        
        # Test 1: Get AQI for a specific neighborhood
        print("Testing single neighborhood (Back Bay)...")
        result = await airnow_service.get_aqi_by_neighborhood("Back Bay")
        if result:
            print(f"✅ Back Bay AQI: {result.AQI} ({result.ParameterName})")
            print(f"   Category: {result.Category}")
            print(f"   Observed: {result.DateObserved} at {result.HourObserved}:00")
        else:
            print("❌ Failed to get AQI for Back Bay")
        
        print("\n" + "=" * 50)
        
        # Test 2: Get AQI for all Boston neighborhoods
        print("Testing all Boston neighborhoods...")
        all_data = await airnow_service.get_all_boston_aqi()
        print(f"✅ Found AQI data for {len(all_data)} neighborhoods:")
        
        for neighborhood, aqi_data in all_data.items():
            print(f"   {neighborhood}: AQI {aqi_data.AQI} ({aqi_data.ParameterName})")
        
        print("\n" + "=" * 50)
        print("Test completed!")
    
    # Run the test
    asyncio.run(test_service())