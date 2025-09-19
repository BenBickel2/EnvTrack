# Firebase Migration Guide

This guide will help you migrate your EnvTrack application from PostgreSQL to Firebase Firestore.

## Prerequisites

1. **Firebase Project**: Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Service Account**: Generate a service account key for your Firebase project
3. **Firestore Database**: Enable Firestore in your Firebase project

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend/api
pip install -r requirements.txt

# Install frontend dependencies (if not already installed)
cd ../../frontend
npm install
```

### 2. Configure Firebase

#### Backend Configuration (Firebase Admin SDK)

Create `backend/api/.env` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Frontend Configuration (Firebase Client SDK)

Create `frontend/.env.local` file:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 3. Migrate Data

Run the migration script to move your existing data to Firebase:

```bash
cd backend/api
python migrate_to_firebase.py
```

This script will:
- Connect to your existing PostgreSQL database
- Migrate all areas and scores data to Firestore
- Create sample data if PostgreSQL is not available

### 4. Start the Application

#### Backend (Optional - for API endpoints)
```bash
cd backend/api
python main.py
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Data Structure

Your Firestore database will have the following structure:

```
/areas/{area_id}
  - name: string
  - kind: string
  - score: number
  - theme_air: number
  - theme_water: number
  - theme_hazard: number
  - computed_at: timestamp
```

## Key Changes Made

### Backend Changes
- ✅ Replaced PostgreSQL with Firebase Admin SDK
- ✅ Updated API endpoints to use Firestore
- ✅ Added migration script for existing data
- ✅ Updated health check endpoint

### Frontend Changes
- ✅ Updated data fetching to use Firebase client SDK
- ✅ Removed dependency on backend API
- ✅ Direct Firestore integration

### Configuration
- ✅ Created environment variable templates
- ✅ Updated package dependencies
- ✅ Added Firebase configuration files

## Testing

1. **Backend Health Check**: Visit `http://localhost:8000/health`
2. **Frontend Application**: Visit `http://localhost:3000`
3. **Firebase Console**: Check your Firestore database for migrated data

## Troubleshooting

### Common Issues

1. **Firebase Authentication Error**: Check your service account credentials
2. **CORS Issues**: Verify `ALLOWED_ORIGINS` in backend `.env`
3. **Missing Data**: Run the migration script again
4. **Frontend Errors**: Check Firebase client configuration

### Getting Firebase Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for your `.env` file

## Next Steps

After successful migration, you can:
- Remove PostgreSQL dependencies completely
- Add real-time updates using Firestore listeners
- Implement user authentication
- Add data validation rules in Firestore
- Deploy to Firebase Hosting

## Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Verify all environment variables are set correctly
3. Ensure Firestore security rules allow read/write access
4. Check the browser console for client-side errors
