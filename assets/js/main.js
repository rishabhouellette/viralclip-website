import { initAuth, signOutUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  const signOutBtn = document.getElementById("signOutBtn");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      await signOutUser();
      window.location.href = "/login.html";
    });
  }
});