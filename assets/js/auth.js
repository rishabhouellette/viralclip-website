import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
 * Handle login form
 */
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      
      signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
          alert("Login failed: " + error.message);
        });
    });
  }
});

/**
 * Redirect to dashboard on successful login
 */
onAuthStateChanged(auth, (user) => {
  const isLoginPage = location.pathname.includes("login");
  
  if (user && isLoginPage) {
    window.location.href = "/dashboard.html";
  }
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
