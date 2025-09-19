import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Import other Firebase services you need, like getStorage, etc.

// Your web app's Firebase configuration (from Step 3)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // EnvTrack
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // If you enabled Google Analytics
};

// Initialize Firebase, ensuring it's only initialized once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
// export const storage = getStorage(app); // Example for Cloud Storage
