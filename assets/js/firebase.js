// assets/js/firebase.js

// Firebase SDKs
const firebaseConfig = {
  apiKey: "AIzaSyDDD7e_IYaWSGUwvbGpZWtZcEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
  storageBucket: "viralcliptech-36846.appspot.com",
  messagingSenderId: "128287408309",
  appId: "1:128287408309:web:776a5f93888d995f54fefc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make auth available globally
window.auth = firebase.auth();
