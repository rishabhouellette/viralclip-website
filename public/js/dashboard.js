import { initAuth, signOutUser } from "./auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const createPostBtn = document.getElementById("openModalBtn");

initAuth((user) => {
  if (!user) {
    window.location.href = "/login.html";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOutUser();
    window.location.href = "/login.html";
  } catch (error) {
    alert(error.message);
  }
});

createPostBtn.addEventListener("click", () => {
  alert("Create Post");
});
