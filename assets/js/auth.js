import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// SIGN UP
const signupForm = document.getElementById("signup-form");
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

// LOGIN
const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

// SIGN OUT
const signOutBtn = document.getElementById("signOutBtn");
signOutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login.html";
});

// PROTECT ROUTES
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;

  if (!user && path.includes("dashboard")) {
    window.location.href = "/login.html";
  }

  if (user && (path.includes("login") || path.includes("signup"))) {
    window.location.href = "/dashboard.html";
  }
});
