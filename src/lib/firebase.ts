// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "apiKey": "AIzaSyCkQa4_b9KfqzHVPF9ARc40ty7UjUlU2Sg",
  "authDomain": "modern-chyrp.firebaseapp.com",
  "projectId": "modern-chyrp",
  "storageBucket": "modern-chyrp.appspot.com",
  "messagingSenderId": "380240154321",
  "appId": "1:380240154321:web:198f17a57c8cc1044dfff0"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, app };
