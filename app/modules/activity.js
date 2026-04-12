// ─────────────────────────────────────────────────────────────────
// modules/activity.js
// ─────────────────────────────────────────────────────────────────
import { appState } from '../js/state.js';
import { formatDateTime } from '../js/app.js';
import { getPlatformEmoji } from '../js/app.js';

class ActivityModule {
  constructor() {
    this.container = document.getElementById('view-activity');
    this.logsList = null;
    
    appState.subscribe((changes) => {
      if (changes.type === 'LOGS_UPDATED') {
        if (this.container && this.container.classList.contains('active')) {
          this.renderLogs();
        }
      }
    });
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="view-header">
        <h1>Activity Logs</h1>
      </div>
      <div class="activity-content">
        <div id="logsList" class="logs-list"></div>
      </div>
    `;
    this.logsList = document.getElementById('logsList');
    this.renderLogs();
  }

  renderLogs() {
    if (!this.logsList) return;
    
    const logs = appState.getState().logs || [];
    if (logs.length === 0) {
      this.logsList.innerHTML = `<div class="empty-state">No recent activity</div>`;
      return;
    }

    this.logsList.innerHTML = logs.map(log => {
      const isSuccess = log.status === 'success' || log.status === 'published';
      const isError = log.status === 'failed' || log.status === 'permanently_failed';
      const icon = isSuccess ? '✅' : isError ? '❌' : '🔄';
      const platformIcon = log.platform === 'system' ? '⚙️' : getPlatformEmoji(log.platform);
      
      const badgeClass = isSuccess ? 'success' : isError ? 'error' : 'warning';
      
      return `
        <div class="log-item">
          <div class="log-icon">${icon}</div>
          <div class="log-details">
            <div class="log-title">
              <span class="log-platform">${platformIcon} ${log.platform}</span>
              <span class="log-status status-${badgeClass}">${log.status}</span>
            </div>
            <div class="log-message">${log.message}</div>
            <div class="log-time">${formatDateTime(log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp))}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

export const activityModule = new ActivityModule();
