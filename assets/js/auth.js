// assets/js/auth.js

document.addEventListener("DOMContentLoaded", () => {

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  // SIGN UP
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signupForm.email.value;
      const password = signupForm.password.value;

      try {
        await auth.createUserWithEmailAndPassword(email, password);
        window.location.href = "/dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "/dashboard.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

});
