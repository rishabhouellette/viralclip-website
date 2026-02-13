import "/assets/js/firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const nameEl = document.getElementById("user-name");

  if (!nameEl) return;

  const displayName =
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "there");

  nameEl.textContent = displayName;
});
