// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "modern-chyrp",
  "appId": "1:380240154321:web:82d1063fa55e45cc4dfff0",
  "storageBucket": "modern-chyrp.firebasestorage.app",
  "apiKey": "AIzaSyCak-4DjsKp9DE6NWu0wQQyV4k8g6_XgiY",
  "authDomain": "modern-chyrp.firebaseapp.com",
  "messagingSenderId": "380240154321"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
