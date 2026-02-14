import { signUp } from "./auth.js";

const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signUp(email, password);
    window.location.href = "/dashboard/";
  } catch (error) {
    alert(error.message);
    console.error("Signup failed:", error);
  }
});
