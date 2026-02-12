import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let currentUser = null;
let authCallback = null;

export function initAuth(callback) {
  authCallback = callback;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (authCallback) authCallback(user);
  });
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function getCurrentUser() {
  return currentUser;
}
