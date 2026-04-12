// ─────────────────────────────────────────────────────────────────
// modules/calendar.js - Calendar view and management
// ─────────────────────────────────────────────────────────────────

import { appState } from '../js/state.js';
import { showToast, escapeHtml } from '../js/app.js';

export class CalendarModule {
  constructor() {
    this.calendarContainer = document.getElementById('calendarContainer');
    this.currentDate = new Date();
    
    appState.subscribe(changes => {
      if (changes.type === 'POSTS_UPDATED') {
        if (document.getElementById('view-calendar')?.classList.contains('active')) {
          this.render();
        }
      }
    });
  }

  render() {
    if (!this.calendarContainer) return;

    const html = `
      <div class="calendar-header">
        <div>
          <h2 class="calendar-month">${this.formatMonth(this.currentDate)}</h2>
        </div>
        <div class="calendar-nav">
          <button id="prevMonthBtn" class="btn btn-secondary">&larr; Prev</button>
          <button id="todayBtn" class="btn btn-secondary">Today</button>
          <button id="nextMonthBtn" class="btn btn-secondary">Next &rarr;</button>
        </div>
      </div>
      <div class="calendar-grid" id="calendarGrid"></div>
    `;

    this.calendarContainer.innerHTML = html;
    this.renderCalendarGrid();

    document.getElementById('prevMonthBtn')?.addEventListener('click', () => this.previousMonth());
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => this.nextMonth());
    document.getElementById('todayBtn')?.addEventListener('click', () => this.today());
  }

  renderCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerHtml = dayHeaders.map(day => `
      <div class="calendar-day-header">
        ${day}
      </div>
    `).join('');

    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }

    const groupedPosts = this.groupPostsByDate(appState.getState().scheduled);

    const daysHtml = days.map(day => {
      const isCurrentMonth = day.getMonth() === this.currentDate.getMonth();
      const isToday = this.isToday(day);
      const dayClasses = [
        'calendar-day',
        !isCurrentMonth ? 'other-month' : '',
        isToday ? 'today' : '',
      ].filter(Boolean).join(' ');

      const dateStr = day.toISOString().split('T')[0];
      const postsForDay = this.sortPostsByTime(groupedPosts[dateStr] || []);

      const postsHtml = postsForDay.map(post => {
        const postTime = post.scheduledAt.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt);
        const timeStr = postTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const platformsHtml = (post.platforms || []).map(p => this.getPlatformEmoji(p)).join('');
        
        // Media thumbnail strip (tiny, above caption)
        let mediaThumbnail = '';
        if (post.mediaUrl && post.mediaType === 'image') {
          mediaThumbnail = `<img src="${post.mediaUrl}" alt="" class="calendar-post-media" loading="lazy" />`;
        } else if (post.mediaUrl && post.mediaType === 'video') {
          mediaThumbnail = `<div class="calendar-post-video">▶ Video</div>`;
        }
        
        return `
          <div class="calendar-post" title="${escapeHtml(post.caption)}">
            ${mediaThumbnail}
            <div class="calendar-post-top">
              <strong>${timeStr}</strong>
              <span class="calendar-post-platforms">${platformsHtml}</span>
            </div>
            <div class="calendar-post-caption">${this.truncate(post.caption, 22)}</div>
          </div>
        `;
      }).join('');


      return `
        <div class="${dayClasses}" data-date="${dateStr}">
          <div class="calendar-date">${day.getDate()}</div>
          <div class="calendar-posts">${postsHtml}</div>
        </div>
      `;
    }).join('');

    grid.innerHTML = headerHtml + daysHtml;

    grid.querySelectorAll('.calendar-day').forEach(dayElement => {
      dayElement.addEventListener('click', () => {
        const date = dayElement.dataset.date;
        this.showDayPosts(date);
      });
    });
  }

  groupPostsByDate(posts) {
    const groups = {};
    posts.forEach(post => {
      if (!post.scheduledAt) return;
      const postDate = post.scheduledAt.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt);
      const dateStr = postDate.toISOString().split('T')[0];
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(post);
    });
    return groups;
  }

  sortPostsByTime(posts) {
    return posts.sort((a, b) => {
      const timeA = a.scheduledAt.toDate ? a.scheduledAt.toDate() : new Date(a.scheduledAt);
      const timeB = b.scheduledAt.toDate ? b.scheduledAt.toDate() : new Date(b.scheduledAt);
      return timeA - timeB;
    });
  }

  getPlatformEmoji(platform) {
    const badges = {
      instagram: `<div class="platform-icon"><img src="/assets/images/platform-instagram.png" alt="IG" /></div>`,
      tiktok: `<div class="platform-icon"><img src="/assets/images/platform-tiktok.png" alt="TT" /></div>`,
      youtube: `<div class="platform-icon"><img src="/assets/images/platform-youtube.png" alt="YT" /></div>`
    };
    return badges[platform] || `<div class="platform-icon"><img src="/assets/icons/dashboard.svg" alt="App" /></div>`;
  }

  showDayPosts(dateStr) {
    const grouped = this.groupPostsByDate(appState.getState().scheduled);
    const posts = this.sortPostsByTime(grouped[dateStr] || []);
    if (posts.length === 0) return;

    showToast(`${posts.length} post(s) scheduled for this date.`, 'info');
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  today() {
    this.currentDate = new Date();
    this.render();
  }

  formatMonth(date) {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

export const calendarModule = new CalendarModule();
