// ── SANARIA — Firebase Init ──
function initSanariaFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded yet');
      setTimeout(initSanariaFirebase, 100);
      return;
    }
    var config = {
      apiKey:            "AIzaSyC7jIwGVdqII0v53gFw83mP9Pa4PBSLg2I",
      authDomain:        "sanush-website-datebase.firebaseapp.com",
      projectId:         "sanush-website-datebase",
      storageBucket:     "sanush-website-datebase.firebasestorage.app",
      messagingSenderId: "336092110705",
      appId:             "1:336092110705:web:1b7b06b247ab1fae54e0d0"
    };
    if (!firebase.apps.length) firebase.initializeApp(config);
    window._auth     = firebase.auth();
    window._db       = firebase.firestore();
    window._provider = new firebase.auth.GoogleAuthProvider();
    window._firebaseReady = true;
    console.log('✅ Firebase ready');
    // fire event so script.js knows
    document.dispatchEvent(new Event('firebase:ready'));
  } catch(e) {
    console.error('Firebase init error:', e);
    setTimeout(initSanariaFirebase, 200);
  }
}
initSanariaFirebase();
