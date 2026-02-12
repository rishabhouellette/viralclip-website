import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

export const signupWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

export async function logoutAndRedirect() {
  await signOut(auth);
  window.location.href = "/login.html";
}

const path = window.location.pathname;
const onDashboard = path.endsWith("/dashboard.html");
const onAuthPages = path.endsWith("/login.html") || path.endsWith("/signup.html");

watchAuthState((user) => {
  if (!user && onDashboard) {
    window.location.replace("/login.html");
  }

  if (user && onAuthPages) {
    window.location.replace("/dashboard.html");
  }
});
