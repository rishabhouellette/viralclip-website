import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from "./firebase.js";

const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  console.log("ViralClip scaffold ready");
  const form = document.querySelector(".beta-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thanks! We'll be in touch.");
    });
  }
});

const signOutBtn = document.getElementById("signOutBtn");

if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/login.html";
    } catch (error) {
      alert(error.message);
    }
  });
}