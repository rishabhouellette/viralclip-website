const firebaseConfig = {
  apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
  authDomain: "viralcliptech-36846.firebaseapp.com",
  projectId: "viralcliptech-36846",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// AUTH GUARD
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "/login.html";
  }
});
