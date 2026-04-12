// ─────────────────────────────────────────────────────────────────
// modules/analytics.js - Analytics dashboard
// ─────────────────────────────────────────────────────────────────

import { getAnalytics } from '../services/firestoreService.js';
import { appState } from '../js/state.js';
import { showToast } from '../js/app.js';
import { aiService } from '../services/aiService.js';
import { learningService } from '../services/learningService.js';
import { insightService } from '../services/insightService.js';

export class AnalyticsModule {
  constructor() {
    this.analyticsGrid = document.getElementById('analyticsGrid');
    appState.subscribe(changes => {
      if (changes.type === 'ANALYTICS_UPDATED') {
        if (document.getElementById('view-analytics')?.classList.contains('active')) {
          this.render();
        }
      }
    });
  }

  async loadAnalytics() {
    try {
      const user = appState.getState().user;
      if (!user) throw new Error('User not authenticated');

      const analytics = await getAnalytics(user.uid);
      appState.setAnalytics(analytics);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async render() {
    if (!this.analyticsGrid) return;
    const analytics = appState.getState().analytics || [];

    if (analytics.length === 0) {
      this.analyticsGrid.innerHTML = `
        <div class="empty-state analytics-empty-state">
          <div class="empty-state-icon"><img src="/assets/icons/analytics.svg" class="empty-state-icon-image" /></div>
          <p>No analytics data yet</p>
          <small>Connect your accounts to see analytics</small>
        </div>
      `;
      return;
    }

    // 1. Generate AI Insights first
    let insightsHtml = '';
    try {
      const insights = await aiService.generateInsights(analytics);
      if (insights && insights.length > 0) {
        const insightsList = insights.map(i => `<li class="analytics-callout-list-item"><img src="/assets/icons/analytics.svg" class="analytics-inline-icon" />${i}</li>`).join('');
        insightsHtml = `
          <div class="analytics-card analytics-callout analytics-callout--primary analytics-card-span">
            <div class="analytics-header analytics-callout-header">
              <h3 class="analytics-callout-title analytics-callout-title--primary"><img src="/assets/icons/analytics.svg" class="analytics-title-icon" />AI Insights</h3>
            </div>
            <ul class="analytics-callout-list">
              ${insightsList}
            </ul>
          </div>
        `;
      }
    } catch(e) {
      console.error("AI Insights generation failed", e);
    }

    // 1.5 Generate Adaptive Intelligence Insights
    let adaptiveHtml = '';
    try {
      const user = appState.getState().user;
      if (user) {
        const learningData = await learningService.learnFromHistory(user.uid);
        if (learningData && learningData.hasData) {
          const bestPlatform = learningData.rankedPlatforms && learningData.rankedPlatforms.length > 0 ? learningData.rankedPlatforms[0] : 'N/A';
          const bestTime = learningData.bestTimeWindows && learningData.bestTimeWindows.length > 0 ? `${learningData.bestTimeWindows[0]}:00` : 'N/A';
          
          
          adaptiveHtml = `
            <div class="analytics-card analytics-callout analytics-callout--success analytics-card-span">
              <div class="analytics-header analytics-callout-header">
                <div>
                  <h3 class="analytics-callout-title analytics-callout-title--success"><img src="/assets/images/icon-eye.png" class="analytics-title-icon analytics-title-icon-muted" />Adaptive Intelligence</h3>
                  <p class="analytics-callout-subtitle">Learned from ${learningData.postCount} historical posts</p>
                </div>
              </div>
              <div class="analytics-highlight-grid analytics-highlight-grid--2">
                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">Top Performing Platform</span>
                  <span class="analytics-highlight-value analytics-highlight-value-capitalize">${bestPlatform}</span>
                </div>
                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">Best Posting Time</span>
                  <span class="analytics-highlight-value">${bestTime}</span>
                </div>
              </div>
            </div>
          `;
        }

        const growthMetrics = await insightService.calculateGrowthMetrics(user.uid);
        const performanceInsights = await insightService.generatePerformanceInsights(user.uid);
        
        if (growthMetrics) {
           let insightsListHtml = '';
           if (performanceInsights && performanceInsights.length > 0) {
              insightsListHtml = `<ul class="analytics-insights-list">` + 
                performanceInsights.map(i => `<li class="analytics-insights-list-item">${i}</li>`).join('') + `</ul>`;
           }

           adaptiveHtml += `
            <div class="analytics-card analytics-callout analytics-callout--warning analytics-card-span">
              <div class="analytics-header analytics-callout-header">
                <div>
                  <h3 class="analytics-callout-title analytics-callout-title--warning"><img src="/assets/icons/analytics.svg" class="analytics-title-icon" />Growth Metrics</h3>
                  <p class="analytics-callout-subtitle">System performance analysis</p>
                </div>
              </div>
              <div class="analytics-highlight-grid analytics-highlight-grid--4">
                
                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">Success Rate</span>
                  <span class="analytics-highlight-value">${growthMetrics.successRate}%</span>
                </div>
                
                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">Consistency</span>
                  <span class="analytics-highlight-value ${growthMetrics.consistencyScore > 70 ? 'analytics-highlight-value--success' : 'analytics-highlight-value--warning'}">${growthMetrics.consistencyScore}%</span>
                </div>

                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">Before AI Score</span>
                  <span class="analytics-highlight-value">${growthMetrics.beforeAiScore}</span>
                </div>

                <div class="analytics-highlight-card">
                  <span class="analytics-highlight-label">After AI Score</span>
                  <span class="analytics-highlight-value analytics-highlight-value--primary">${growthMetrics.afterAiScore} <span class="analytics-highlight-delta ${growthMetrics.improvementMode === 'up' ? 'analytics-highlight-delta--up' : 'analytics-highlight-delta--down'}">(${growthMetrics.improvementMode === 'up' ? '+' : '-'}${growthMetrics.improvementPercent}%)</span></span>
                </div>

              </div>
              ${insightsListHtml}
            </div>
          `;
        }
      }
    } catch (e) {
      console.error("Adaptive Intelligence load failed", e);
    }

    // 2. Render normal metrics cards
    const metricsHtml = analytics.map(metric => this.createAnalyticsCard(metric)).join('');
    
    // 3. Inject combined HTML
    this.analyticsGrid.innerHTML = adaptiveHtml + insightsHtml + metricsHtml;
  }

  createAnalyticsCard(metric) {
    const platformNames = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      youtube: 'YouTube',
    };

    const platformEmojis = {
      instagram: '<img src="/assets/images/platform-instagram.png" class="analytics-platform-icon" alt="Instagram" />',
      tiktok: '<img src="/assets/images/platform-tiktok.png" class="analytics-platform-icon" alt="TikTok" />',
      youtube: '<img src="/assets/images/platform-youtube.png" class="analytics-platform-icon" alt="YouTube" />',
    };

    const platformName = platformNames[metric.id] || metric.id;
    const platformEmoji = platformEmojis[metric.id] || '<img src="/assets/icons/dashboard.svg" class="analytics-platform-icon" alt="Dashboard" />';

    return `
      <div class="analytics-card analytics-platform-card">
        <div class="analytics-header analytics-platform-header">
          <div class="analytics-platform analytics-platform-title">
            <span>${platformEmoji}</span>
            <span>${platformName}</span>
          </div>
        </div>

        <div class="analytics-metrics analytics-metrics-grid">
          <div class="metric">
            <span class="metric-label">Reach</span>
            <span class="metric-value">${this.formatNumber(metric.reach || 0)}</span>
          </div>

          <div class="metric">
            <span class="metric-label">Engagement</span>
            <span class="metric-value">${this.formatNumber(metric.engagement || 0)}</span>
          </div>

          <div class="metric">
            <span class="metric-label">Eng. Rate</span>
            <span class="metric-value">${(metric.engagementRate || 0).toFixed(2)}%</span>
          </div>

          <div class="metric">
            <span class="metric-label">Followers</span>
            <span class="metric-value">${this.formatNumber(metric.followers || 0)}</span>
          </div>

          <div class="metric">
            <span class="metric-label">Growth</span>
            <span class="metric-value metric-value-success">+${(metric.growthRate || 0).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

export const analyticsModule = new AnalyticsModule();
