import { views } from "./views.js";
import { initCalendar } from "./calendar.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { state } from "./state.js";
import { auth, db } from "../firebase.js";

// ============================================
// APP STATE
// ============================================
let appState = {
  user: null,
  activeView: "dashboard"
};

// ============================================
// DOM ELEMENTS
// ============================================
const dashboardContent = document.getElementById("dashboard-content");
const topbarLeft = document.getElementById("topbar-left");
const topbarRight = document.getElementById("topbar-right");
const navItems = document.querySelectorAll(".nav-item");
const userNameEl = document.getElementById("user-name");
const logoutBtn = document.querySelector('[data-logout-btn]');

// ============================================
// RENDER FUNCTION - THE MAGIC
// ============================================
function render(viewName) {
  const viewConfig = views[viewName];
  if (!viewConfig) return;

  appState.activeView = viewName;

  // Update topbar
  topbarLeft.innerHTML = viewConfig.topbar();
  topbarRight.innerHTML = "";

  // Update content
  dashboardContent.innerHTML = viewConfig.content(appState.user);

  // Initialize calendar if calendar view
  if (viewName === "calendar") {
    initCalendar();
  }

  // Update active nav item
  navItems.forEach(btn => {
    if (btn.dataset.view === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  console.log(`📄 Rendered view: ${viewName}`);
}

// ============================================
// NAVIGATION SETUP
// ============================================
function setupNavigation() {
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      render(btn.dataset.view);
    });
  });
  console.log("✅ Navigation setup complete");
}

// ============================================
// LOGOUT SETUP
// ============================================
function setupLogout() {
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        console.log("🚪 Logging out...");
        await signOut(auth);
        console.log("✅ Logout successful");
        window.location.href = "/";
      } catch (error) {
        console.error("❌ Logout failed:", error);
        alert("Failed to log out. Please try again.");
      }
    });
    console.log("✅ Logout setup complete");
  }
}

// ============================================
// AUTH STATE HANDLER
// ============================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("❌ No user logged in, redirecting...");
    state.user = {
      uid: null,
      email: null,
      displayName: null
    };
    window.location.href = "/";
    return;
  }

  console.log("✅ User authenticated:", user.email);

  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      email: user.email,
      name: user.displayName || "User",
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  // Set central state (single source of truth)
  state.user = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split("@")[0]
  };

  console.log("Auth state ready:", state.user.uid);

  // Update UI with user name
  if (userNameEl) {
    userNameEl.textContent = state.user.displayName;
    console.log("✅ User name displayed:", state.user.displayName);
  }

  // Setup app
  setupNavigation();
  setupLogout();
  render("dashboard");

  console.log("🚀 Dashboard fully initialized");
});
