// ─────────────────────────────────────────────────────────────────
// app.js - Main orchestrator and layout logic
// ─────────────────────────────────────────────────────────────────

import { router } from './router.js';
import { appState } from './state.js';
import { getAccounts, getAnalytics, subscribeToPosts, subscribeToLogs, getUserProfile, updateUserProfile, getAllPosts, getAllClips, getPostById, createPost, updatePost, normalizeDateValue } from '../services/firestoreService.js';
import { authManager } from './auth.js';
import { waitForInitialAuthState } from '../services/authService.js';
import { schedulerService } from '../services/schedulerService.js';
import { analyticsService } from '../services/analyticsService.js';

// Components
import { SidebarComponent } from '../components/sidebar.js';
import { TopbarComponent } from '../components/topbar.js';
import { ModalComponent } from '../components/modal.js';

// Features
import { createPostModule } from '../features/createPost.js';

// Modules
import { dashboardModule } from '../modules/dashboard.js';
import { calendarModule } from '../modules/calendar.js';
import { accountsModule } from '../modules/accounts.js';
import { analyticsModule } from '../modules/analytics.js';
import { activityModule } from '../modules/activity.js';
import { aiAgentModule } from '../modules/aiAgent.js';
import { clipsModule } from '../modules/clips.js';

// ─── Utilities ─── //

export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || ''}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  const timeout = setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeout);
    toast.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => toast.remove(), 300);
  });
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPlatformEmoji(platform) {
  // We return a simple wrapper. The CSS .platform-badge will handle hover transformations
  // using CSS variables or nested image swaps if needed, or we just rely on the default.
  const badges = {
    instagram: `<div class="platform-icon"><img src="/assets/images/platform-instagram.png" class="platform-icon-img" alt="IG" /></div>`,
    tiktok: `<div class="platform-icon"><img src="/assets/images/platform-tiktok.png" class="platform-icon-img" alt="TT" /></div>`,
    youtube: `<div class="platform-icon"><img src="/assets/images/platform-youtube.png" class="platform-icon-img" alt="YT" /></div>`
  };
  return badges[platform] || `<div class="platform-icon"><img src="/assets/icons/dashboard.svg" alt="App" /></div>`;
}

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function resolveAiCoachUrl() {
  const frame = document.getElementById('aiCoachFrame');
  if (!frame) return null;

  const params = new URLSearchParams(window.location.search);
  const explicitOrigin = params.get('aiCoachOrigin') || window.AI_COACH_ORIGIN;
  const path = frame.dataset.path || '/dashboard/publish';

  if (explicitOrigin) {
    return `${explicitOrigin.replace(/\/$/, '')}${path}`;
  }

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || '127.0.0.1';
  const port = frame.dataset.port || '3000';

  return `${protocol}//${hostname}:${port}${path}`;
}

function initializeAiCoachFrame() {
  const frame = document.getElementById('aiCoachFrame');
  const fallback = document.getElementById('aiCoachFallback');
  const fallbackLink = document.getElementById('aiCoachFallbackLink');

  if (!frame) return;

  const nextUrl = resolveAiCoachUrl();
  if (!nextUrl) return;

  if (fallbackLink) {
    fallbackLink.href = nextUrl;
  }

  const showFallback = () => {
    if (fallback) fallback.style.display = 'flex';
  };

  const hideFallback = () => {
    if (fallback) fallback.style.display = 'none';
  };

  if (frame.dataset.loaded === 'true' && frame.dataset.resolvedSrc === nextUrl) {
    hideFallback();
    return;
  }

  let loaded = frame.dataset.loaded === 'true' && frame.dataset.resolvedSrc === nextUrl;
  const fallbackTimer = window.setTimeout(() => {
    if (!loaded) {
      showFallback();
    }
  }, 2500);

  frame.onload = () => {
    loaded = true;
    frame.dataset.loaded = 'true';
    window.clearTimeout(fallbackTimer);
    hideFallback();
  };

  frame.onerror = () => {
    loaded = false;
    frame.dataset.loaded = 'false';
    window.clearTimeout(fallbackTimer);
    showFallback();
  };

  if (frame.src !== nextUrl) {
    frame.dataset.loaded = 'false';
    frame.dataset.resolvedSrc = nextUrl;
    frame.src = nextUrl;
  }
}

let topbarNotificationGlobalsBound = false;

function getTopbarNotificationElements() {
  return {
    button: document.getElementById('topbar-notification-btn'),
    dropdown: document.getElementById('topbar-notification-dropdown'),
  };
}

function setTopbarNotificationOpenState(isOpen) {
  const { button, dropdown } = getTopbarNotificationElements();
  if (!button || !dropdown) return;

  dropdown.classList.toggle('active', isOpen);
  button.classList.toggle('active', isOpen);
  button.setAttribute('aria-expanded', String(isOpen));
}

function closeTopbarNotificationDropdown() {
  setTopbarNotificationOpenState(false);
}

function initializeTopbarNotificationDropdown() {
  const { button, dropdown } = getTopbarNotificationElements();
  if (!button || !dropdown) return;

  if (button.dataset.dropdownBound !== 'true') {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = !dropdown.classList.contains('active');
      setTopbarNotificationOpenState(isOpen);
    });

    dropdown.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    button.dataset.dropdownBound = 'true';
  }

  if (topbarNotificationGlobalsBound) return;

  document.addEventListener('click', (event) => {
    const current = getTopbarNotificationElements();
    if (!current.button || !current.dropdown) return;
    if (!current.dropdown.classList.contains('active')) return;
    if (current.button.contains(event.target) || current.dropdown.contains(event.target)) return;
    closeTopbarNotificationDropdown();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeTopbarNotificationDropdown();
    }
  });

  topbarNotificationGlobalsBound = true;
}

const SMART_PUBLISH_CHANNEL = 'viralclip-smart-publish';
const smartPublishSessions = new Map();
const performanceLoopTimers = new Map();

function isSmartPublishOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.hostname === window.location.hostname;
  } catch {
    return false;
  }
}

function postSmartPublishMessage(targetWindow, origin, type, payload = {}, requestId = null) {
  if (!targetWindow || !origin) return;
  targetWindow.postMessage({
    channel: SMART_PUBLISH_CHANNEL,
    type,
    requestId,
    payload,
  }, origin);
}

function toIsoString(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toISOString();
  return null;
}

function formatDurationLabel(seconds) {
  const totalSeconds = Math.max(1, Math.round(seconds || 0));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const SMART_PUBLISH_PLATFORM_LABELS = {
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

const SMART_PUBLISH_STATUSES = new Set([
  'draft',
  'scheduled',
  'ready_to_publish',
  'publishing',
  'published',
  'analyzed',
  'failed',
  'permanently_failed',
]);

const SMART_PUBLISH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'be', 'but', 'by', 'for', 'from', 'how', 'in', 'into', 'is', 'it',
  'of', 'on', 'or', 'our', 'the', 'this', 'that', 'to', 'up', 'we', 'with', 'your',
]);

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizePlatformId(platform) {
  const value = String(platform || '').trim().toLowerCase();
  if (value === 'x') return 'twitter';
  return SMART_PUBLISH_PLATFORM_LABELS[value] ? value : null;
}

function normalizePostStatus(status) {
  const value = String(status || 'draft').trim().toLowerCase();
  return SMART_PUBLISH_STATUSES.has(value) ? value : 'draft';
}

function formatReachLabel(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return String(Math.round(value));
}

function extractClipKeywords(title) {
  return [...new Set(
    String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word && word.length > 2 && !SMART_PUBLISH_STOP_WORDS.has(word))
  )].slice(0, 5);
}

function buildClipRecommendations(title, durationSeconds) {
  const keywords = extractClipKeywords(title);
  const hasKeyword = (list) => list.some((word) => keywords.includes(word));
  const platformScores = {
    youtube: durationSeconds >= 35 ? 5 : 2,
    twitter: durationSeconds <= 40 ? 3 : 1,
    instagram: durationSeconds <= 55 ? 4 : 2,
    tiktok: durationSeconds <= 35 ? 5 : 2,
  };

  if (hasKeyword(['podcast', 'interview', 'highlight', 'episode', 'conversation'])) {
    platformScores.youtube += 3;
    platformScores.instagram += 2;
  }

  if (hasKeyword(['tutorial', 'guide', 'strategy', 'tips', 'lesson'])) {
    platformScores.youtube += 3;
    platformScores.instagram += 2;
  }

  if (hasKeyword(['news', 'update', 'trend', 'launch', 'breaking'])) {
    platformScores.twitter += 4;
    platformScores.youtube += 2;
  }

  if (hasKeyword(['story', 'reaction', 'moment', 'behind', 'day'])) {
    platformScores.instagram += 2;
    platformScores.tiktok += 2;
  }

  const ranked = Object.entries(platformScores)
    .sort((a, b) => b[1] - a[1])
    .map(([platform]) => platform);

  return {
    platformScores,
    bestPlatforms: ranked.slice(0, 2),
    skipPlatforms: ranked.slice(2),
  };
}

function inferCaptionStyle(title, durationSeconds) {
  const value = String(title || '').toLowerCase();
  if (value.includes('how') || value.includes('tips') || value.includes('guide')) return 'Educational';
  if (value.includes('story') || value.includes('moment') || value.includes('behind')) return 'Story-led';
  if (durationSeconds <= 25) return 'Punchy';
  return 'Curiosity gap';
}

function estimateBestTime(bestPlatforms, title) {
  const value = String(title || '').toLowerCase();
  if (value.includes('news') || value.includes('update') || value.includes('launch')) return '12:00 PM';
  if (bestPlatforms.includes('twitter')) return '9:30 AM';
  if (bestPlatforms.includes('youtube')) return '7:00 AM';
  if (bestPlatforms.includes('instagram')) return '6:30 PM';
  return '7:30 PM';
}

function estimateHookScore(title, durationSeconds) {
  const keywords = extractClipKeywords(title);
  const wordCount = String(title || '').split(/\s+/).filter(Boolean).length;
  const questionBonus = /[?!]/.test(String(title || '')) ? 6 : 0;
  const lengthFit = wordCount >= 4 && wordCount <= 9 ? 8 : 3;
  const durationFit = durationSeconds >= 12 && durationSeconds <= 45 ? 10 : 4;
  return clampNumber(58 + (keywords.length * 4) + questionBonus + lengthFit + durationFit, 58, 96);
}

function estimateClipScore(title, durationSeconds, hookScore, bestPlatforms) {
  const durationFit = durationSeconds >= 18 && durationSeconds <= 50 ? 12 : durationSeconds <= 65 ? 8 : 4;
  const platformBonus = bestPlatforms.includes('youtube') && bestPlatforms.includes('instagram') ? 7 : 4;
  const titleBonus = /how|why|best|top|mistake|strategy|secret/i.test(String(title || '')) ? 8 : 3;
  return clampNumber(Math.round((hookScore * 0.62) + durationFit + platformBonus + titleBonus), 64, 97);
}

function estimatePrePublishViewsRange(score, hookScore) {
  const center = Math.round((score * 82) + (hookScore * 24));
  const spread = Math.round(center * (score >= 88 ? 0.22 : score >= 78 ? 0.18 : 0.15));
  return {
    low: clampNumber(center - spread, 1200, 12000),
    high: clampNumber(center + spread, 1800, 15000),
  };
}

function estimatePrePublishEngagementRate(score, hookScore) {
  const raw = 1.8 + ((score - 60) * 0.07) + ((hookScore - 55) * 0.025);
  return Number(clampNumber(raw, 2.1, 8.4).toFixed(1));
}

function getConfidenceLabel(platformScore, score, hookScore) {
  const combined = (platformScore * 8) + (score * 0.26) + (hookScore * 0.24);
  if (combined >= 62) return 'High';
  if (combined >= 52) return 'Medium';
  return 'Low';
}

function buildPlatformConfidence(platformScores, score, hookScore) {
  return Object.fromEntries(
    Object.entries(platformScores).map(([platform, platformScore]) => [
      platform,
      getConfidenceLabel(platformScore, score, hookScore),
    ])
  );
}

function buildCaptionHashtags(keywords) {
  const tags = keywords.slice(0, 3).map((keyword) => `#${keyword.charAt(0).toUpperCase()}${keyword.slice(1)}`);
  return tags.length > 0 ? tags : ['#ViralClip', '#ContentStrategy'];
}

function buildSmartPublishHook(title, keywords) {
  const safeTitle = String(title || '').trim();
  if (safeTitle) return safeTitle;
  if (keywords.length >= 2) return `Why ${keywords[0]} changes everything about ${keywords[1]}`;
  return 'This clip is built to stop the scroll';
}

function buildSmartPublishCaption(title, keywords, bestPlatforms, captionStyle) {
  const hook = buildSmartPublishHook(title, keywords);
  const tags = buildCaptionHashtags(keywords).join(' ');
  const CTA = bestPlatforms.includes('youtube')
    ? 'Save this for your next posting sprint and test the hook exactly as written.'
    : 'Use this angle while the topic still feels fresh and easy to share.';

  try {
    return `${hook}\n\n${captionStyle} framing keeps the idea clear in the first few seconds. ${CTA}\n\n${tags}`;
  } catch {
    return `${hook}\n\n${CTA}\n\n#ViralClip #ContentCreator`;
  }
}

function seedFromParts(...parts) {
  const joined = parts.map((part) => String(part || '')).join('|');
  let seed = 0;
  for (let index = 0; index < joined.length; index += 1) {
    seed = ((seed << 5) - seed + joined.charCodeAt(index)) >>> 0;
  }
  return seed || 1;
}

function seededUnit(seed, offset = 0) {
  const value = Math.sin((seed + 1) * (offset + 1) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function seededRange(seed, offset, min, max) {
  return min + (seededUnit(seed, offset) * (max - min));
}

function clampMetric(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPrimaryPlatform(post) {
  return normalizePlatformId(post?.primaryPlatform || post?.platform || post?.platforms?.[0]) || 'youtube';
}

function inferHookStyle(post, clip) {
  const explicit = String(clip?.captionStyle || '').trim();
  if (explicit) return explicit.toLowerCase();

  const value = `${post?.title || ''} ${post?.caption || ''}`.toLowerCase();
  if (/\b(how|tips|guide|lesson|tutorial)\b/.test(value)) return 'educational';
  if (/\b(story|moment|behind|day in the life)\b/.test(value)) return 'story';
  if (/\b(why|secret|mistake|stop|nobody|what happens)\b/.test(value) || /[?!]/.test(value)) return 'curiosity';
  return 'direct';
}

function buildPerformanceAnalytics(post, clip) {
  const platform = getPrimaryPlatform(post);
  const caption = String(post?.caption || clip?.aiCaption || clip?.title || '');
  const title = String(post?.title || clip?.title || '');
  const keywords = extractClipKeywords(`${title} ${caption}`);
  const seed = seedFromParts(post?.id, post?.clipId, platform, post?.publishedAt || post?.scheduledAt || '');
  const hookStrength = clip?.hookScore || estimateHookScore(title || caption, clip?.durationSeconds || 24);
  const score = clampMetric(post?.engagementScore || clip?.score || Math.round(hookStrength * 0.92), 55, 97);
  const baseViews = {
    youtube: [2600, 8600],
    twitter: [1000, 5200],
    instagram: [1800, 7600],
    tiktok: [3200, 10000],
  }[platform] || [1000, 10000];
  const keywordLift = keywords.length * 0.05;
  const scoreLift = score / 100;
  const views = clampMetric(
    Math.round(seededRange(seed, 1, baseViews[0], baseViews[1]) * (0.84 + keywordLift + (scoreLift * 0.18))),
    1000,
    10000,
  );
  const likeRate = {
    youtube: seededRange(seed, 2, 0.024, 0.058),
    twitter: seededRange(seed, 2, 0.02, 0.05),
    instagram: seededRange(seed, 2, 0.035, 0.075),
    tiktok: seededRange(seed, 2, 0.04, 0.08),
  }[platform] || 0.04;
  const commentRate = {
    youtube: seededRange(seed, 3, 0.005, 0.014),
    twitter: seededRange(seed, 3, 0.005, 0.012),
    instagram: seededRange(seed, 3, 0.006, 0.018),
    tiktok: seededRange(seed, 3, 0.007, 0.02),
  }[platform] || 0.007;
  const likes = Math.max(12, Math.round(views * likeRate));
  const comments = Math.max(2, Math.round(views * commentRate));
  const watchTime = platform === 'twitter'
    ? 0
    : Math.round(views * seededRange(seed, 4, 6, Math.max(12, (clip?.durationSeconds || 24) * 0.75)));
  const engagementRate = Number((((likes + (comments * 3)) / Math.max(views, 1)) * 100).toFixed(2));
  const engagementScore = clampMetric(Math.round((engagementRate * 10) + (watchTime > 0 ? Math.min(18, watchTime / Math.max(views, 1)) : 6) + (score * 0.2)), 58, 99);

  return {
    views,
    likes,
    comments,
    watchTime,
    engagementRate,
    engagementScore,
  };
}

function buildPerformanceInsights(post, clip, analytics, averageEngagementRate = 4.8) {
  const hookStyle = inferHookStyle(post, clip);
  const baseline = averageEngagementRate > 0 ? averageEngagementRate : 4.8;
  const performanceDelta = Math.round(((analytics.engagementRate - baseline) / Math.max(baseline, 0.1)) * 100);
  const performanceBand = performanceDelta >= 15 ? 'above_average' : performanceDelta <= -10 ? 'below_average' : 'around_average';

  const summary = performanceBand === 'above_average'
    ? `This post performed above your average due to a strong ${hookStyle}-driven hook.`
    : performanceBand === 'below_average'
      ? `This post landed below your average even though the ${hookStyle}-driven hook gave it an early chance to win attention.`
      : `This post performed close to your average and the ${hookStyle}-driven hook kept it competitive.`;

  const whatWorked = hookStyle === 'curiosity'
    ? 'Hook created immediate curiosity and gave the clip a strong reason to keep watching.'
    : hookStyle === 'educational'
      ? 'Clear value in the opening seconds made the post easy to understand and save.'
      : hookStyle === 'story'
        ? 'Story framing made the opening feel personal and helped viewers stay with the clip.'
        : 'Direct framing kept the message clear and reduced friction in the opening seconds.';

  const whatFailed = performanceBand === 'above_average'
    ? 'Caption could be more direct so the payoff lands faster once the hook wins attention.'
    : performanceBand === 'below_average'
      ? 'The first line did not hold enough tension after the hook, so the next version should sharpen the payoff sooner.'
      : 'The caption and CTA could be tighter so more viewers know what to do after the first strong beat.';

  const nextAction = `Create another clip using the same ${hookStyle} hook style but test a stronger CTA.`;

  return {
    summary,
    whatWorked,
    whatFailed,
    nextAction,
    suggestedNextContentIdea: nextAction,
    hookStyle,
    performanceDelta,
    performanceBand,
  };
}

function getAverageEngagementRate(posts, currentPostId) {
  const comparable = posts.filter((entry) => {
    if (!entry || entry.id === currentPostId) return false;
    const status = normalizePostStatus(entry.status);
    return (status === 'published' || status === 'analyzed') && Number(entry.engagementRate || 0) > 0;
  });

  if (comparable.length === 0) {
    return 4.8;
  }

  const total = comparable.reduce((sum, entry) => sum + Number(entry.engagementRate || 0), 0);
  return Number((total / comparable.length).toFixed(2));
}

function buildPerformanceLoopPayload(post, clip, history = [], analysisSource = 'simulated_loop') {
  const analytics = buildPerformanceAnalytics(post, clip);
  const averageEngagementRate = getAverageEngagementRate(history, post.id);
  const insight = buildPerformanceInsights(post, clip, analytics, averageEngagementRate);
  const platform = getPrimaryPlatform(post);
  return {
    status: 'analyzed',
    analyzed: true,
    publishedAt: post?.publishedAt || new Date(),
    views: analytics.views,
    likes: analytics.likes,
    comments: analytics.comments,
    watchTime: analytics.watchTime,
    engagementRate: analytics.engagementRate,
    engagementScore: analytics.engagementScore,
    analyticsUpdatedAt: new Date(),
    analyzedAt: new Date(),
    analysisSource,
    platformStatus: { [platform]: 'published' },
    insight,
    insights: insight,
  };
}

function getPerformanceLoopDelay(post) {
  const seed = seedFromParts(post?.id, post?.scheduledAt || post?.publishedAt || post?.createdAt || '');
  const simulatedDelay = Math.round(seededRange(seed, 8, 5000, 10000));
  const scheduledAt = normalizeDateValue(post?.scheduledAt);
  const waitUntilScheduled = post?.status === 'scheduled' && scheduledAt
    ? Math.max(0, scheduledAt.getTime() - Date.now())
    : 0;
  return waitUntilScheduled + simulatedDelay;
}

function clearPerformanceLoopTimer(postId) {
  const existing = performanceLoopTimers.get(postId);
  if (existing) {
    window.clearTimeout(existing);
    performanceLoopTimers.delete(postId);
  }
}

function clearAllPerformanceLoopTimers() {
  for (const postId of performanceLoopTimers.keys()) {
    clearPerformanceLoopTimer(postId);
  }
}

function shouldQueuePerformanceLoop(post) {
  const status = normalizePostStatus(post?.status);
  if (!post?.id || post?.analyzed || status === 'analyzed') return false;
  return status === 'ready_to_publish' || status === 'scheduled' || status === 'publishing';
}

async function executePerformanceLoop(userId, postId) {
  clearPerformanceLoopTimer(postId);

  const [post, allClips, allPosts] = await Promise.all([
    getPostById(userId, postId),
    getAllClips(userId),
    getAllPosts(userId),
  ]);

  if (!post || post.analyzed || normalizePostStatus(post.status) === 'analyzed') {
    return;
  }

  const scheduledAt = normalizeDateValue(post.scheduledAt);
  if (normalizePostStatus(post.status) === 'scheduled' && scheduledAt && scheduledAt.getTime() > Date.now()) {
    schedulePerformanceLoop(userId, post);
    return;
  }

  const platform = getPrimaryPlatform(post);
  await updatePost(userId, postId, {
    status: 'publishing',
    analyzed: false,
    publishedAt: post.publishedAt || new Date(),
    platformStatus: { [platform]: 'publishing' },
  });

  await new Promise((resolve) => window.setTimeout(resolve, 1200));

  const clipLookup = new Map(allClips.map((entry, index) => [entry.id, buildSmartPublishClip(entry, index)]));
  const clip = clipLookup.get(post.clipId) || clipLookup.get(post.sourceClipId) || null;
  const updatePayload = buildPerformanceLoopPayload(post, clip, allPosts, 'auto_growth_loop');

  await updatePost(userId, postId, updatePayload);
}

function schedulePerformanceLoop(userId, post) {
  if (!userId || !shouldQueuePerformanceLoop(post)) {
    clearPerformanceLoopTimer(post?.id);
    return;
  }

  clearPerformanceLoopTimer(post.id);
  const delay = getPerformanceLoopDelay(post);
  const timeoutId = window.setTimeout(() => {
    executePerformanceLoop(userId, post.id).catch((error) => {
      console.error('Automatic performance loop failed:', error);
    });
  }, delay);

  performanceLoopTimers.set(post.id, timeoutId);
}

function syncPerformanceLoops(userId, posts = []) {
  const activePostIds = new Set();

  posts.forEach((post) => {
    if (shouldQueuePerformanceLoop(post)) {
      activePostIds.add(post.id);
      schedulePerformanceLoop(userId, post);
    }
  });

  for (const postId of performanceLoopTimers.keys()) {
    if (!activePostIds.has(postId)) {
      clearPerformanceLoopTimer(postId);
    }
  }
}

function buildSmartPublishClip(clip, index) {
  const durationSeconds = Math.max(5, Math.round((clip.end || 0) - (clip.start || 0)));
  const clipTitle = String(clip.title || '').trim() || `Clip ${index + 1}`;
  const keywords = extractClipKeywords(clipTitle);
  const recommendation = buildClipRecommendations(clipTitle, durationSeconds);
  const hookScore = Number(clip.hookScore) || estimateHookScore(clipTitle, durationSeconds);
  const score = Number(clip.score) || estimateClipScore(clipTitle, durationSeconds, hookScore, recommendation.bestPlatforms);
  const platformConfidence = buildPlatformConfidence(recommendation.platformScores, score, hookScore);
  const urgency = score >= 90 ? 'high' : score >= 78 ? 'medium' : 'low';
  const bestTime = clip.bestTime || estimateBestTime(recommendation.bestPlatforms, clipTitle);
  const captionStyle = clip.captionStyle || inferCaptionStyle(clipTitle, durationSeconds);
  const predictedReachValue = Math.max(1800, Math.round(score * (durationSeconds <= 35 ? 140 : 112)));
  const estimatedViewsRange = estimatePrePublishViewsRange(score, hookScore);
  const estimatedEngagementRate = estimatePrePublishEngagementRate(score, hookScore);
  const performancePrediction = score >= 90
    ? `High-confidence fit for ${recommendation.bestPlatforms.map((platform) => SMART_PUBLISH_PLATFORM_LABELS[platform]).join(' and ')} with a strong first-three-second hook.`
    : score >= 80
      ? `Reliable engagement potential if you publish near ${bestTime} and keep the caption focused.`
      : 'Useful supporting content. Tighten the opening line or test it in a later slot.';

  return {
    id: clip.id,
    videoId: clip.videoId || null,
    title: clipTitle,
    durationSeconds,
    duration: formatDurationLabel(durationSeconds),
    img: clip.thumbnailUrl || '/assets/images/dashboard-mock.png',
    videoUrl: clip.videoUrl || null,
    aiCaption: clip.aiCaption || clip.caption || buildSmartPublishCaption(clipTitle, keywords, recommendation.bestPlatforms, captionStyle),
    aiHook: clip.aiHook || buildSmartPublishHook(clipTitle, keywords),
    score,
    bestPlatforms: recommendation.bestPlatforms,
    skipPlatforms: recommendation.skipPlatforms,
    platformConfidence,
    bestTime,
    urgency,
    hookScore,
    captionStyle,
    predictedReach: formatReachLabel(predictedReachValue),
    estimatedViewsLow: estimatedViewsRange.low,
    estimatedViewsHigh: estimatedViewsRange.high,
    estimatedViewsRange: `${formatReachLabel(estimatedViewsRange.low)} - ${formatReachLabel(estimatedViewsRange.high)}`,
    estimatedEngagementRate,
    performancePrediction,
    followUpTime: recommendation.bestPlatforms.includes('twitter') ? '45 minutes' : urgency === 'high' ? '2 hours' : urgency === 'medium' ? '4 hours' : '6 hours',
    createdAt: toIsoString(clip.createdAt),
  };
}

function defaultSmartPublishState() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lastClipId: null,
    dailyActions: [
      { id: 'post-youtube', label: 'Post to YouTube', completed: false, date: today },
      { id: 'post-tiktok', label: 'Export for TikTok', completed: false, date: today },
      { id: 'post-ig', label: 'Schedule Instagram Reel', completed: false, date: today },
    ],
  };
}

function normalizeSmartPublishState(profile) {
  const base = defaultSmartPublishState();
  const next = {
    ...base,
    ...(profile?.smartPublishState || {}),
  };
  const today = base.dailyActions[0].date;
  if (!Array.isArray(next.dailyActions) || next.dailyActions[0]?.date !== today) {
    next.dailyActions = base.dailyActions;
  }
  return next;
}

function buildPublishedPost(post, clipLookup) {
  const platform = normalizePlatformId(post.primaryPlatform || post.platforms?.[0]) || 'youtube';
  const clip = clipLookup.get(post.clipId) || clipLookup.get(post.sourceClipId) || null;
  const publishedAt = toIsoString(post.publishedAt) || toIsoString(post.scheduledAt) || toIsoString(post.createdAt) || new Date().toISOString();
  const normalizedStatus = normalizePostStatus(post.status);
  const engagementScore = clampNumber(Number(post.engagementScore || 0) || 0, 0, 100);
  const predictedReachValue = clip?.predictedReach || formatReachLabel(Math.max(1800, Math.round(engagementScore * 120)));
  const insight = (post.insight && typeof post.insight === 'object'
    ? post.insight
    : post.insights && typeof post.insights === 'object'
      ? post.insights
      : null);
  const hookStyle = insight?.hookStyle || inferHookStyle(post, clip);
  const performanceDelta = Number(insight?.performanceDelta ?? 0) || 0;
  const performanceBand = insight?.performanceBand || (performanceDelta >= 15 ? 'above_average' : performanceDelta <= -10 ? 'below_average' : 'around_average');

  return {
    id: post.id,
    clipId: clip?.id || post.clipId || post.id,
    clipTitle: clip?.title || 'Untitled Clip',
    clipImg: clip?.img || '/assets/images/dashboard-mock.png',
    platform,
    platformName: SMART_PUBLISH_PLATFORM_LABELS[platform] || platform.charAt(0).toUpperCase() + platform.slice(1),
    publishedAt,
    scheduledAt: toIsoString(post.scheduledAt) || undefined,
    status: normalizedStatus,
    analyzed: Boolean(post.analyzed) || normalizedStatus === 'analyzed',
    predictedReach: predictedReachValue,
    hookScore: clip?.hookScore || clampNumber(Math.max(55, engagementScore || 70), 55, 96),
    views: Number(post.views || 0) || 0,
    likes: Number(post.likes || 0) || 0,
    comments: Number(post.comments || 0) || 0,
    watchTime: Number(post.watchTime || 0) || 0,
    engagementRate: Number(post.engagementRate || 0) || 0,
    analyzedAt: toIsoString(post.analyzedAt) || undefined,
    insight: insight || null,
    insightSummary: insight?.summary || null,
    whatWorked: insight?.whatWorked || null,
    whatFailed: insight?.whatFailed || null,
    nextAction: insight?.nextAction || insight?.suggestedNextContentIdea || null,
    nextContentIdea: insight?.nextAction || insight?.suggestedNextContentIdea || null,
    hookStyle,
    performanceDelta,
    performanceBand,
  };
}

async function getSmartPublishSnapshot(user) {
  if (!user) {
    return {
      user: null,
      clips: [],
      publishedPosts: [],
      notice: null,
      ...defaultSmartPublishState(),
    };
  }

  const [clipsResult, postsResult, profileResult] = await Promise.allSettled([
    getAllClips(user.uid),
    getAllPosts(user.uid),
    getUserProfile(user.uid),
  ]);

  const clips = clipsResult.status === 'fulfilled' ? clipsResult.value : [];
  const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const notices = [];

  if (clipsResult.status === 'rejected') {
    notices.push('Clips could not be loaded, so Smart Publish is showing a safe empty state.');
  }

  if (postsResult.status === 'rejected') {
    notices.push('Recent post history is temporarily unavailable.');
  }

  if (profileResult.status === 'rejected') {
    notices.push('Saved Smart Publish preferences could not be restored.');
  }

  const smartPublishState = normalizeSmartPublishState(profile);
  const mappedClips = clips.map((clip, index) => buildSmartPublishClip(clip, index));
  const clipLookup = new Map(mappedClips.map((clip) => [clip.id, clip]));

  return {
    user: {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
    },
    clips: mappedClips,
    publishedPosts: posts.map((post) => buildPublishedPost(post, clipLookup)),
    notice: notices.length > 0 ? notices.join(' ') : null,
    lastClipId: smartPublishState.lastClipId,
    dailyActions: smartPublishState.dailyActions,
  };
}

function cleanupSmartPublishSession(targetWindow) {
  const existing = smartPublishSessions.get(targetWindow);
  if (existing?.unsubscribePosts) {
    existing.unsubscribePosts();
  }
  smartPublishSessions.delete(targetWindow);
}

function subscribeSmartPublishPosts(targetWindow, origin, userId, clips) {
  const clipLookup = new Map(clips.map((clip) => [clip.id, clip]));
  const unsubscribePosts = subscribeToPosts(userId, (posts) => {
    postSmartPublishMessage(targetWindow, origin, 'SMART_PUBLISH_POSTS_UPDATED', {
      publishedPosts: posts.map((post) => buildPublishedPost(post, clipLookup)),
    });
  }, (error) => {
    postSmartPublishMessage(targetWindow, origin, 'SMART_PUBLISH_ERROR', {
      message: error?.message || 'Live post updates are temporarily unavailable.',
    });
  });

  smartPublishSessions.set(targetWindow, { origin, unsubscribePosts });
}

async function broadcastSmartPublishState() {
  const user = appState.getState().user;
  const snapshot = await getSmartPublishSnapshot(user);

  for (const [targetWindow, session] of smartPublishSessions.entries()) {
    try {
      cleanupSmartPublishSession(targetWindow);
      postSmartPublishMessage(targetWindow, session.origin, 'SMART_PUBLISH_STATE', snapshot);
      if (user) {
        subscribeSmartPublishPosts(targetWindow, session.origin, user.uid, snapshot.clips);
      }
    } catch (error) {
      postSmartPublishMessage(targetWindow, session.origin, 'SMART_PUBLISH_ERROR', {
        message: error?.message || 'Unable to sync Smart Publish right now.',
      });
    }
  }
}

async function setupSmartPublishBridge() {
  if (window.__SMART_PUBLISH_BRIDGE_READY__) return;
  window.__SMART_PUBLISH_BRIDGE_READY__ = true;

  window.addEventListener('message', async (event) => {
    if (event.data?.channel !== SMART_PUBLISH_CHANNEL) return;
    if (!isSmartPublishOrigin(event.origin)) return;

    const { type, requestId, payload = {} } = event.data;
    const targetWindow = event.source;
    if (!targetWindow) return;

    const user = appState.getState().user;

    try {
      if (type === 'SMART_PUBLISH_INIT') {
        const snapshot = await getSmartPublishSnapshot(user);
        cleanupSmartPublishSession(targetWindow);
        postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_STATE', snapshot, requestId);
        if (user) {
          subscribeSmartPublishPosts(targetWindow, event.origin, user.uid, snapshot.clips);
        }
        return;
      }

      if (!user) {
        postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_ERROR', {
          message: 'No authenticated Firebase user is available in the dashboard session.',
        }, requestId);
        return;
      }

      if (type === 'SMART_PUBLISH_UPDATE_STATE') {
        const profile = await getUserProfile(user.uid);
        const current = normalizeSmartPublishState(profile);
        const nextState = {
          ...current,
          ...(payload || {}),
        };

        await updateUserProfile(user.uid, { smartPublishState: nextState });

        postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_STATE_UPDATED', nextState, requestId);
        return;
      }

      if (type === 'SMART_PUBLISH_CREATE_POST') {
        const platform = normalizePlatformId(payload.platform);
        const scheduledAt = payload.publishNow
          ? new Date()
          : payload.scheduledAt
            ? new Date(payload.scheduledAt)
            : null;
        const caption = String(payload.caption || payload.title || 'Untitled Clip').trim();
        const clipId = String(payload.clipId || '').trim() || null;

        if (!platform) {
          throw new Error('A valid publish platform is required.');
        }

        if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
          throw new Error('Choose a valid schedule time before sending this post to Firebase.');
        }

        const postId = await createPost(user.uid, {
          title: String(payload.title || '').trim(),
          caption,
          platforms: [platform],
          primaryPlatform: platform,
          scheduledAt,
          status: 'scheduled',
          analyzed: false,
          mediaUrl: payload.videoUrl || null,
          mediaType: 'video',
          platformStatus: { [platform]: payload.publishNow ? 'queued' : 'scheduled' },
          clipId,
          sourceClipId: clipId,
          origin: 'smart_publish',
          workflow: 'ai_coach_embed',
          schemaVersion: 2,
        });

        if (payload.publishNow) {
          await updatePost(user.uid, postId, {
            status: 'ready_to_publish',
            analyzed: false,
            scheduledAt,
            clipId,
            sourceClipId: clipId,
            platformStatus: { [platform]: 'queued' },
          });
        }

        postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_POST_CREATED', {
          postId,
          status: payload.publishNow ? 'ready_to_publish' : 'scheduled',
          platform,
          scheduledAt: scheduledAt.toISOString(),
          message: payload.publishNow
            ? `${SMART_PUBLISH_PLATFORM_LABELS[platform]} is now queued for immediate publishing.`
            : `${SMART_PUBLISH_PLATFORM_LABELS[platform]} was scheduled successfully.`,
        }, requestId);
        return;
      }

      if (type === 'SMART_PUBLISH_ANALYZE_POST') {
        const postId = String(payload.postId || '').trim();
        if (!postId) {
          throw new Error('A valid post id is required to analyze performance.');
        }

        const [post, clips, allPosts] = await Promise.all([
          getPostById(user.uid, postId),
          getAllClips(user.uid),
          getAllPosts(user.uid),
        ]);

        if (!post) {
          throw new Error('The selected post could not be found.');
        }

        const clipLookup = new Map(clips.map((entry, index) => [entry.id, buildSmartPublishClip(entry, index)]));
        const clip = clipLookup.get(post.clipId) || clipLookup.get(post.sourceClipId) || null;
        const updatePayload = buildPerformanceLoopPayload(post, clip, allPosts, 'dashboard_manual');

        await updatePost(user.uid, postId, updatePayload);

        postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_POST_ANALYZED', {
          postId,
          status: 'analyzed',
          message: 'Performance analytics and coaching insights were refreshed.',
        }, requestId);
        return;
      }
    } catch (error) {
      console.error('Smart Publish bridge error:', error);
      postSmartPublishMessage(targetWindow, event.origin, 'SMART_PUBLISH_ERROR', {
        message: error.message || 'Smart Publish bridge request failed.',
      }, requestId);
    }
  });
}

// ─── Data Loading ─── //

export async function loadUserData() {
  const user = appState.getState().user;
  if (!user) return;

  try {
    showLoadingOverlay();

    const [accounts, analytics, profile] = await Promise.all([
      getAccounts(user.uid),
      getAnalytics(user.uid),
      getUserProfile(user.uid)
    ]);

    const normalizedProfile = {
      email: user.email || '',
      displayName: user.displayName || '',
      hasCompletedOnboarding: false,
      niche: '',
      platforms: [],
      aiMode: 'platform',
      apiKey: '',
      credits: 100,
      ...(profile || {})
    };

    const shouldPersistProfileDefaults = !profile || ['aiMode', 'apiKey', 'credits'].some((key) => profile[key] === undefined);

    if (shouldPersistProfileDefaults) {
      await updateUserProfile(user.uid, normalizedProfile);
    }

    appState.setAccounts(accounts);
    appState.setAnalytics(analytics);
    appState.setProfile(normalizedProfile);

    hideLoadingOverlay();
  } catch (error) {
    showToast(error.message, 'error');
    hideLoadingOverlay();
  }
}

// ─── App Initialization ─── //

function setupRouter(sidebar) {
  router.register('dashboard', async () => {
    dashboardModule.render();
  });

  router.register('ai-coach', async () => {
    initializeAiCoachFrame();
  });

  router.register('calendar', async () => {
    calendarModule.render();
  });

  router.register('accounts', async () => {
    accountsModule.render();
  });

  router.register('analytics', async () => {
    analyticsModule.render();
  });

  router.register('clips', async () => {
    await clipsModule.render();
  });

  router.register('activity', async () => {
    activityModule.render();
  });

  // Listen to router changes to update sidebar active state
  router.init();
  setInterval(() => {
    sidebar.setActive(router.currentView);
    
    // Update Mobile Bottom Nav Active State
    document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
      if (item.dataset.view === router.currentView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }, 100);
}

async function initializeApp() {
  try {
    // 1. Render UI Components
    const sidebar = new SidebarComponent('sidebar');
    new TopbarComponent('topbar');
    initializeTopbarNotificationDropdown();
    new ModalComponent('createPostModalContainer');

    // 2. Re-bind DOM elements for features like CreatePost because HTML was dynamically added
    createPostModule.modal = document.getElementById('createPostModal');
    createPostModule.form = document.getElementById('createPostForm');
    createPostModule.openBtn = document.getElementById('openCreatePostBtn');
    createPostModule.submitBtn = document.getElementById('createPostSubmitBtn');
    createPostModule.closeBtn = document.querySelector('.modal-close-btn');
    createPostModule.saveDraftBtn = document.getElementById('saveDraftBtn');
    createPostModule.captionInput = document.getElementById('postCaption');
    createPostModule.scheduleInput = document.getElementById('scheduleDateTime');
    createPostModule.platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
    createPostModule.generateCaptionBtn = document.getElementById('generateCaptionBtn');
    createPostModule.autoScheduleBtn = document.getElementById('autoScheduleBtn');
    createPostModule.init();

    // -- Mobile UX Handlers --
    // Mobile FAB (Floating Action Button) - NOW TRIGGERS AI
    const mobileFab = document.getElementById('mobileFab');
    if (mobileFab) {
      mobileFab.addEventListener('click', () => {
        aiAgentModule.toggle();
      });
    }

    // Bottom Nav Click -> Route
    document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        if (view) {
          router.navigate(view);
          
          // Update active state
          document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      });
    });

    // Rebind Auth elements
    authManager.setupAuthElements();
    authManager.setupAuthListeners();

    // Resolve the AI Coach iframe source once on boot so direct deep-links work too.
    initializeAiCoachFrame();
    await setupSmartPublishBridge();

    // 3. Setup Routes and Auth-aware subscriptions
    setupRouter(sidebar);

    let postUnsubscribe = null;
    let logsUnsubscribe = null;
    let activeUserId = null;

    const syncSession = async (user) => {
      if (user?.uid === activeUserId) return;
      if (!user && activeUserId === null) return;

      clearAllPerformanceLoopTimers();

      if (postUnsubscribe) {
        postUnsubscribe();
        postUnsubscribe = null;
      }
      if (logsUnsubscribe) {
        logsUnsubscribe();
        logsUnsubscribe = null;
      }
      schedulerService.stop();
      analyticsService.stop();

      activeUserId = user?.uid ?? null;

      if (!user) {
        clearAllPerformanceLoopTimers();
        await broadcastSmartPublishState();
        return;
      }

      postUnsubscribe = subscribeToPosts(user.uid, (posts) => {
        appState.setPosts(posts);
        syncPerformanceLoops(user.uid, posts);
      });
      logsUnsubscribe = subscribeToLogs(user.uid, (logs) => {
        appState.setLogs(logs);
      });

      schedulerService.start();
      analyticsService.start();
      await loadUserData();
      router.renderCurrentView();
      await broadcastSmartPublishState();
    };

    appState.subscribe(changes => {
      if (changes.type === 'USER_UPDATED') {
        syncSession(changes.payload).catch((error) => {
          console.error('Failed to sync user session:', error);
        });
      }
    });

    await waitForInitialAuthState();
    await syncSession(appState.getState().user);

    // Automatically navigate to correct view if on first load
    aiAgentModule.init();

    if (appState.getState().user) {
      router.renderCurrentView();
    }

    console.log('ViralClip Dashboard initialized completely');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  // Force safe re-render on resize
  window.addEventListener("resize", () => {
    router.renderCurrentView();
  });
});
