// ── SANARIA — Firebase Config ──
(function initFirebase() {
  var config = {
    apiKey:            "AIzaSyC7jIwGVdqIIOv53gFw83mP9Pa4PBSLg2I",
    authDomain:        "sanush-website-datebase.firebaseapp.com",
    projectId:         "sanush-website-datebase",
    storageBucket:     "sanush-website-datebase.firebasestorage.app",
    messagingSenderId: "336092110705",
    appId:             "1:336092110705:web:1b7b06b247ab1fae54e0d0"
  };
  try {
    if (!firebase.apps.length) firebase.initializeApp(config);
    window._auth     = firebase.auth();
    window._db       = firebase.firestore();
    window._provider = new firebase.auth.GoogleAuthProvider();
    console.log('✅ Firebase ready');
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
})();
