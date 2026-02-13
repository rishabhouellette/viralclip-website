import { signIn } from "./auth.js";

const form = document.getElementById("login-form") || document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const toggleEye = document.querySelector(".eye");

if (toggleEye && passwordInput) {
  const togglePassword = () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    toggleEye.classList.toggle("active");
  };

  toggleEye.addEventListener("click", togglePassword);
  toggleEye.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePassword();
    }
  });
}

if (form) {
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
}
