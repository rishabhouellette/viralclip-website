import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "/firebase.js";

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signupWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

const isDashboardPage = window.location.pathname.endsWith("/dashboard.html");
const isAuthPage = window.location.pathname.endsWith("/login.html") || window.location.pathname.endsWith("/signup.html");

watchAuthState((user) => {
  if (!user && isDashboardPage) {
    window.location.href = "/login.html";
  }

  if (user && isAuthPage) {
    window.location.href = "/dashboard.html";
  }
});
