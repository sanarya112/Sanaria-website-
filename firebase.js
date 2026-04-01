// ── FIREBASE CONFIG ──
(function () {
  var config = {
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

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    window.SANARIA_AUTH     = firebase.auth();
    window.SANARIA_DB       = firebase.firestore();
    window.SANARIA_PROVIDER = new firebase.auth.GoogleAuthProvider();
  } catch (e) {
    console.error('Firebase init error:', e);
  }
})();
