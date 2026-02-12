import { loginWithEmail, signupWithEmail } from "/auth.js";

const loginBtn = document.getElementById("loginBtn");
const loginEmailInput = document.getElementById("email");
const loginPasswordInput = document.getElementById("password");
const signupForm = document.getElementById("signup-form");

if (loginBtn && loginEmailInput && loginPasswordInput) {
  loginBtn.addEventListener("click", async () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      await loginWithEmail(email, password);
      window.location.href = "/dashboard.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      await signupWithEmail(email, password);
      window.location.href = "/dashboard.html";
    } catch (error) {
      alert(error.message);
    }
  });
}
