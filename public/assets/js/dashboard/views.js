// ============================================
// VIEW TEMPLATES
// ============================================

export const views = {
  dashboard: (user) => `
    <div class="view-enter">
      <!-- Greeting Card -->
      <div class="card animate-slide-up stagger-1" style="margin-bottom: 24px;">
        <h2 style="font-size: 28px; margin-bottom: 8px;">Good morning, ${user.name} 👋</h2>
        <p style="color: var(--text-secondary);">You have <strong>5 posts</strong> scheduled today.</p>
      </div>

      <div class="grid grid-3" style="margin-bottom: 32px;">
        <!-- Content Planner Preview -->
        <div class="card hover-lift animate-slide-up stagger-2" style="grid-column: span 2;">
          <div class="card-header">
            <h3 class="card-title">Content Planner</h3>
            <a href="#" style="color: var(--accent-primary); font-size: 14px; text-decoration: none;">
              View full calendar →
            </a>
          </div>
          <div style="display: flex; gap: 24px;">
            <div class="platform-pill">
              <img src="/assets/images/platform-instagram.png" alt="Instagram" />
              Instagram · 3:00 PM
            </div>
            <div class="platform-pill">
              <img src="/assets/images/platform-tiktok.png" alt="TikTok" />
              TikTok · 5:00 PM
            </div>
            <div class="platform-pill">
              <img src="/assets/images/platform-youtube.png" alt="YouTube" />
              YouTube · 8:00 PM
            </div>
          </div>
        </div>

        <!-- Upcoming Posts -->
        <div class="card hover-lift animate-slide-up stagger-3">
          <div class="card-header">
            <h3 class="card-title">Upcoming Posts</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary); font-size: 14px;">Today</span>
              <strong style="color: var(--text-primary);">5</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary); font-size: 14px;">Publishing today</span>
              <strong style="color: var(--text-primary);">3</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2" style="margin-bottom: 32px;">
        <!-- AI Caption Suggestions -->
        <div class="card hover-lift animate-slide-up stagger-4">
          <div class="card-header">
            <h3 class="card-title">AI Caption Suggestions</h3>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
            <span class="hashtag-pill">#viralvideos</span>
            <span class="hashtag-pill">#trendalert</span>
            <span class="hashtag-pill">#fitnessgoals</span>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Generate new</button>
        </div>

        <!-- Performance Overview -->
        <div class="card hover-lift animate-slide-up stagger-5">
          <div class="card-header">
            <h3 class="card-title">Performance Overview</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary); font-size: 14px;">Instagram</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 18px;">12.4k</strong>
                <span class="stat-change positive">↑ 12%</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary); font-size: 14px;">TikTok</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 18px;">67.8k</strong>
                <span class="stat-change positive">↑ 24%</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary); font-size: 14px;">YouTube</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 18px;">6.3k</strong>
                <span class="stat-change positive">↑ 8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connected Accounts -->
      <div class="card hover-lift animate-slide-up stagger-6">
        <div class="card-header">
          <h3 class="card-title">Connected Accounts</h3>
        </div>
        <div style="display: flex; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/assets/images/platform-instagram.png" style="width: 24px; height: 24px;" />
            <span style="font-size: 14px;">Instagram</span>
            <span class="badge badge-success">✓</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/assets/images/platform-tiktok.png" style="width: 24px; height: 24px;" />
            <span style="font-size: 14px;">TikTok</span>
            <span class="badge badge-success">✓</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/assets/images/platform-youtube.png" style="width: 24px; height: 24px;" />
            <span style="font-size: 14px;">YouTube</span>
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
          <div class="card hover-lift animate-scale-in stagger-${i % 6 + 1}">
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
        <div class="card hover-lift animate-slide-up stagger-1">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="/assets/images/platform-instagram.png" style="width: 48px; height: 48px;" />
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">Instagram</h3>
              <span class="badge badge-success">Connected</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Disconnect</button>
        </div>
        <div class="card hover-lift animate-slide-up stagger-2">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="/assets/images/platform-tiktok.png" style="width: 48px; height: 48px;" />
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">TikTok</h3>
              <span class="badge badge-success">Connected</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;">Disconnect</button>
        </div>
        <div class="card hover-lift animate-slide-up stagger-3">
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
        <div class="card hover-lift animate-scale-in stagger-1">
          <div class="stat-item">
            <span class="stat-label">Total Views</span>
            <span class="stat-value">1.2M</span>
            <span class="stat-change positive">↑ 23%</span>
          </div>
        </div>
        <div class="card hover-lift animate-scale-in stagger-2">
          <div class="stat-item">
            <span class="stat-label">Engagement</span>
            <span class="stat-value">8.4%</span>
            <span class="stat-change positive">↑ 12%</span>
          </div>
        </div>
        <div class="card hover-lift animate-scale-in stagger-3">
          <div class="stat-item">
            <span class="stat-label">New Followers</span>
            <span class="stat-value">12.3K</span>
            <span class="stat-change positive">↑ 18%</span>
          </div>
        </div>
        <div class="card hover-lift animate-scale-in stagger-4">
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
