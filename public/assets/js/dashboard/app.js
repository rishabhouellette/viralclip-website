// ============================================
// MAIN APPLICATION CONTROLLER
// ============================================

import { state, updateState } from './state.js';
import { views } from './views.js';
import { updateTopbar } from './topbar.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import "/assets/js/firebase.js";

const auth = getAuth();

// ============================================
// VIEW SWITCHER
// ============================================
function switchView(viewName) {
  const content = document.getElementById('dashboard-content');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const topNavItems = document.querySelectorAll('.top-nav-item');
  
  // Update sidebar active state
  sidebarItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update top nav active state
  topNavItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update state
  updateState({ activeView: viewName });
  
  // Update topbar
  updateTopbar(viewName);
  
  // Render view content
  if (content && views[viewName]) {
    content.innerHTML = views[viewName](state.user);
  }
}

// ============================================
// NAVIGATION SETUP
// ============================================
function setupNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const topNavItems = document.querySelectorAll('.top-nav-item');
  
  // Sidebar navigation
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = item.dataset.view;
      switchView(viewName);
    });
  });
  
  // Top nav navigation
  topNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = item.dataset.view;
      switchView(viewName);
    });
  });
}

// ============================================
// LOGOUT HANDLER
// ============================================
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out. Please try again.');
      }
    });
  }
}

// ============================================
// AUTH STATE HANDLER
// ============================================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  
  // Update user state
  const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
  updateState({
    user: {
      name: userName,
      email: user.email,
      plan: 'Pro',
      avatar: user.photoURL
    }
  });
  
  // Update user name in sidebar
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = userName;
  }
  
  // Initialize app
  setupNavigation();
  setupLogout();
  switchView('dashboard'); // Load default view
  
  console.log('✅ Dashboard initialized for:', userName);
});

// ============================================
// ERROR HANDLER
// ============================================
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
});
