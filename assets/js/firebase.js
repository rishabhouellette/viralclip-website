// Firebase v9 COMPAT SDK (DO NOT MIX WITH MODULAR IMPORTS)

const firebaseConfig = {
  apiKey: "AIzaSyDDO7e_IYaWSGUwvbGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.firebasestorage.app",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc",
  measurementId: "G-M8DMS26YDC"
};

// Prevent double init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global singletons
window.auth = firebase.auth();
window.db = firebase.firestore();

// Protect dashboard
if (window.location.pathname.includes("dashboard")) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.replace("/login.html");
    }
  });
}
