import { views } from "./views.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import "/assets/js/firebase.js";

const auth = getAuth();

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
        window.location.href = "/login.html";
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
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("❌ No user logged in, redirecting...");
    window.location.href = "/login.html";
    return;
  }

  console.log("✅ User authenticated:", user.email);

  // Set user state
  appState.user = {
    name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
    email: user.email,
    plan: "Pro"
  };

  // Update UI with user name
  if (userNameEl) {
    userNameEl.textContent = appState.user.name;
    console.log("✅ User name displayed:", appState.user.name);
  }

  // Setup app
  setupNavigation();
  setupLogout();
  render("dashboard");

  console.log("🚀 Dashboard fully initialized");
});
