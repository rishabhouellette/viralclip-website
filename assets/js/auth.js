// assets/js/auth.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
