// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7jIwGVdqIIOv53gFw83mP9Pa4PBSLg2I",
  authDomain: "sanush-website-datebase.firebaseapp.com",
  projectId: "sanush-website-datebase",
  storageBucket: "sanush-website-datebase.firebasestorage.app",
  messagingSenderId: "336092110705",
  appId: "1:336092110705:web:1b7b06b247ab1fae54e0d0",
  measurementId: "G-3P54X84P0S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
