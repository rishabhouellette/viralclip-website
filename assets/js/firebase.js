// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Firebase Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// (Optional) Analytics
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.appspot.com",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc",
  measurementId: "G-M8DMS26YDC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth (THIS WAS MISSING)
export const auth = getAuth(app);

// Optional
export const analytics = getAnalytics(app);
