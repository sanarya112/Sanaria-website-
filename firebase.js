// ── FIREBASE CONFIG ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7jIwGVdqII0v53gFw83mP9Pa4PBSLg2I",
  authDomain: "sanaria-website.vercel.app",
  projectId: "sanush-website-datebase",
  storageBucket: "sanush-website-datebase.firebasestorage.app",
  messagingSenderId: "336092110705",
  appId: "1:336092110705:web:1b7b06b247ab1fae54e0d0",
  measurementId: "G-3P54X84P0S"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
