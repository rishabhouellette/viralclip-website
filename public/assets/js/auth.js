import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { loadPosts } from "./dashboard/firestore.js";

let authCallback = null;
let unsubscribeAuth = null;

export function initAuth(callback) {
  authCallback = callback;
  if (!unsubscribeAuth) {
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace("/login.html");
        return;
      }

      window.appUser = {
        uid: user.uid,
        name: user.displayName,
        email: user.email
      };

      await loadPosts(user.uid);

      if (authCallback) authCallback(user);
      document.body.classList.add("auth-ready");
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
