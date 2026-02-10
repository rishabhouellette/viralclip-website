// assets/js/auth.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const isDashboard = window.location.pathname.includes("dashboard");

  if (isDashboard && !user) {
    window.location.href = "/login.html";
  }
});

const form = document.getElementById("signup-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

const signOutBtn = document.getElementById("signout-btn");

if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
}
