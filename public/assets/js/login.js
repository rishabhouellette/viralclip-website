import { signIn } from "./auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signIn(email, password);
    window.location.href = "/dashboard.html";
  } catch (error) {
    alert(error.message);
    console.error("Login failed:", error);
  }
});
