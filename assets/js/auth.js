import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        alert(error.message);
      });
  });
}

// ✅ THIS is the ONLY redirect
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/dashboard.html";
  }
});

/**
 * Initialize auth state listener
 */
export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    const isDashboard = location.pathname.includes("dashboard");

    if (!user && isDashboard) {
      location.href = "/login.html";
    }
  });
}

/**
 * Sign out user
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Sign out handler
 */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signOutBtn");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "/login.html";
  });
});

/**
 * Sign out user
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Sign out handler (legacy)
 */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signOutBtn");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "/";
  });
});
