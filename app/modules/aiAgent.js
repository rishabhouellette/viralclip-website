/* ─────────────────────────────────────────────────────────────────
   modules/aiAgent.js - AI Assistant Logic
   ───────────────────────────────────────────────────────────────── */

import { appState } from '../js/state.js';
import { escapeHtml } from '../js/app.js';

export class AiAgentModule {
  constructor() {
    this.panel = null;
    this.overlay = null;
    this.messagesContainer = null;
    this.input = null;
    this.sendBtn = null;
    this.isOpen = false;
  }

  init() {
    this.render();
    this.attachListeners();
  }

  render() {
    // Check if already in DOM
    if (document.getElementById('aiAgentPanel')) return;

    const overlay = document.createElement('div');
    overlay.id = 'aiOverlay';
    overlay.className = 'ai-overlay';
    document.body.appendChild(overlay);
    this.overlay = overlay;

    const panel = document.createElement('div');
    panel.id = 'aiAgentPanel';
    panel.className = 'ai-agent-panel';
    panel.innerHTML = `
      <div class="ai-header">
        <h3>ViralClip AI Assistant</h3>
        <button id="closeAiPanel" class="ai-close-btn">&times;</button>
      </div>
      <div class="ai-messages" id="aiMessages">
        <div class="message ai">
          Hello! I'm your ViralClip AI. Ask me anything about your social media performance or content strategy.
        </div>
        <div class="ai-suggestions">
          <button class="ai-suggestion-btn" data-query="best platform">Best platform?</button>
          <button class="ai-suggestion-btn" data-query="post time">When to post?</button>
          <button class="ai-suggestion-btn" data-query="performance">Why underperforming?</button>
        </div>
      </div>
      <div class="ai-input">
        <input type="text" id="aiInput" placeholder="Ask about your content..." />
        <button id="aiSendBtn">Send</button>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;
    this.messagesContainer = panel.querySelector('#aiMessages');
    this.input = panel.querySelector('#aiInput');
    this.sendBtn = panel.querySelector('#aiSendBtn');

  }

  attachListeners() {
    const closeBtn = this.panel.querySelector('#closeAiPanel');
    closeBtn.addEventListener('click', () => this.toggle(false));
    this.overlay.addEventListener('click', () => this.toggle(false));

    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });

    // Suggestion buttons
    this.panel.addEventListener('click', (e) => {
      if (e.target.classList.contains('ai-suggestion-btn')) {
        const query = e.target.dataset.query;
        this.input.value = e.target.textContent;
        this.processQuery(query);
      }
    });

    // Swipe to close (Mobile)
    let touchStartY = 0;
    const header = this.panel.querySelector('.ai-header');
    header.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    header.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY;
      if (diff > 0) {
        this.panel.style.transform = `translateY(${diff}px)`;
      }
    });

    header.addEventListener('touchend', (e) => {
      const touchY = e.changedTouches[0].clientY;
      if (touchY - touchStartY > 100) {
        this.toggle(false);
      }
      this.panel.style.transform = ''; // Reset
    });

    // Keyboard safety: close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.toggle(false);
    });
  }

  toggle(force) {
    this.isOpen = force !== undefined ? force : !this.isOpen;
    if (this.isOpen) {
      // Close profile dropdown if open
      document.querySelector('.profile-dropdown')?.classList.remove('active');
      
      this.panel.classList.add('active');
      this.overlay.classList.add('active');
      this.input.focus();
    } else {
      this.panel.classList.remove('active');
      this.overlay.classList.remove('active');
    }
  }

  handleSendMessage() {
    const text = this.input.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    this.input.value = '';

    // Mock AI "thinking"
    setTimeout(() => {
      this.processQuery(text.toLowerCase());
    }, 600);
  }

  addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    if (sender === 'ai') {
      msg.innerHTML = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    } else {
      msg.textContent = text;
    }
    this.messagesContainer.appendChild(msg);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  processQuery(query) {
    const { analytics, posts, profile } = appState.getState();
    const niche = profile?.niche || 'content creation';
    const platforms = profile?.platforms?.join(', ') || 'social media';
    
    let response = `I'm analyzing your **${niche}** content across **${platforms}**... `;

    if (query.includes('platform') || query.includes('best')) {
      if (analytics && analytics.length > 0) {
        const best = [...analytics].sort((a,b) => (b.engagementRate || 0) - (a.engagementRate || 0))[0];
        response = `Based on your recent data, **${best.id.toUpperCase()}** is your best performing platform with an engagement rate of ${best.engagementRate.toFixed(2)}%.`;
      } else {
        response = "You haven't connected enough accounts yet for me to determine your best platform. Connect more in the Accounts tab!";
      }
    } else if (query.includes('post') || query.includes('time')) {
      response = "Looking at your audience activity, the best time to post for your current followers is **weekdays between 6 PM and 8 PM EST**.";
    } else if (query.includes('performance') || query.includes('underperform')) {
      const draftCount = posts.filter(p => p.status === 'draft').length;
      response = `I noticed you have ${draftCount} drafts. Consistency is key! Try scheduling at least 3 posts this week to boost your reach.`;
    } else {
      response = "That's a great question! Based on your ViralClip data, I recommend focusing on short-form video content this week as it's currently trending in your niche.";
    }

    this.addMessage(response, 'ai');
  }
}

export const aiAgentModule = new AiAgentModule();
