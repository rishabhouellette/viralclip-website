// ─────────────────────────────────────────────────────────────────
// components/postCard.js - Reusable Post Card UI
// ─────────────────────────────────────────────────────────────────

import { getPlatformEmoji, escapeHtml, formatDateTime } from '../js/app.js';
import { scoringService } from '../services/scoringService.js';

export class PostCardComponent {
  static render(post, showActions = true) {
    const platformsHtml = (post.platforms || []).map(p => 
      `<span class="platform-badge">${getPlatformEmoji(p)} ${p}</span>`
    ).join('');

    let timeText = '';
    if (post.status === 'scheduled' && post.scheduledAt) {
      const date = post.scheduledAt.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt);
      timeText = formatDateTime(date);
    } else if ((post.status === 'published' || post.status === 'analyzed') && post.publishedAt) {
      const date = post.publishedAt.toDate ? post.publishedAt.toDate() : new Date(post.publishedAt);
      timeText = 'Published ' + formatDateTime(date);
    } else if (post.createdAt) {
      const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      timeText = 'Created ' + formatDateTime(date);
    }

    let actionsHtml = '';
    if (showActions) {
      actionsHtml = `
        <div class="post-actions post-actions-spaced">
          ${post.status === 'scheduled' || post.status === 'draft' ? `<button class="btn btn-secondary btn-reschedule" data-post-id="${post.id}">Reschedule</button>` : ''}
          <button class="btn btn-secondary btn-edit" data-post-id="${post.id}">Edit</button>
          <button class="btn btn-danger btn-delete" data-post-id="${post.id}">Delete</button>
        </div>
      `;
    }

    let metricsHtml = '';
    if (post.status === 'published' || post.status === 'analyzed' || post.status === 'permanently_failed') {
        const insight = post.insight || post.insights || null;
        const score = scoringService.calculatePerformanceScore(post);
        let feedback = "Solid alignment with audience peak times.";
        let tone = 'warning';
        let rewardHtml = ''; // Phase 5 Gamification Loop
        
        if (post.status === 'permanently_failed') {
            feedback = "Failed to publish (API Error). Check logs."; tone = 'error';
        } else if (score > 75) { 
            feedback = "🔥 Viral! Perfect timing & platform."; tone = 'success'; 
            rewardHtml = `
              <div class="post-performance-banner">
                🚀 This post performed 32% better than your average!
              </div>
            `;
        } else if (score < 45) { 
            feedback = "Missed optimal window. Try adaptive suggestions."; tone = 'error'; 
        }

        const analyticsSummary = post.status === 'analyzed'
          ? `
            <div class="post-growth-feedback">
              📈 ${post.views || 0} views • ${post.likes || 0} likes • ${post.comments || 0} comments • ${post.engagementRate || 0}% engagement
            </div>
            ${insight?.summary ? `<div class="post-growth-feedback">🧠 ${escapeHtml(insight.summary)}</div>` : ''}
          `
          : '';

        metricsHtml = `
          ${rewardHtml}
          <div class="post-growth-card post-growth-card--${tone}">
            <div class="post-growth-score">Growth Score: ${score}/100</div>
            <div class="post-growth-feedback">💡 ${feedback}</div>
            ${analyticsSummary}
          </div>
        `;
    }

    // ── Media Block ────────────────────────────────────────────
    let mediaThumbnailHtml = '';
    if (post.mediaUrl && post.mediaType === 'image') {
      mediaThumbnailHtml = `
        <div class="post-media-shell">
          <img src="${post.mediaUrl}" alt="Post media"
            class="post-media"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'post-media post-media-fallback flex-center\\'>🖼️</div>'"
          />
          <div class="post-media-overlay"></div>
        </div>`;
    } else if (post.mediaUrl && post.mediaType === 'video') {
      mediaThumbnailHtml = `
        <div class="post-media-shell post-media-video-shell">
          <video src="${post.mediaUrl}" muted playsinline preload="metadata"
            class="post-media"
            onmouseenter="this.play()" onmouseleave="this.pause(); this.currentTime=0;"
          ></video>
          <div class="post-video-badge">▶ VIDEO</div>
        </div>`;
    } else {
      // Placeholder — platform icon on gradient
      mediaThumbnailHtml = `
        <div class="post-media-placeholder">
          <div class="post-media-placeholder-badge">
            <span class="post-media-placeholder-icon">${post.platforms && post.platforms.length > 0 ? getPlatformEmoji(post.platforms[0]) : '📱'}</span>
          </div>
          <div class="post-media-placeholder-glow"></div>
        </div>`;
    }
    return `
      <div class="post-card">
        ${mediaThumbnailHtml}
        <p class="post-caption">${escapeHtml(post.caption)}</p>
        
        <div class="post-meta">
          <div class="post-platforms">${platformsHtml}</div>
          <span class="post-status ${post.status}">${post.status}</span>
        </div>
        
        <div class="post-time">
           ${timeText}
        </div>

        ${metricsHtml ? `<div class="post-metrics">${metricsHtml}</div>` : ''}
        ${actionsHtml}
      </div>
    `;
  }
}
