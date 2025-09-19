# backend/api/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os
from dotenv import load_dotenv

# Load .env from same folder as this file
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        # Option 1: Use service account key file
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            # Option 2: Use environment variables
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL')}"
            })
        
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Get Firestore client
db = initialize_firebase()
