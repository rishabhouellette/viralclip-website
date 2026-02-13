import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let authCallback = null;
let unsubscribeAuth = null;

export function initAuth(callback) {
  authCallback = callback;
  if (!unsubscribeAuth) {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (authCallback) authCallback(user);
    });
  }
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();
  // Firebase auth will go here
  window.location.href = "/dashboard.html";
});

document.getElementById("signupForm")?.addEventListener("submit", e => {
  e.preventDefault();
  // Firebase signup will go here
  window.location.href = "/dashboard.html";
});
