import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.firebasestorage.app",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
