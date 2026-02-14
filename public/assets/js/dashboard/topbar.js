// ============================================
// TOP BAR CONTROLLER
// ============================================

export const topbarConfigs = {
  dashboard: () => `
    <input type="text" class="search-input" placeholder="Search posts, analytics..." />
    <div style="display: flex; align-items: center; gap: 16px;">
      <button class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Create Post
      </button>
      <div class="profile-avatar"></div>
    </div>
  `,

  calendar: () => `
    <div style="display: flex; align-items: center; gap: 16px;">
      <button class="btn btn-secondary">Today</button>
      <div style="display: flex; gap: 4px; background: var(--bg-card); border-radius: var(--radius-md); padding: 4px;">
        <button class="btn btn-secondary" style="padding: 8px 16px;">Week</button>
        <button class="btn btn-secondary" style="padding: 8px 16px;">Month</button>
      </div>
    </div>
    <button class="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Create Post
    </button>
  `,

  clips: () => `
    <div style="display: flex; gap: 16px;">
      <select class="search-input" style="width: 150px;">
        <option>All Platforms</option>
        <option>Instagram</option>
        <option>TikTok</option>
        <option>YouTube</option>
      </select>
      <select class="search-input" style="width: 150px;">
        <option>Sort by Date</option>
        <option>Sort by Views</option>
        <option>Sort by Likes</option>
      </select>
    </div>
    <button class="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Upload Clip
    </button>
  `,

  accounts: () => `
    <h2 style="font-size: 20px; font-weight: 700;">Connected Accounts</h2>
    <button class="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Connect Account
    </button>
  `,

  analytics: () => `
    <select class="search-input" style="width: 200px;">
      <option>Last 7 days</option>
      <option>Last 30 days</option>
      <option>Last 90 days</option>
      <option>All time</option>
    </select>
    <button class="btn btn-secondary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Export
    </button>
  `,

  settings: () => `
    <h2 style="font-size: 20px; font-weight: 700;">Settings</h2>
    <button class="btn btn-primary">Save Changes</button>
  `
};

export function updateTopbar(view) {
  const topbar = document.getElementById('topbar');
  if (topbar && topbarConfigs[view]) {
    topbar.innerHTML = topbarConfigs[view]();
  }
}
