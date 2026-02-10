// assets/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase config (THIS IS FINE — your key is valid)
const firebaseConfig = {
  apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.appspot.com",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 THIS WAS MISSING
export const auth = getAuth(app);
