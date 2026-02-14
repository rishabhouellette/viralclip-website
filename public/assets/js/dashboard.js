import "/assets/js/firebase.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// Setup logout button
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "/login.html";
      } catch (err) {
        console.error("Logout failed", err);
        alert("Failed to log out. Please try again.");
      }
    });
  }
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  console.log("User logged in:", user.email);

  // Update greeting name
  const nameEl = document.getElementById("username");
  if (nameEl) {
    nameEl.textContent =
      user.displayName || (user.email ? user.email.split("@")[0] : "there");
  }

  // Update profile name in sidebar
  const profileNameEl = document.getElementById("user-profile-name");
  if (profileNameEl) {
    const displayName = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    profileNameEl.textContent = displayName;
    console.log("Profile name updated to:", displayName);
  }

  // Setup logout button after user is confirmed
  setupLogout();
});
