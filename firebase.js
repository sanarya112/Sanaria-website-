// ── FIREBASE CONFIG (Compat SDK) ──
// پێویستە ئەم script ـانە لە index.html پێش firebase.js بخرێن:
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>

const firebaseConfig = {
  apiKey:            "AIzaSyC7jIwGVdqII0v53gFw83mP9Pa4PBSLg2I",
  authDomain:        "sanush-website-datebase.firebaseapp.com",
  projectId:         "sanush-website-datebase",
  storageBucket:     "sanush-website-datebase.firebasestorage.app",
  messagingSenderId: "336092110705",
  appId:             "1:336092110705:web:1b7b06b247ab1fae54e0d0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const _auth     = firebase.auth();
const _db       = firebase.firestore();
const _provider = new firebase.auth.GoogleAuthProvider();

// Export وەک window properties بۆ script.js
window.SANARIA_AUTH     = _auth;
window.SANARIA_DB       = _db;
window.SANARIA_PROVIDER = _provider;٧
