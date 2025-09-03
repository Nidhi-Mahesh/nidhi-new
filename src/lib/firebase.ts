// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "apiKey": "AIzaSyCak-4DjsKp9DE6NWu0wQQyV4k8g6_XgiY",
  "authDomain": "modern-chyrp.firebaseapp.com",
  "projectId": "modern-chyrp",
  "storageBucket": "modern-chyrp.appspot.com",
  "messagingSenderId": "380240154321",
  "appId": "1:380240154321:web:82d1063fa55e45cc4dfff0"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
