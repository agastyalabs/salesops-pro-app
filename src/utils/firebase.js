// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional: if you plan to use Firebase Analytics

// --- Firebase Configuration ---
// Values will be read from Environment Variables set in Render (e.g., REACT_APP_FIREBASE_API_KEY)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_FALLBACK_API_KEY",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_FALLBACK_AUTH_DOMAIN",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_FALLBACK_PROJECT_ID",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_FALLBACK_STORAGE_BUCKET",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FALLBACK_MESSAGING_SENDER_ID",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_FALLBACK_APP_ID",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional
};

// --- Initialize Firebase ---
let app;
let auth;
let db;
// let analytics; 

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // if (firebaseConfig.measurementId && typeof getAnalytics === 'function') { 
    //   analytics = getAnalytics(app); // Initialize if measurementId is present
    // }
} catch (e) {
    console.error("Error initializing Firebase in firebase.js:", e);
    // You might want to throw the error or handle it in a way that your app can react to it,
    // e.g., by setting a global error state.
}

// Export the initialized services and the config for use elsewhere
export { app, auth, db, firebaseConfig };
export const currentAppId = firebaseConfig.appId || 'default-salesops-app';
