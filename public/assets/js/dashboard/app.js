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
    logoutBtn.removeEventListener('click', handleLogout);
    logoutBtn.addEventListener('click', handleLogout);
  } else {
    console.warn('Logout button not found');
  }
}

async function handleLogout(e) {
  e.preventDefault();
  e.stopPropagation();
  
  try {
    console.log('Attempting logout...');
    await signOut(auth);
    console.log('Logout successful, redirecting to login...');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Failed to log out. Please try again.');
  }
}

// ============================================
// AUTH STATE HANDLER
// ============================================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log('No user authenticated, redirecting to login');
    window.location.href = '/login.html';
    return;
  }
  
  console.log('User authenticated:', user.email);
  
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
  
  // Update user name in sidebar footer
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = userName;
    console.log('✅ User name updated:', userName);
  } else {
    console.warn('User name element not found');
  }
  
  // Update profile avatar styling
  const topAvatar = document.getElementById('top-avatar');
  if (topAvatar) {
    topAvatar.style.width = '40px';
    topAvatar.style.height = '40px';
    topAvatar.style.borderRadius = '50%';
    topAvatar.style.objectFit = 'contain';
    topAvatar.style.padding = '4px';
    console.log('✅ Top avatar styled');
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
