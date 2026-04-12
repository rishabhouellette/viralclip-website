// ─────────────────────────────────────────────────────────────────
// modules/dashboard.js - Centralized Dashboard logic (Overview, Drafts, Scheduled, Published)
// ─────────────────────────────────────────────────────────────────

import { deletePost } from '../services/firestoreService.js';
import { appState } from '../js/state.js';
import { showToast } from '../js/app.js';
import { createPostModule } from '../features/createPost.js';
import { PostCardComponent } from '../components/postCard.js';
import { contentEngine } from '../services/contentEngine.js';
import { insightService } from '../services/insightService.js';
import { engagementService } from '../services/engagementService.js';
import { onboardingModule } from './onboarding.js';
import { aiCoachEngine } from '../services/aiCoachEngine.js';
import { aiInsightsEngine } from '../services/aiInsightsEngine.js';

export class DashboardModule {
  constructor() {
    this.totalPostsEl = document.getElementById('totalPosts');
    this.scheduledCountEl = document.getElementById('scheduledCount');
    this.totalReachEl = document.getElementById('totalReach');
    this.engagementRateEl = document.getElementById('engagementRate');
    
    this.recentPostsList = document.getElementById('recentPostsList');
    this.draftsList = document.getElementById('draftsList');
    this.scheduledList = document.getElementById('scheduledList');
    this.publishedList = document.getElementById('publishedList');
    
    this.growthActionSection = document.getElementById('growthActionSection');
    this.todaysPlanSection = document.getElementById('todaysPlanSection');

    this.notifBtn = null;
    this.notifDropdown = null;
    this.notifList = null;
    this.notificationsBound = false;

    this.aiPlanForm = document.getElementById('aiPlanForm');
    this.aiNicheInput = document.getElementById('aiNicheInput');
    this.aiFrequencySelect = document.getElementById('aiFrequencySelect');
    this.generatePlanBtn = document.getElementById('generatePlanBtn');

    this.setupTabs();
    this.setupAiGenerator();
    this.bindNotifications();

    // Re-render when posts change
    // Static widgets are used in the new dashboard design. We'll simply call our update function.
    this.updateGrowthPlanDate();
    appState.subscribe(changes => {
      if (changes.type === 'POSTS_UPDATED') {
        this.renderStats();
        this.renderActiveTab();
        this.refreshNotifications();
      }

      if (changes.type === 'USER_UPDATED') {
        this.refreshNotifications();
      }
    });
  }

  updateGrowthPlanDate() {
    const dateEl = document.getElementById('growthPlanDate');
    if (dateEl) {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
  }

  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Deactivate all
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate selected
        btn.classList.add('active');
        document.querySelector(`.tab-content[data-tab="${tabName}"]`)?.classList.add('active');
      });
    });
  }

  setupAiGenerator() {
    if (!this.aiPlanForm) return;

    // Step 8: Auto-fill niche from profile
    const profile = appState.getState().profile;
    if (profile && profile.niche) {
      this.aiNicheInput.value = profile.niche;
    }

    this.aiPlanForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const niche = this.aiNicheInput.value.trim();
      const frequency = parseInt(this.aiFrequencySelect.value);

      if (!niche) {
        showToast('Please enter a niche', 'warning');
        return;
      }

      try {
        const user = appState.getState().user;
        if (!user) throw new Error("Authentication required.");

        this.generatePlanBtn.disabled = true;
        this.generatePlanBtn.innerHTML = '<span class="spinner spinner-sm"></span> Generating...';

        showToast('AI is crafting your content. This may take a moment...', 'info');

        const result = await contentEngine.autoGenerateAndSchedule(user.uid, niche, frequency);
        
        showToast(`Successfully scheduled ${result.count} viral posts! ✨`, 'success');
        
        // Initialize Growth Habits
        if (typeof initGrowthHabits === 'function') {
          initGrowthHabits();
        }
        
        // Update the date in the Growth Plan header
        this.updateGrowthPlanDate();
        this.aiPlanForm.reset();

      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        this.generatePlanBtn.disabled = false;
        this.generatePlanBtn.innerHTML = 'Generate Plan';
      }
    });
  }

  bindNotifications() {
    this.notifBtn = document.getElementById('topbar-notification-btn');
    this.notifDropdown = document.getElementById('topbar-notification-dropdown');
    this.notifList = document.getElementById('topbar-notification-list');
    this.notificationsBound = Boolean(this.notifBtn && this.notifDropdown);
  }

  refreshNotifications() {
    const badge = document.getElementById('topbar-notification-badge');
    const list = document.getElementById('topbar-notification-list');
    const user = appState.getState().user;

    if (!user) {
      if (badge) badge.textContent = '0';
      if (list) list.innerHTML = '<div class="notification-empty">Sign in to see alerts</div>';
      return;
    }

    this.renderNotifications(user.uid).catch((error) => {
      console.error('Failed to render notifications:', error);
    });
  }

  renderStats() {
    const { posts, scheduled } = appState.getState();
    if(this.totalPostsEl) this.totalPostsEl.textContent = posts.length;
    if(this.scheduledCountEl) this.scheduledCountEl.textContent = scheduled.length;
  }

  renderActiveTab() {
    // Static UI implementation: No longer dynamically rendering tabs via JS
  }

  renderOverview() {
    this.bindNotifications();
    this.renderGrowthWidgets();

    if (!this.recentPostsList) return;
    const posts = appState.getState().posts.slice(0, 5);
    
    // Phase 4: Trigger Onboarding Modal if fully empty
    onboardingModule.checkAndTriggerOnboarding();

    if (posts.length === 0) {
      this.recentPostsList.innerHTML = onboardingModule.renderEmptyState();
      return;
    }
    
    this.recentPostsList.innerHTML = posts.map(post => PostCardComponent.render(post, false)).join('');
    
    // Re-render other lists if they exist (drafts, scheduled, published tabs)
    this.renderDraftsList();
    this.renderScheduledList();
    this.renderPublishedList();

    // Render AI enhancements (non-blocking, after existing content)
    this.renderAiCoachPanel();
    this.renderTodaysTasks();
  }

  // ─── AI Coach Suggestion Panel ─── //

  renderAiCoachPanel() {
    const container = document.getElementById('aiCoachSuggestions');
    if (!container) return;

    const suggestion = aiCoachEngine.generateSuggestion();

    container.innerHTML = `
      <div class="ai-coach-panel">
        <div class="ai-coach-header">
          <h3>🤖 AI Coach — What to Post Today</h3>
        </div>
        <div class="ai-coach-label">🎯 Top Topic for You</div>
        <div class="ai-coach-hook">${suggestion.hook}</div>
        <div class="ai-coach-meta">
          <span class="ai-coach-tag ai-coach-tag--niche">${suggestion.niche}</span>
          <span class="ai-coach-tag ai-coach-tag--trend">Trend: ↑ ${suggestion.trend_pct}%</span>
          <span class="ai-coach-tag ai-coach-tag--time">⏰ Best time: ${suggestion.best_time}</span>
          <span class="ai-coach-score">⚡ ${suggestion.virality_score}/100</span>
        </div>
        <div class="ai-coach-actions">
          <button class="btn ai-coach-btn-primary" id="aiCoachGenerateBtn">Generate Suggestion</button>
          <button class="btn ai-coach-btn-secondary" id="aiCoachUseBtn">Use This Idea</button>
        </div>
      </div>
    `;

    // Button listeners
    document.getElementById('aiCoachGenerateBtn')?.addEventListener('click', () => {
      this.renderAiCoachPanel();
      showToast('New AI suggestion generated!', 'info');
    });

    document.getElementById('aiCoachUseBtn')?.addEventListener('click', () => {
      const nicheInput = document.getElementById('aiNicheInput');
      if (nicheInput) nicheInput.value = suggestion.niche;
      showToast(`Topic set to "${suggestion.niche}" — scroll down to generate!`, 'success');
    });
  }

  // ─── Today's Tasks Card ─── //

  renderTodaysTasks() {
    const container = document.getElementById('todaysTasksContainer');
    if (!container) return;

    // Load persisted state or default
    const saved = JSON.parse(localStorage.getItem('vc_todays_tasks') || '{}');
    const today = new Date().toDateString();
    const tasks = (saved.date === today && saved.tasks)
      ? saved.tasks
      : [
          { id: 't1', text: 'Post 2 clips', done: false },
          { id: 't2', text: 'Schedule content for tomorrow', done: false },
          { id: 't3', text: 'Reply to 5 comments', done: false },
        ];

    container.innerHTML = `
      <div class="todays-tasks-card">
        <h3>📋 Today's Tasks</h3>
        <ul class="todays-tasks-list">
          ${tasks.map(t => `
            <li class="${t.done ? 'completed' : ''}" data-task-id="${t.id}">
              <div class="task-checkbox ${t.done ? 'checked' : ''}"></div>
              <span>${t.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Toggle listeners
    container.querySelectorAll('.todays-tasks-list li').forEach(li => {
      li.addEventListener('click', () => {
        const taskId = li.dataset.taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.done = !task.done;
          localStorage.setItem('vc_todays_tasks', JSON.stringify({ date: today, tasks }));
          this.renderTodaysTasks();
        }
      });
    });
  }

  async renderGrowthWidgets() {
      const insightsPanel = document.getElementById('insights-panel');
      if (!insightsPanel) return;
      
      const user = appState.getState().user;
      if (!user) return;

      try {
          const metrics = await insightService.calculateGrowthMetrics(user.uid);
          const todaysPlan = await engagementService.getTodaysPlan(user.uid);
          
          if (!metrics || !todaysPlan) return;

          // Render Greeting in Center
          const greetingMsg = document.getElementById('greetingMsg');
          if (greetingMsg) greetingMsg.textContent = `Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, ${user.email ? user.email.split('@')[0] : 'Creator'}`;

          // Inject Right Panel Stack
          insightsPanel.innerHTML = `
            <!-- Upcoming Posts -->
            <div class="insight-card card">
              <div class="insight-card-header">
                <h3 class="insight-card-title">Upcoming Posts</h3>
                <span class="insight-card-home-icon">🏠</span>
              </div>
              <div class="insight-card-row insight-card-row-bordered">
                <div class="insight-card-inline">
                  <div class="insight-card-accent insight-card-accent-round">
                    <img src="/assets/icons/accounts.svg" alt="" class="insight-card-accent-icon" />
                  </div>
                  <span class="insight-card-label">Today</span>
                </div>
                <strong class="insight-card-value insight-card-value-pink">${todaysPlan.scheduledCount}</strong>
              </div>
              <div class="insight-card-row">
                <div class="insight-card-inline">
                  <div class="insight-card-accent insight-card-accent-round insight-card-accent-blue">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #3b82f6;">3</span>
                  </div>
                  <span class="insight-card-label">Overdue Draft</span>
                </div>
                <strong class="insight-card-value insight-card-value-purple">2</strong>
              </div>
            </div>

            <!-- AI Caption Suggestions -->
            <div class="insight-card card">
              <h3 class="insight-card-title insight-card-title-spaced">AI Caption Suggestions</h3>
              <div class="insight-chip-row">
                <span class="insight-chip">#viralvideos</span>
                <span class="insight-chip insight-chip-danger">Speed Acc ×</span>
                <span class="insight-chip insight-chip-warning">Trend 🔥 ×</span>
                <span class="insight-chip">#fitnessgoals</span>
              </div>
              <div class="insight-social-row">
                <div class="insight-social-item">
                  <img src="/assets/images/twitter.png" alt="Twitter" class="insight-social-icon" />
                  <span class="insight-social-label">Post videos:</span>
                  <strong class="insight-social-value">977</strong>
                </div>
              </div>
            </div>

            <!-- Performance Overview -->
            <div class="insight-card card">
              <div class="insight-card-header insight-card-header-lg">
                <h3 class="insight-card-title">Performance Overview</h3>
                <span class="insight-card-menu">≡</span>
              </div>
              
              <div class="insight-metric-row">
                <div class="insight-card-inline">
                  <div class="insight-card-accent insight-card-accent-blue"><img src="/assets/images/twitter.png" alt="Views" class="insight-card-accent-icon insight-card-accent-icon-blue" /></div>
                  <div>
                    <div class="insight-stat">67.8K</div>
                    <div class="insight-stat-badge insight-stat-badge-success">VIEWS</div>
                  </div>
                </div>
                <div class="insight-card-value insight-card-value-green">+ 45%</div>
              </div>

              <div class="insight-metric-row">
                <div class="insight-card-inline">
                  <div class="insight-card-accent insight-card-accent-rose"><img src="/assets/images/platform-instagram.png" alt="Followers" class="insight-card-accent-icon" /></div>
                  <div>
                    <div class="insight-stat">12.4K</div>
                    <div class="insight-stat-badge insight-stat-badge-danger">FOLLOWERS</div>
                  </div>
                </div>
                <div class="insight-card-value insight-card-value-green">+ 2.1K</div>
              </div>

              <div class="insight-metric-row">
                <div class="insight-card-inline">
                  <div class="insight-card-accent insight-card-accent-red"><img src="/assets/images/platform-youtube.png" alt="Comments" class="insight-card-accent-icon" /></div>
                  <div>
                    <div class="insight-stat">6.3K</div>
                    <div class="insight-stat-badge insight-stat-badge-comments">COMMENTS</div>
                  </div>
                </div>
                <div class="insight-card-value insight-card-value-green">+ 2.4K</div>
              </div>

              <div class="insight-summary">
                <span>14 Posts Published</span>
                <span>Last 30 days <strong class="insight-summary-strong">289K</strong></span>
              </div>

              <div class="insight-platform-breakdown">
                <div class="insight-platform-row">
                  <img src="/assets/images/platform-tiktok.png" alt="TikTok" class="insight-platform-icon" />
                  <span class="insight-platform-label">TikTok</span>
                  <span class="insight-platform-stat"><img src="/assets/icons/analytics.svg" alt="" class="insight-platform-stat-icon" /> 923K</span>
                </div>
                <div class="insight-platform-row">
                  <img src="/assets/images/platform-tiktok.png" alt="TikTok" class="insight-platform-icon" />
                  <span class="insight-platform-label">TikTok</span>
                  <span class="insight-platform-stat"><img src="/assets/icons/clips.svg" alt="" class="insight-platform-stat-icon" /> 31K</span>
                </div>
              </div>
            </div>
          `;

          // Append AI Insights block (additive — does NOT replace existing content)
          const insightsData = aiInsightsEngine.getInsights();
          insightsPanel.innerHTML += `
            <div class="ai-insights-block">
              <h3>💡 AI Insights</h3>
              ${insightsData.insights.map(item => `
                <div class="ai-insights-item">
                  <span class="ai-insights-item-icon">${item.icon}</span>
                  <span>${item.text}</span>
                </div>
              `).join('')}
            </div>
          `;
      } catch (err) {
          console.error("Failed to load growth widgets:", err);
      }
  }

  async renderNotifications(userId) {
      const feed = await engagementService.buildNotificationFeed(userId);
      const badge = document.getElementById('topbar-notification-badge');
      const list = document.getElementById('topbar-notification-list');
      if (!badge || !list) return;

      badge.textContent = feed.length;
      if (feed.length === 0) {
          list.innerHTML = `<div class="notification-empty">No new alerts</div>`;
          return;
      }

      list.innerHTML = feed.map(n => `
          <div class="notification-item notification-item--${n.type || 'info'}">
             <div class="notification-time">${n.time}</div>
             <div class="notification-title">${n.title}</div>
             <div class="notification-body">${n.body}</div>
          </div>
      `).join('');
  }

  renderList(container, items, type) {
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No ${type} found.</p></div>`;
      return;
    }

    container.innerHTML = items.map(post => PostCardComponent.render(post, type === 'drafts' || type === 'scheduled')).join('');

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        createPostModule.editPost(btn.dataset.postId);
      });
    });
    
    container.querySelectorAll('.btn-reschedule').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        createPostModule.editPost(btn.dataset.postId); // Reschedule is the same as edit in this simplified flow
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.handleDeletePost(btn.dataset.postId);
      });
    });
  }

  async handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const user = appState.getState().user;
      if (!user) throw new Error('User not authenticated');

      await deletePost(user.uid, postId);
      showToast('Post deleted', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  render() {
    this.renderStats();
    this.renderActiveTab();
    this.refreshNotifications();
  }
}

export const dashboardModule = new DashboardModule();
