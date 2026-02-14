// ============================================
// VIEW TEMPLATES
// ============================================

export const views = {
  dashboard: (user) => `
    <div class="view-enter">
      <!-- Greeting Card -->
      <div class="card card-greeting animate-slide-up stagger-1">
        <h2 style="font-size: 28px; margin-bottom: 8px;">Good morning, ${user.name} 👋</h2>
        <p style="color: var(--text-secondary); font-size: 15px;">You have <strong>5 posts</strong> scheduled today.</p>
      </div>

      <div class="grid grid-3" style="margin-top: 32px; margin-bottom: 32px;">
        <!-- Content Planner Card -->
        <div class="card card-planner animate-slide-up stagger-2" style="grid-column: span 2;">
          <div class="card-header">
            <h3 class="card-title">Content Planner</h3>
            <a href="#" style="color: var(--accent-primary); font-size: 14px; text-decoration: none; font-weight: 500;">
              View full calendar →
            </a>
          </div>
          <div class="planner-grid">
            <div class="platform-card">
              <div class="platform-icon">
                <img src="/assets/images/platform-instagram.png" alt="Instagram" />
              </div>
              <div class="platform-info">
                <p class="platform-name">Instagram</p>
                <p class="platform-time">3:00 PM</p>
              </div>
            </div>
            <div class="platform-card">
              <div class="platform-icon">
                <img src="/assets/images/platform-tiktok.png" alt="TikTok" />
              </div>
              <div class="platform-info">
                <p class="platform-name">TikTok</p>
                <p class="platform-time">5:00 PM</p>
              </div>
            </div>
            <div class="platform-card">
              <div class="platform-icon">
                <img src="/assets/images/platform-youtube.png" alt="YouTube" />
              </div>
              <div class="platform-info">
                <p class="platform-name">YouTube</p>
                <p class="platform-time">8:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Posts -->
        <div class="card card-upcoming animate-slide-up stagger-3">
          <h3 class="card-title">Upcoming Posts</h3>
          <div class="stats-list">
            <div class="stat-row">
              <span style="color: var(--text-secondary); font-size: 14px;">Today</span>
              <strong style="color: var(--text-primary); font-size: 18px;">5</strong>
            </div>
            <div class="stat-row">
              <span style="color: var(--text-secondary); font-size: 14px;">Publishing today</span>
              <strong style="color: var(--text-primary); font-size: 18px;">3</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2" style="margin-bottom: 32px;">
        <!-- AI Caption Suggestions -->
        <div class="card card-captions animate-slide-up stagger-4">
          <h3 class="card-title" style="margin-bottom: 16px;">AI Caption Suggestions</h3>
          <div class="hashtags-container" style="margin-bottom: 16px;">
            <span class="hashtag-pill">#viralvideos</span>
            <span class="hashtag-pill">#trendalert</span>
            <span class="hashtag-pill">#fitnessgoals</span>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Generate new</button>
        </div>

        <!-- Performance Overview -->
        <div class="card card-performance animate-slide-up stagger-5">
          <h3 class="card-title" style="margin-bottom: 16px;">Performance Overview</h3>
          <div class="performance-stats">
            <div class="performance-item">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <img src="/assets/images/platform-instagram.png" style="width: 20px; height: 20px;" />
                <span style="color: var(--text-secondary); font-size: 14px;">Instagram</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px;">12.4k</strong>
                <span class="stat-change positive">↑ 12%</span>
              </div>
            </div>
            <div class="performance-item">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <img src="/assets/images/platform-tiktok.png" style="width: 20px; height: 20px;" />
                <span style="color: var(--text-secondary); font-size: 14px;">TikTok</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px;">67.8k</strong>
                <span class="stat-change positive">↑ 24%</span>
              </div>
            </div>
            <div class="performance-item">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <img src="/assets/images/platform-youtube.png" style="width: 20px; height: 20px;" />
                <span style="color: var(--text-secondary); font-size: 14px;">YouTube</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px;">6.3k</strong>
                <span class="stat-change positive">↑ 8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connected Accounts -->
      <div class="card card-accounts animate-slide-up stagger-6">
        <h3 class="card-title">Connected Accounts</h3>
        <div class="accounts-grid">
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="/assets/images/platform-instagram.png" style="width: 28px; height: 28px;" />
              <span style="font-size: 14px; font-weight: 500;">Instagram</span>
            </div>
            <span class="badge badge-success">✓</span>
          </div>
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="/assets/images/platform-tiktok.png" style="width: 28px; height: 28px;" />
              <span style="font-size: 14px; font-weight: 500;">TikTok</span>
            </div>
            <span class="badge badge-success">✓</span>
          </div>
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="/assets/images/platform-youtube.png" style="width: 28px; height: 28px;" />
              <span style="font-size: 14px; font-weight: 500;">YouTube</span>
            </div>
            <span class="badge badge-danger">✗</span>
          </div>
        </div>
      </div>
    </div>
  `,

  calendar: () => `
    <div class="view-enter">
      <div class="card">
        <h2 style="font-size: 24px; margin-bottom: 16px;">Calendar View</h2>
        <p style="color: var(--text-secondary);">Full calendar implementation coming soon...</p>
      </div>
    </div>
  `,

  clips: () => `
    <div class="view-enter">
      <div class="grid grid-3">
        ${[1, 2, 3, 4, 5, 6].map((i) => `
          <div class="card card-clip hover-lift animate-scale-in stagger-${i % 6 + 1}">
            <div style="aspect-ratio: 9/16; background: var(--bg-hover); border-radius: var(--radius-md); margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="var(--accent-primary)"/>
              </svg>
            </div>
            <p style="font-size: 14px; font-weight: 600;">Clip ${i}</p>
            <p style="font-size: 12px; color: var(--text-muted);">0:15 · Instagram</p>
          </div>
        `).join('')}
      </div>
    </div>
  `,

  accounts: () => `
    <div class="view-enter">
      <div class="grid grid-2">
        <div class="card card-account hover-lift animate-slide-up stagger-1">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="/assets/images/platform-instagram.png" style="width: 48px; height: 48px;" />
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">Instagram</h3>
              <span class="badge badge-success">Connected</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Disconnect</button>
        </div>
        <div class="card card-account hover-lift animate-slide-up stagger-2">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="/assets/images/platform-tiktok.png" style="width: 48px; height: 48px;" />
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">TikTok</h3>
              <span class="badge badge-success">Connected</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Disconnect</button>
        </div>
        <div class="card card-account hover-lift animate-slide-up stagger-3">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="/assets/images/platform-youtube.png" style="width: 48px; height: 48px;" />
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">YouTube</h3>
              <span class="badge badge-danger">Not Connected</span>
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%;">Connect Account</button>
        </div>
      </div>
    </div>
  `,

  analytics: () => `
    <div class="view-enter">
      <div class="grid grid-4" style="margin-bottom: 32px;">
        <div class="card card-stat hover-lift animate-scale-in stagger-1">
          <div class="stat-item">
            <span class="stat-label">Total Views</span>
            <span class="stat-value">1.2M</span>
            <span class="stat-change positive">↑ 23%</span>
          </div>
        </div>
        <div class="card card-stat hover-lift animate-scale-in stagger-2">
          <div class="stat-item">
            <span class="stat-label">Engagement</span>
            <span class="stat-value">8.4%</span>
            <span class="stat-change positive">↑ 12%</span>
          </div>
        </div>
        <div class="card card-stat hover-lift animate-scale-in stagger-3">
          <div class="stat-item">
            <span class="stat-label">New Followers</span>
            <span class="stat-value">12.3K</span>
            <span class="stat-change positive">↑ 18%</span>
          </div>
        </div>
        <div class="card card-stat hover-lift animate-scale-in stagger-4">
          <div class="stat-item">
            <span class="stat-label">Posts Published</span>
            <span class="stat-value">142</span>
            <span class="stat-change positive">↑ 5%</span>
          </div>
        </div>
      </div>
      <div class="card">
        <p style="color: var(--text-secondary);">Detailed analytics charts coming soon...</p>
      </div>
    </div>
  `,

  settings: () => `
    <div class="view-enter">
      <div class="card animate-slide-up">
        <h2 style="font-size: 24px; margin-bottom: 24px;">Settings</h2>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Display Name</label>
            <input type="text" class="search-input" style="width: 100%;" placeholder="Enter your name" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Email</label>
            <input type="email" class="search-input" style="width: 100%;" placeholder="Enter your email" />
          </div>
          <button class="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  `
};
