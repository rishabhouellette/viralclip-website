export const views = {
  dashboard: {
    topbar: () => `
      <div style="display: flex; gap: 12px;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Dashboard</h3>
      </div>
      <button class="primary-btn">+ Create Post</button>
    `,
    content: (user) => `
      <section class="card">
        <h2 style="margin-top: 0;">Welcome, ${user?.name || 'User'}!</h2>
        <p style="color: #6B7280;">You have 5 posts scheduled today.</p>
      </section>

      <div class="grid-2">
        <section class="card">
          <h3>Content Planner</h3>
          <div class="planner-grid">
            <div class="platform-card">
              <div class="platform-icon">📱</div>
              <div class="platform-info">
                <div class="platform-name">Instagram</div>
                <div class="platform-time">2:00 PM Today</div>
              </div>
            </div>
            <div class="platform-card">
              <div class="platform-icon">🎵</div>
              <div class="platform-info">
                <div class="platform-name">TikTok</div>
                <div class="platform-time">3:30 PM Today</div>
              </div>
            </div>
            <div class="platform-card">
              <div class="platform-icon">▶️</div>
              <div class="platform-info">
                <div class="platform-name">YouTube</div>
                <div class="platform-time">Tomorrow</div>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <h3>Upcoming Posts</h3>
          <div class="stats-list">
            <div class="stat-row">
              <span>Today</span>
              <strong>3 posts</strong>
            </div>
            <div class="stat-row">
              <span>This Week</span>
              <strong>12 posts</strong>
            </div>
            <div class="stat-row">
              <span>This Month</span>
              <strong>48 posts</strong>
            </div>
          </div>
        </section>
      </div>

      <section class="card">
        <h3>Performance Overview</h3>
        <div class="performance-stats">
          <div class="performance-item">
            <strong>Total Reach</strong>
            <div style="font-size: 24px; font-weight: 700; color: #2563EB;">24.5K</div>
            <div style="font-size: 12px; color: #10B981;">↑ 12% from last week</div>
          </div>
          <div class="performance-item">
            <strong>Engagement Rate</strong>
            <div style="font-size: 24px; font-weight: 700; color: #8B5CF6;">6.8%</div>
            <div style="font-size: 12px; color: #10B981;">↑ 2.3% from last week</div>
          </div>
        </div>
      </section>
    `
  },

  calendar: {
    topbar: () => `
      <h3>Content Planner</h3>
      <button class="primary-btn">+ Create Post</button>
    `,
    content: () => `
      <section class="planner-card">
        <div class="planner-header">
          <h2>Today</h2>
        </div>

        <div class="planner-grid">

          <div class="platform-card instagram">
            <img src="/assets/images/platform-instagram-float.png" />
            <div>
              <strong>Instagram</strong>
              <span>3:00 PM</span>
            </div>
          </div>

          <div class="platform-card tiktok">
            <img src="/assets/images/platform-tiktok-float.png" />
            <div>
              <strong>TikTok</strong>
              <span>5:00 PM</span>
            </div>
          </div>

          <div class="platform-card youtube">
            <img src="/assets/images/platform-youtube-float.png" />
            <div>
              <strong>YouTube</strong>
              <span>8:00 PM</span>
            </div>
          </div>

        </div>
      </section>
    `
  },

  clips: {
    topbar: () => `
      <h3>Clips</h3>
      <button class="primary-btn">+ Upload Clip</button>
    `,
    content: () => `
      <section class="clips-grid">

        <div class="clip-card">
          <div class="clip-thumb">
            <img src="/assets/images/dashboard-mock.png" alt="Clip thumbnail">
            <div class="play-overlay">▶</div>
            <span class="duration">0:12</span>
          </div>
          <div class="clip-meta">
            <strong>Morning routine reel</strong>
            <div class="clip-status">
              <span class="pill unused">Unused</span>
            </div>
          </div>
        </div>

        <div class="clip-card">
          <div class="clip-thumb">
            <img src="/assets/images/feature-icon-clips.png">
            <div class="play-overlay">▶</div>
            <span class="duration">0:08</span>
          </div>
          <div class="clip-meta">
            <strong>Product teaser</strong>
            <div class="clip-status">
              <span class="pill scheduled">Scheduled</span>
              <img src="/assets/images/platform-instagram-float.png">
            </div>
          </div>
        </div>

        <div class="clip-card">
          <div class="clip-thumb">
            <img src="/assets/images/dashboard-mock-perspective.png">
            <div class="play-overlay">▶</div>
            <span class="duration">0:15</span>
          </div>
          <div class="clip-meta">
            <strong>Behind the scenes</strong>
            <div class="clip-status">
              <span class="pill published">Published</span>
              <img src="/assets/images/platform-tiktok-float.png">
              <img src="/assets/images/platform-youtube-float.png">
            </div>
          </div>
        </div>

      </section>
    `
  },

  accounts: {
    topbar: () => `
      <div style="display: flex; gap: 12px;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Accounts</h3>
      </div>
      <button class="primary-btn">+ Connect Account</button>
    `,
    content: () => `
      <section class="card">
        <h2 style="margin-top: 0;">Connected Accounts</h2>
        <div class="accounts-grid">
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px;">📱</div>
              <span>Instagram</span>
            </div>
            <span style="color: #10B981; font-weight: 600;">✅ Connected</span>
          </div>
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px;">🎵</div>
              <span>TikTok</span>
            </div>
            <span style="color: #10B981; font-weight: 600;">✅ Connected</span>
          </div>
          <div class="account-item">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px;">▶️</div>
              <span>YouTube</span>
            </div>
            <span style="color: #9CA3AF; font-weight: 600;">❌ Not Connected</span>
          </div>
        </div>
      </section>
    `
  },

  analytics: {
    topbar: () => `
      <div style="display: flex; gap: 12px;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Analytics</h3>
      </div>
      <select style="padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; cursor: pointer;">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
      </select>
    `,
    content: () => `
      <section class="card">
        <h2 style="margin-top: 0;">Performance Metrics</h2>
        <div class="chart-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; height: 300px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
          📊 Chart visualization coming soon
        </div>
      </section>

      <div class="grid-3">
        <section class="card">
          <h3>Impressions</h3>
          <div style="font-size: 28px; font-weight: 700; color: #2563EB;">156.8K</div>
          <div style="font-size: 12px; color: #10B981;">↑ 28% from last period</div>
        </section>
        <section class="card">
          <h3>Clicks</h3>
          <div style="font-size: 28px; font-weight: 700; color: #8B5CF6;">12.3K</div>
          <div style="font-size: 12px; color: #10B981;">↑ 15% from last period</div>
        </section>
        <section class="card">
          <h3>Conversions</h3>
          <div style="font-size: 28px; font-weight: 700; color: #EC4899;">847</div>
          <div style="font-size: 12px; color: #10B981;">↑ 8% from last period</div>
        </section>
      </div>
    `
  },

  settings: {
    topbar: () => `
      <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Settings</h3>
    `,
    content: () => `
      <section class="card">
        <h2 style="margin-top: 0;">Profile Settings</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Display Name</label>
            <input type="text" placeholder="Your name" style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label>
            <input type="email" placeholder="your@email.com" style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Plan</label>
            <div style="padding: 10px 12px; background: #F3F4F6; border-radius: 6px; font-weight: 600;">Pro Plan</div>
          </div>
          <button class="primary-btn">Save Changes</button>
        </div>
      </section>
    `
  }
};
