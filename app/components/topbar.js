// ─────────────────────────────────────────────────────────────────
// components/topbar.js - Topbar Component
// ─────────────────────────────────────────────────────────────────

import { appState } from '../js/state.js';
import { authManager } from '../js/auth.js';

export class TopbarComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.render();
      this.attachListeners();
      
      appState.subscribe(changes => {
        if (changes.type === 'USER_UPDATED') {
          this.updateUser(changes.payload);
        }
      });
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="topbar-left">
        <button id="mobileSidebarToggle" class="mobile-only-btn mobile-sidebar-toggle">
          <i class="fas fa-bars"></i>
        </button>
        <div class="topbar-brand desktop-only">
          <img src="/assets/images/logo.png" alt="ViralClip" class="topbar-brand-logo" />
          <span class="topbar-brand-name">ViralClip</span>
        </div>
      </div>

      <nav class="topbar-nav desktop-only">
        <a href="#/dashboard" class="topbar-nav-tab active" data-view="dashboard">Dashboard</a>
        <a href="#/calendar" class="topbar-nav-tab" data-view="calendar">Calendar</a>
        <a href="#/clips" class="topbar-nav-tab" data-view="clips">Clips</a>
        <a href="#/accounts" class="topbar-nav-tab" data-view="accounts">Accounts</a>
        <a href="#/analytics" class="topbar-nav-tab" data-view="analytics">Analytics</a>
      </nav>

      <div class="topbar-right">
        <div class="notification-center">
          <button id="topbar-notification-btn" class="notification-btn" type="button" aria-expanded="false" aria-controls="topbar-notification-dropdown">
            <span id="topbar-notification-badge" class="notification-badge">0</span>
            <span class="notification-icon" style="filter: none; font-size: 1.2rem;">🔔</span>
          </button>
          <div id="topbar-notification-dropdown" class="notification-dropdown">
            <div class="notification-dropdown-header">Notifications</div>
            <div id="topbar-notification-list" class="notification-list"></div>
          </div>
        </div>
        <button id="openCreatePostBtn" class="btn btn-primary topbar-create-btn desktop-only">
          <span>+</span> Create Post
        </button>
        <div class="user-avatar-container">
          <div id="userAvatarTrigger" class="user-avatar topbar-avatar-trigger">
            <img id="userAvatar" src="/assets/images/avatar.png" alt="User" class="img-sm topbar-avatar-image" />
            <span id="userName" class="topbar-user-name desktop-only">User</span>
          </div>

          <!-- Profile Dropdown -->
          <div id="topbarProfileDropdown" class="profile-dropdown">
            <div class="profile-header">
              <img id="dropdownAvatar" src="/assets/images/avatar.png" />
              <div>
                <p class="name" id="dropdownName">User Name</p>
                <p class="email" id="dropdownEmail">user@email.com</p>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button><img src="/assets/icons/dashboard.svg" class="dropdown-icon" /> Settings</button>
            <button><img src="/assets/icons/analytics.svg" class="dropdown-icon" /> Billing</button>
            <button><img src="/assets/icons/clips.svg" class="dropdown-icon" /> Help</button>
            <div class="dropdown-divider"></div>
            <button id="topbarLogoutBtn" class="logout"><img src="/assets/icons/logout.svg" class="dropdown-icon dropdown-icon-danger" /> Log out</button>
          </div>
        </div>
      </div>
    `;
  }

  attachListeners() {
    const mobileToggle = this.container.querySelector('#mobileSidebarToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.add('active');
        document.getElementById('sidebarOverlay')?.classList.add('active');
      });
    }

    // Profile Dropdown Toggle
    const avatarTrigger = this.container.querySelector('#userAvatarTrigger');
    const profileDropdown = this.container.querySelector('#topbarProfileDropdown');
    
    avatarTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown?.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (profileDropdown?.classList.contains('active') && !profileDropdown.contains(e.target) && !avatarTrigger.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileDropdown?.classList.contains('active')) {
        profileDropdown.classList.remove('active');
      }
    });

    // Logout
    const logoutBtn = this.container.querySelector('#topbarLogoutBtn');
    logoutBtn?.addEventListener('click', () => {
      authManager.handleLogout();
    });

    const openCreateBtn = this.container.querySelector('#openCreatePostBtn');
    openCreateBtn?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('OPEN_CREATE_POST'));
    });

    // Topbar nav tab click — dispatch view change
    this.container.querySelectorAll('.topbar-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const view = tab.dataset.view;
        if (view) window.location.hash = `#/${view}`;
      });
    });
  }

  updateUser(user) {
    const userNameEl = this.container?.querySelector('#userName');
    const dropdownNameEl = this.container?.querySelector('#dropdownName');
    const dropdownEmailEl = this.container?.querySelector('#dropdownEmail');
    
    if (user) {
      const name = user.displayName || user.email.split('@')[0];
      if (userNameEl) userNameEl.textContent = name;
      if (dropdownNameEl) dropdownNameEl.textContent = name;
      if (dropdownEmailEl) dropdownEmailEl.textContent = user.email;
    }
  }

  setActive(viewName) {
    this.container?.querySelectorAll('.topbar-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });
  }
}
