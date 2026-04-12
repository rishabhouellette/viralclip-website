// ─────────────────────────────────────────────────────────────────
// modules/engagement.js — AI Engagement Assistant view
// ─────────────────────────────────────────────────────────────────

import { aiEngagementService } from '../services/aiEngagementService.js';
import { showToast } from '../js/app.js';

class EngagementModule {
  render() {
    const container = document.getElementById('view-engagement');
    if (!container) return;

    const comments = aiEngagementService.getComments();
    const dms = aiEngagementService.getDMs();

    // Generate replies for all items
    const commentReplies = comments.slice(0, 3).map(c => ({
      ...c,
      reply: aiEngagementService.generateReply(c.text),
      type: 'comment'
    }));

    const dmReplies = dms.slice(0, 2).map(d => ({
      ...d,
      reply: aiEngagementService.generateReply(d.text),
      type: 'dm'
    }));

    container.innerHTML = `
      <div class="engagement-header">
        <h1>💬 AI Engagement Assistant</h1>
        <p>AI-suggested replies for your comments and DMs. Review before sending.</p>
      </div>

      <div class="engagement-summary-row">
        <div class="engagement-summary-card">
          <div class="engagement-summary-icon engagement-summary-icon--comments">💬</div>
          <div>
            <div class="engagement-summary-count">${comments.length}</div>
            <div class="engagement-summary-label">New Comments</div>
          </div>
        </div>
        <div class="engagement-summary-card">
          <div class="engagement-summary-icon engagement-summary-icon--dms">✉️</div>
          <div>
            <div class="engagement-summary-count">${dms.length}</div>
            <div class="engagement-summary-label">New DMs</div>
          </div>
        </div>
      </div>

      <h3 class="engagement-section-title">💬 Comment Replies</h3>
      ${commentReplies.map(item => this._renderReplyCard(item)).join('')}

      <h3 class="engagement-section-title" style="margin-top: 28px;">✉️ DM Replies</h3>
      ${dmReplies.map(item => this._renderReplyCard(item)).join('')}
    `;

    this._attachListeners(container);
  }

  _renderReplyCard(item) {
    const initials = item.author.replace('@', '').slice(0, 2).toUpperCase();
    return `
      <div class="engagement-reply-card" data-id="${item.id}">
        <div class="engagement-reply-original">
          <div class="engagement-reply-avatar">${initials}</div>
          <div>
            <div class="engagement-reply-author">${item.author} <span style="color: #9ca3af; font-weight: 400;">· ${item.platform}</span></div>
            <div class="engagement-reply-text">${item.text}</div>
            <div class="engagement-reply-time">${item.time}</div>
          </div>
        </div>
        <div class="engagement-reply-suggestion">
          <div class="engagement-reply-suggestion-label">AI Suggested Reply</div>
          <div class="engagement-reply-suggestion-text">${item.reply}</div>
        </div>
        <div class="engagement-reply-actions">
          <button class="btn btn--use" data-action="use" data-id="${item.id}">✓ Use</button>
          <button class="btn" data-action="edit" data-id="${item.id}">✏️ Edit</button>
          <button class="btn btn--skip" data-action="skip" data-id="${item.id}">Skip</button>
        </div>
      </div>
    `;
  }

  _attachListeners(container) {
    container.querySelectorAll('.engagement-reply-actions .btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const card = btn.closest('.engagement-reply-card');
        
        if (action === 'use') {
          showToast('Reply copied to clipboard! Paste it manually on the platform.', 'success');
          const replyText = card.querySelector('.engagement-reply-suggestion-text').textContent;
          navigator.clipboard?.writeText(replyText).catch(() => {});
          card.style.opacity = '0.5';
          card.style.pointerEvents = 'none';
        } else if (action === 'edit') {
          const textEl = card.querySelector('.engagement-reply-suggestion-text');
          const current = textEl.textContent;
          const edited = prompt('Edit your reply:', current);
          if (edited !== null && edited.trim()) {
            textEl.textContent = edited;
            showToast('Reply updated!', 'info');
          }
        } else if (action === 'skip') {
          card.style.opacity = '0.3';
          card.style.pointerEvents = 'none';
          showToast('Skipped this reply.', 'info');
        }
      });
    });
  }
}

export const engagementModule = new EngagementModule();
