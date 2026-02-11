import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
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
