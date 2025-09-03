// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "modern-chyrp",
  "appId": "1:380240154321:web:82d1063fa55e45cc4dfff0",
  "storageBucket": "modern-chyrp.firebasestorage.app",
  "apiKey": "AIzaSyCak-4DjsKp9DE6NWu0wQQyV4k8g6_XgiY",
  "authDomain": "modern-chyrp.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "380240154321"
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Try alternative Firestore initialization
let db;
try {
  // Method 1: Standard initialization
  db = getFirestore(app);
  console.log('✅ Firestore initialized with getFirestore');
} catch (error) {
  console.log('❌ getFirestore failed, trying initializeFirestore');
  try {
    // Method 2: Manual initialization with settings
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // For some network environments
    });
    console.log('✅ Firestore initialized with initializeFirestore');
  } catch (error2) {
    console.error('❌ Both Firestore initialization methods failed:', error2);
    throw error2;
  }
}

// Test connection on initialization
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase initialized for project:', firebaseConfig.projectId);
  console.log('🔥 Firestore instance:', db);
}

export { db, app };