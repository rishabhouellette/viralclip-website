document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  if (!toggle || !password) return;

  toggle.addEventListener("click", () => {
    password.type =
      password.type === "password" ? "text" : "password";
  });
});

document.addEventListener("mousemove", (e) => {
  const icons = document.querySelectorAll(".float-icon");

  const x = (e.clientX / window.innerWidth - 0.5) * 8;
  const y = (e.clientY / window.innerHeight - 0.5) * 8;

  icons.forEach((icon, i) => {
    const depth = (i + 1) * 0.4;
    icon.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});
