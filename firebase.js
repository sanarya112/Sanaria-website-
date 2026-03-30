// ── FIREBASE CONFIG (Modular SDK) ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyC7jIwGVdqII0v53gFw83mP9Pa4PBSLg2I",
  authDomain:        "sanush-website-datebase.firebaseapp.com",
  projectId:         "sanush-website-datebase",
  storageBucket:     "sanush-website-datebase.firebasestorage.app",
  messagingSenderId: "336092110705",
  appId:             "1:336092110705:web:1b7b06b247ab1fae54e0d0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, onSnapshot };
