import "/assets/js/firebase.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  // Update greeting name
  const nameEl = document.getElementById("username");
  if (nameEl) {
    nameEl.textContent =
      user.displayName || (user.email ? user.email.split("@")[0] : "there");
  }

  // Update profile name in sidebar
  const profileNameEl = document.getElementById("user-profile-name");
  if (profileNameEl) {
    profileNameEl.textContent =
      user.displayName || (user.email ? user.email.split("@")[0] : "User");
  }
});

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/login.html";
    } catch (err) {
      console.error("Logout failed", err);
    }
  });
}
