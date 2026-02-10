import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Handle sign out
document.querySelectorAll(".sign-out-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
});

// Protect dashboard
onAuthStateChanged(auth, user => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "/login.html";
  }
});
