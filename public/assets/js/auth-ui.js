document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  if (!toggle || !password) return;

  toggle.addEventListener("click", () => {
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    toggle.style.opacity = isHidden ? "1" : "0.6";
  });
});

document.addEventListener("mousemove", (e) => {
  const icons = document.querySelectorAll(".float-icon");

  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;

  icons.forEach((icon, i) => {
    const depth = (i + 1) * 0.6;
    icon.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});
