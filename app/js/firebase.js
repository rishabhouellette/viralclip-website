// ─────────────────────────────────────────────────────────────────
// firebase.js - Firebase initialization
// ─────────────────────────────────────────────────────────────────

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.firebasestorage.app",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc",
  measurementId: "G-M8DMS26YDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, Timestamp };
