# Neighborhoods Collection Setup Guide

This guide will help you set up the `neighborhoods` collection in Firestore with comprehensive environmental data for Boston neighborhoods.

## Overview

The `neighborhoods` collection stores detailed environmental information for each Boston neighborhood, including:

- **Geographic data** (from your `neighborhoods.json` file)
- **Air quality metrics** (PM2.5, PM10, Ozone, NO₂, SO₂, CO, AQI)
- **Water quality metrics** (pH, turbidity, dissolved oxygen, bacteria, lead, chlorine)
- **Environmental hazards** (noise, traffic, industrial proximity, green space, flood risk, heat island effect)
- **Overall environmental score** (calculated from all metrics)

## Data Structure

Each neighborhood document has this structure:

```json
{
  "name": "Back Bay",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [...]
  },
  "environmental_data": {
    "air_quality": {
      "pm25": 12.3,
      "pm10": 18.7,
      "o3": 0.045,
      "no2": 0.023,
      "so2": 0.003,
      "co": 1.2,
      "aqi": 65,
      "last_updated": "2024-01-15T10:00:00Z"
    },
    "water_quality": {
      "ph": 7.2,
      "turbidity": 1.8,
      "dissolved_oxygen": 8.5,
      "bacteria_count": 45,
      "lead_level": 0.008,
      "chlorine_residual": 0.8,
      "last_updated": "2024-01-15T10:00:00Z"
    },
    "environmental_hazards": {
      "noise_level": 65,
      "traffic_density": 7,
      "industrial_proximity": 3,
      "green_space_percentage": 25.5,
      "flood_risk": 4,
      "heat_island_effect": 6,
      "last_updated": "2024-01-15T10:00:00Z"
    },
    "overall_score": 82.5,
    "last_updated": "2024-01-15T10:00:00Z"
  },
  "metadata": {
    "migrated_at": "2024-01-15T10:00:00Z",
    "data_source": "geojson_migration",
    "neighborhood_id": "neighborhood_001"
  }
}
```

## Setup Steps

### 1. Run the Migration Script

```bash
cd backend/api
python migrate_neighborhoods.py
```

This will:
- Load your `neighborhoods.json` file
- Generate realistic environmental data for each neighborhood
- Create documents in the `neighborhoods` collection
- Use neighborhood names as document IDs (sanitized)

### 2. Verify the Data

```bash
cd backend/api
python query_neighborhoods.py
```

This interactive script allows you to:
- List all neighborhoods
- View specific neighborhood details
- See top neighborhoods by environmental score

### 3. Test the Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and click on the "Neighborhoods" tab to see:
- List of all neighborhoods sorted by environmental score
- Detailed environmental metrics for each neighborhood
- Interactive selection and viewing

## Environmental Metrics Explained

### Air Quality Index (AQI)
- **0-50**: Good (Green)
- **51-100**: Moderate (Yellow)
- **101-150**: Unhealthy for Sensitive Groups (Orange)
- **151+**: Unhealthy (Red)

### Water Quality Standards
- **pH**: 6.5-8.5 (optimal range)
- **Turbidity**: <1 NTU (excellent), <5 NTU (acceptable)
- **Dissolved Oxygen**: >6 mg/L (healthy)
- **Bacteria**: <100 CFU/100mL (safe)
- **Lead**: <0.015 mg/L (EPA limit)

### Environmental Hazards Scale
- **1-3**: Low risk/impact
- **4-6**: Moderate risk/impact
- **7-10**: High risk/impact

## Customizing the Data

### Adding Real Data

To replace the generated sample data with real environmental data:

1. **Update the migration script** (`migrate_neighborhoods.py`)
2. **Replace the `generate_environmental_data()` function** with your data source
3. **Re-run the migration** to update the collection

### Adding New Metrics

To add new environmental metrics:

1. **Update the data structure** in the migration script
2. **Modify the frontend** (`NeighborhoodsView.tsx`) to display new metrics
3. **Update the query script** if needed

### Real-time Updates

The current setup uses static data. To add real-time updates:

1. **Set up Firestore listeners** in the frontend
2. **Create a data pipeline** to update environmental data regularly
3. **Use Firebase Cloud Functions** for automated data updates

## Firestore Security Rules

Add these rules to secure your `neighborhoods` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /neighborhoods/{neighborhoodId} {
      allow read: if true; // Public read access
      allow write: if false; // Only admin can write
    }
  }
}
```

## Performance Optimization

### Indexing

Create these composite indexes in Firestore:

1. **Collection**: `neighborhoods`
   - **Fields**: `environmental_data.overall_score` (Descending)

2. **Collection**: `neighborhoods`
   - **Fields**: `environmental_data.air_quality.aqi` (Descending)

### Pagination

For large datasets, implement pagination:

```typescript
const q = query(
  collection(db, 'neighborhoods'),
  orderBy('environmental_data.overall_score', 'desc'),
  startAfter(lastDoc),
  limit(20)
);
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check Firebase credentials and permissions
2. **No data appears**: Verify the collection name and document structure
3. **Frontend errors**: Check Firebase client configuration
4. **Slow queries**: Add appropriate indexes

### Debugging

1. **Check Firestore console** for data
2. **Use browser dev tools** to inspect network requests
3. **Check Firebase logs** for backend errors
4. **Verify environment variables** are set correctly

## Next Steps

After setting up the neighborhoods collection:

1. **Add real-time data sources** (sensors, APIs)
2. **Implement data visualization** (charts, graphs)
3. **Add user authentication** for personalized features
4. **Create data export functionality**
5. **Set up automated data updates**

## Support

If you encounter issues:

1. Check the Firebase Console for error logs
2. Verify all environment variables are set
3. Ensure Firestore security rules allow access
4. Check the browser console for client-side errors
5. Review the migration script output for backend errors
