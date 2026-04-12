// ─────────────────────────────────────────────────────────────────
// components/sidebar.js - Sidebar Component
// ─────────────────────────────────────────────────────────────────

import { authManager } from '../js/auth.js';
import { appState } from '../js/state.js';

export class SidebarComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.render();
      this.attachListeners();

      // Re-render profile card whenever user state changes
      appState.subscribe((changes) => {
        if (changes.type === 'USER_UPDATED') {
          this.updateProfileCard(changes.payload);
        }
      });
    }
  }

  getUserDisplayName(user) {
    if (!user) return 'User';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }

  getUserInitials(user) {
    const name = this.getUserDisplayName(user);
    return name.slice(0, 2).toUpperCase();
  }

  render() {
    const user = appState.getState().user;
    const displayName = this.getUserDisplayName(user);
    const initials = this.getUserInitials(user);
    const email = user?.email || '';

    this.container.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/assets/images/logo.png" alt="ViralClip Logo" class="logo-icon sidebar-logo-image" />
          <span class="logo-text">ViralClip</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a href="#/dashboard" class="nav-item nav-item--left active flex-center gap-sm" data-view="dashboard">
          <img src="/assets/icons/dashboard.svg" alt="Dashboard" class="nav-icon icon-md" />
          <span class="nav-text">Dashboard</span>
        </a>
        <a href="#/calendar" class="nav-item nav-item--left flex-center gap-sm" data-view="calendar">
          <img src="/assets/icons/calendar.svg" alt="Calendar" class="nav-icon icon-md" />
          <span class="nav-text">Calendar</span>
        </a>
        <a href="#/clips" class="nav-item nav-item--left flex-center gap-sm" data-view="clips">
          <img src="/assets/icons/clips.svg" alt="Clips" class="nav-icon icon-md" />
          <span class="nav-text">Clips</span>
        </a>
        <a href="#/ai-coach" class="nav-item nav-item--left flex-center gap-sm" data-view="ai-coach">
          <span class="nav-icon icon-md" style="font-size: 16px;">✨</span>
          <span class="nav-text">AI Coach</span>
          <span class="nav-badge-new">NEW</span>
        </a>
        <a href="#/accounts" class="nav-item nav-item--left flex-center gap-sm" data-view="accounts">
          <img src="/assets/icons/accounts.svg" alt="Accounts" class="nav-icon icon-md" />
          <span class="nav-text">Accounts</span>
        </a>
        <a href="#/analytics" class="nav-item nav-item--left flex-center gap-sm" data-view="analytics">
          <img src="/assets/icons/analytics.svg" alt="Analytics" class="nav-icon icon-md" />
          <span class="nav-text">Analytics</span>
        </a>
        <a href="#/engagement" class="nav-item nav-item--left flex-center gap-sm" data-view="engagement">
          <span class="nav-icon icon-md" style="font-size: 16px;">💬</span>
          <span class="nav-text">Engagement</span>
        </a>
        <a href="#/settings" class="nav-item nav-item--left flex-center gap-sm" data-view="settings">
          <img src="/assets/icons/settings.svg" alt="Settings" class="nav-icon icon-md" />
          <span class="nav-text">Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <!-- Upgrade Button -->
        <a href="#/upgrade" class="sidebar-upgrade-btn">
          <span>⬆</span> Upgrade
        </a>

        <!-- Dynamic User Profile Card with Dropdown -->
        <div class="user-profile-card sidebar-profile-card" id="userProfileCard">
          <div id="sidebarAvatar" class="sidebar-avatar">${initials}</div>
          <div class="profile-info sidebar-profile-info">
            <span class="profile-name" id="sidebarUserName">${displayName}</span>
            <span id="sidebarUserEmail" class="sidebar-email">${email}</span>
          </div>
          <span id="sidebarProfileChevron" class="sidebar-chevron">▲</span>

          <!-- Dropdown Menu (pops up above the card) -->
          <div id="sidebarProfileDropdown" class="sidebar-profile-dropdown">
            <div class="sidebar-profile-head">
              <div class="sidebar-profile-label">Signed in as</div>
              <div id="sidebarProfileValue" class="sidebar-profile-value">${email}</div>
            </div>
            <button id="userSettingsBtn" class="sidebar-profile-action">
              <img src="/assets/icons/settings.svg" alt="Settings" class="icon-sm" /> User Settings
            </button>
            <div class="sidebar-profile-divider"></div>
            <button id="logoutBtn" class="sidebar-profile-action logout">
              <img src="/assets/icons/logout.svg" alt="Log Out" class="icon-sm" /> Log Out
            </button>
          </div>
        </div>
      </div>
    `;
  }

  updateProfileCard(user) {
    const displayName = this.getUserDisplayName(user);
    const initials = this.getUserInitials(user);
    const email = user?.email || '';

    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    const avatarEl = document.getElementById('sidebarAvatar');

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = initials;

    // Update the "Signed in as" line inside the dropdown
    const profileValueEl = this.container?.querySelector('#sidebarProfileValue');
    if (profileValueEl) profileValueEl.textContent = email;
  }

  attachListeners() {
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.container.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Profile card dropdown toggle
    const profileCard = this.container.querySelector('#userProfileCard');
    const dropdown = this.container.querySelector('#sidebarProfileDropdown');
    const chevron = this.container.querySelector('#sidebarProfileChevron');

    if (profileCard && dropdown) {
      profileCard.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.classList.contains('active');
        dropdown.classList.toggle('active', !isVisible);
        if (chevron) chevron.textContent = isVisible ? '▲' : '▼';
      });

      // Close dropdown when clicking anywhere outside
      document.addEventListener('click', () => {
        dropdown.classList.remove('active');
        if (chevron) chevron.textContent = '▲';
      });
    }

    // Logout
    const logoutBtn = this.container.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        authManager.handleLogout();
      });
    }

    // User Settings
    const settingsBtn = this.container.querySelector('#userSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown) dropdown.classList.remove('active');
        window.location.hash = '#/accounts';
      });
    }
  }

  setActive(viewName) {
    this.container?.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
      if (nav.dataset.view === viewName) {
        nav.classList.add('active');
      }
    });
  }
}
