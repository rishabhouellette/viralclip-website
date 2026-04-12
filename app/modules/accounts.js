// ─────────────────────────────────────────────────────────────────
// modules/accounts.js - Connected accounts management (Firebase-powered)
// Uses real OAuth via Firebase Functions - no external backend needed
// ─────────────────────────────────────────────────────────────────

import { getAccounts, connectAccount, disconnectAccount, updateAnalytics } from '../services/firestoreService.js';
import { fyixtService } from '../services/fyixtService.js';
import { appState } from '../js/state.js';
import { showToast, escapeHtml } from '../js/app.js';

export class AccountsModule {
  constructor() {
    this.accountsGrid = document.getElementById('accountsGrid');
    
    // Platform configuration with OAuth support status
    // All platforms support OAuth - some may show "Coming Soon" if credentials not configured
    this.platforms = [
      {
        id: 'youtube',
        label: 'YouTube',
        availability: 'active',
        oauthSupported: true, // Real OAuth via Firebase Functions
        icon: '<div class="platform-icon"><img src="/assets/images/platform-youtube.png" class="platform-icon-img" alt="YouTube" /></div>',
      },
      {
        id: 'facebook',
        label: 'Facebook',
        availability: 'active',
        oauthSupported: true, // Real OAuth via Firebase Functions
        icon: '<div class="platform-icon"><img src="/assets/images/facebook.png" class="platform-icon-img" alt="Facebook" /></div>',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        availability: 'active',
        oauthSupported: true, // Real OAuth via Firebase Functions (via Facebook)
        icon: '<div class="platform-icon"><img src="/assets/images/platform-instagram.png" class="platform-icon-img" alt="Instagram" /></div>',
      },
      {
        id: 'twitter',
        label: 'X (Twitter)',
        availability: 'active',
        oauthSupported: true, // OAuth ready - needs API credentials
        icon: '<div class="platform-icon"><img src="/assets/images/twitter.png" class="platform-icon-img" alt="X (Twitter)" /></div>',
      },
      {
        id: 'tiktok',
        label: 'TikTok',
        availability: 'active',
        oauthSupported: true, // OAuth ready - needs API credentials
        icon: '<div class="platform-icon"><img src="/assets/images/platform-tiktok.png" class="platform-icon-img" alt="TikTok" /></div>',
      },
      {
        id: 'threads',
        label: 'Threads',
        availability: 'active',
        oauthSupported: true, // OAuth ready - needs Meta API credentials
        icon: '<div class="platform-icon"><img src="/assets/images/threads.png" class="platform-icon-img" alt="Threads" /></div>',
      },
    ];

    appState.subscribe(changes => {
      if (changes.type === 'ACCOUNTS_UPDATED') {
        if (document.getElementById('view-accounts')?.classList.contains('active')) {
          this.render();
        }
      }
    });

    // Listen for OAuth callback messages
    this._setupOAuthListener();
  }

  /**
   * Setup listener for OAuth callback via postMessage
   * This handles messages from the OAuth popup window
   */
  _setupOAuthListener() {
    // Handle OAuth popup postMessage callback
    window.addEventListener('message', async (event) => {
      // Handle oauth_success from popup
      if (event.data?.type === 'oauth_success') {
        const { platform, accountId, name, username } = event.data;
        console.log(`[Accounts] OAuth success for ${platform}:`, { accountId, name, username });
        showToast(`Successfully connected to ${platform}!`, 'success');
        await this.loadAccounts();
        this.render();
        return;
      }
      
      // Handle oauth_error from popup
      if (event.data?.type === 'oauth_error') {
        const { platform, error } = event.data;
        console.error(`[Accounts] OAuth error for ${platform}:`, error);
        showToast(error || `Failed to connect to ${platform}`, 'error');
        return;
      }
      
      // Legacy: Handle oauth_callback type
      if (event.data?.type === 'oauth_callback') {
        const { platform, success, account, error } = event.data;
        if (success && account) {
          showToast(`Successfully connected to ${platform}!`, 'success');
          await this.loadAccounts();
          this.render();
        } else {
          showToast(error || `Failed to connect to ${platform}`, 'error');
        }
      }
    });

    // Check URL for OAuth callback parameters (fallback for non-popup flow)
    this._checkUrlForOAuthCallback();
  }

  /**
   * Check if current URL has OAuth callback parameters
   * Firebase Functions redirect to /?oauth=success&platform=youtube
   */
  async _checkUrlForOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const oauth = urlParams.get('oauth');
    const oauthPlatform = urlParams.get('platform');
    const oauthError = urlParams.get('error');

    // Handle oauth=success (from Firebase Functions)
    if (oauth === 'success' && oauthPlatform) {
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(`Successfully connected to ${oauthPlatform}!`, 'success');
      await this.loadAccounts();
      this.render();
      return;
    }
    
    // Handle legacy oauth_success=true format
    const oauthSuccess = urlParams.get('oauth_success');
    if (oauthSuccess === 'true' && oauthPlatform) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(`Successfully connected to ${oauthPlatform}!`, 'success');
      await this.loadAccounts();
      this.render();
      return;
    }
    
    // Handle errors
    if (oauth === 'error' || oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(`OAuth error: ${oauthError || 'Connection failed'}`, 'error');
    }
  }

  async loadAccounts() {
    try {
      const user = appState.getState().user;
      if (!user) throw new Error('User not authenticated');

      // Load accounts from Firebase Functions (which reads from Firestore)
      try {
        const response = await fyixtService.getAccounts();
        if (response && response.accounts) {
          // Also get Firestore accounts for any manual connections
          const firestoreAccounts = await getAccounts(user.uid);
          const mergedAccounts = this._mergeAccounts(firestoreAccounts, response.accounts);
          appState.setAccounts(mergedAccounts);
          return;
        }
      } catch (error) {
        console.warn('[Accounts] Firebase accounts fetch failed:', error.message);
      }

      // Fallback to Firestore only
      const accounts = await getAccounts(user.uid);
      appState.setAccounts(accounts);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  /**
   * Merge accounts from Firestore and Firebase Functions
   */
  _mergeAccounts(firestoreAccounts, firebaseAccounts) {
    const accountMap = new Map();
    
    // Add Firestore accounts first
    firestoreAccounts.forEach(acc => {
      accountMap.set(acc.platform || acc.id, acc);
    });
    
    // Overlay Firebase OAuth accounts (they have real OAuth tokens)
    firebaseAccounts.forEach(acc => {
      const existing = accountMap.get(acc.platform);
      if (existing) {
        // Merge, preferring Firebase data for OAuth-related fields
        accountMap.set(acc.platform, {
          ...existing,
          ...acc,
          source: 'firebase',
          hasRealOAuth: true,
        });
      } else {
        accountMap.set(acc.platform, {
          ...acc,
          source: 'firebase',
          hasRealOAuth: true,
        });
      }
    });
    
    return Array.from(accountMap.values());
  }

  render() {
    if (!this.accountsGrid) return;
    const accounts = appState.getState().accounts || [];
    const accountMap = {};
    accounts.forEach(acc => {
      accountMap[acc.platform || acc.id] = acc;
    });

    const html = this.platforms.map(platform => {
      const account = accountMap[platform.id];
      const isActivePlatform = platform.availability === 'active';
      const connected = isActivePlatform && !!account;
      const hasRealOAuth = account?.hasRealOAuth || account?.source === 'fyixt';
      const cardClasses = ['account-card'];

      if (!isActivePlatform) {
        cardClasses.push('account-card--coming-soon');
      }
      
      if (hasRealOAuth) {
        cardClasses.push('account-card--oauth');
      }

      const statusClass = !isActivePlatform
        ? 'coming-soon'
        : connected
          ? 'connected'
          : 'disconnected';

      const statusText = !isActivePlatform
        ? 'Coming soon'
        : connected
          ? (hasRealOAuth ? '✓ Connected (OAuth)' : '✓ Connected')
          : '✗ Disconnected';

      const usernameText = !isActivePlatform
        ? 'Integration not yet available'
        : connected && (account.username || account.name)
          ? `@${escapeHtml(account.username || account.name)}`
          : 'Not connected';

      let actionMarkup;
      if (!isActivePlatform) {
        actionMarkup = `
          <button class="btn btn-secondary account-coming-soon-btn" type="button" disabled aria-disabled="true">
            Coming Soon
          </button>
          <div class="account-meta-label">Coming soon</div>
        `;
      } else if (connected) {
        actionMarkup = `<button class="btn btn-secondary btn-disconnect" data-platform="${platform.id}">Disconnect</button>`;
      } else if (platform.oauthSupported) {
        actionMarkup = `<button class="btn btn-primary primary-btn btn-connect-oauth account-connect-btn" data-platform="${platform.id}">
          <span class="btn-icon">🔐</span> Connect with OAuth
        </button>`;
      } else {
        actionMarkup = `<button class="btn btn-primary primary-btn btn-connect account-connect-btn" data-platform="${platform.id}">Connect</button>`;
      }

      return `
        <div class="${cardClasses.join(' ')}">
          <div class="account-icon account-platform-icon">${platform.icon}</div>
          <div class="account-name">${platform.label}</div>
          <div class="account-status ${statusClass}">${statusText}</div>
          <div class="account-username">${usernameText}</div>
          <div class="account-actions">${actionMarkup}</div>
        </div>
      `;
    }).join('');

    this.accountsGrid.innerHTML = html;
    
    // OAuth Connect Buttons
    this.accountsGrid.querySelectorAll('.btn-connect-oauth').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        this.connectWithOAuth(platform);
      });
    });

    // Manual Connect Buttons (for platforms without OAuth)
    this.accountsGrid.querySelectorAll('.btn-connect:not(.btn-connect-oauth)').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        this.connectAccountManually(platform);
      });
    });

    // Disconnect Buttons
    this.accountsGrid.querySelectorAll('.btn-disconnect').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        this.disconnectAccount(platform);
      });
    });
  }

  /**
   * Connect account using real OAuth via Firebase Functions
   */
  async connectWithOAuth(platform) {
    try {
      showToast(`Starting ${platform} OAuth...`, 'info');
      
      // Get user ID for state parameter
      const user = appState.getState().user;
      const userId = user?.uid || 'anonymous';
      
      // Get OAuth URL from Firebase Functions
      const response = await fetch(`/oauth/start/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          returnUrl: window.location.origin + '/app/accounts',
        }),
      });
      
      const data = await response.json();
      
      // Check if platform is not configured (credentials missing)
      if (data.configured === false) {
        showToast(data.message || `${platform} OAuth is coming soon. Please connect manually.`, 'info');
        return this.connectAccountManually(platform);
      }
      
      const authUrl = data.auth_url;
      
      if (!authUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      console.log(`[Accounts] Opening OAuth popup for ${platform}`);

      // Open OAuth popup
      const width = 500;
      const height = 700;
      const left = (window.innerWidth - width) / 2 + window.screenX;
      const top = (window.innerHeight - height) / 2 + window.screenY;
      
      const popup = window.open(
        authUrl,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      if (!popup) {
        // Popup blocked - show instructions
        showToast('Popup blocked! Please allow popups for this site and try again.', 'error');
        return;
      }

      // Focus the popup
      popup.focus();

    } catch (error) {
      console.error('[Accounts] OAuth error:', error);
      showToast(`OAuth failed: ${error.message}`, 'error');
    }
  }

  /**
   * Connect account manually (for platforms without OAuth support)
   */
  async connectAccountManually(platform) {
    const username = prompt(`Enter your ${platform} username:`);
    if (!username) return;

    try {
      const user = appState.getState().user;
      if (!user) throw new Error('User not authenticated');

      const accountData = {
        username,
        followers: Math.floor(Math.random() * 50000) + 1000,
        source: 'manual',
      };

      await connectAccount(user.uid, platform, accountData);

      await updateAnalytics(user.uid, platform, {
        reach: Math.floor(Math.random() * 100000),
        engagement: Math.floor(Math.random() * 10000),
        engagementRate: Number((Math.random() * 8 + 1).toFixed(2)),
        followers: accountData.followers,
        growthRate: Number((Math.random() * 5 + 0.5).toFixed(2)),
      });

      await this.loadAccounts();
      showToast(`Connected to ${platform}`, 'success');
      this.render();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async disconnectAccount(platform) {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      const user = appState.getState().user;
      if (!user) throw new Error('User not authenticated');

      await disconnectAccount(user.uid, platform);
      
      const updatedAccounts = appState.getState().accounts.filter(acc => 
        acc.platform !== platform && acc.id !== platform
      );
      appState.setAccounts(updatedAccounts);

      showToast(`Disconnected from ${platform}`, 'success');
      this.render();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
}

export const accountsModule = new AccountsModule();
