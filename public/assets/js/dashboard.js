import "/assets/js/firebase.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const nameEl = document.getElementById("username");

  if (!nameEl) return;

  nameEl.textContent =
    user.displayName || (user.email ? user.email.split("@")[0] : "there");
});

// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (err) {
    console.error("Logout failed", err);
  }
});
