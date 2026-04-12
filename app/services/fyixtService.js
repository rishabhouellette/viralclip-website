// ─────────────────────────────────────────────────────────────────
// fyixtService.js - FYIXT Backend Integration Service
// Bridges ViralClip frontend to FYIXT's real AI & platform APIs
// ─────────────────────────────────────────────────────────────────

class FyixtService {
  constructor() {
    // FYIXT backend URL - change for production
    this.baseUrl = this._detectBackendUrl();
    this.timeout = 30000; // 30 second timeout for AI operations
  }

  /**
   * Auto-detect backend URL based on environment
   * Now uses same-origin Firebase Functions (no external FYIXT backend needed)
   */
  _detectBackendUrl() {
    // Check for explicit config
    if (window.FYIXT_API_URL) return window.FYIXT_API_URL;
    
    // Use same-origin for Firebase Functions (OAuth, accounts, etc.)
    // This routes through firebase.json rewrites to Cloud Functions
    return '';
  }

  /**
   * Generic API request handler with error handling
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AI FEATURES - Caption, Hashtags, Content Ideas
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate AI-powered caption using FYIXT backend
   */
  async generateCaption({ topic, platform = 'instagram', tone = 'casual', maxLength = 220, includeHashtags = true, hashtagsCount = 5, keywords = [] }) {
    return await this._request('/api/ai/caption', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        platform,
        tone,
        max_length: maxLength,
        include_hashtags: includeHashtags,
        hashtags_count: hashtagsCount,
        keywords,
      }),
    });
  }

  /**
   * Generate hashtags using FYIXT backend
   */
  async generateHashtags({ topic, platform = 'instagram', count = 10, style = 'mixed' }) {
    return await this._request('/api/ai/hashtags', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        platform,
        count,
        style,
      }),
    });
  }

  /**
   * Generate content ideas/prompts using XY-AI engine
   */
  async generateContentIdeas({ niche, count = 5, platforms = ['instagram', 'tiktok', 'youtube'] }) {
    return await this._request('/api/xy-ai/prompts', {
      method: 'POST',
      body: JSON.stringify({
        niche,
        count,
        platforms,
      }),
    });
  }

  /**
   * Generate weekly content plan using XY-AI engine
   */
  async generateContentPlan({ niche, days = 7, postsPerDay = 1, platforms = ['instagram', 'tiktok'] }) {
    return await this._request('/api/xy-ai/content-plan', {
      method: 'POST',
      body: JSON.stringify({
        niche,
        days,
        posts_per_day: postsPerDay,
        platforms,
      }),
    });
  }

  /**
   * Get trending topics for a niche
   */
  async getTrends({ niche, platform = 'tiktok' }) {
    return await this._request('/api/xy-ai/trends', {
      method: 'POST',
      body: JSON.stringify({ niche, platform }),
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // AI CHAT - Real AI conversation
  // ═══════════════════════════════════════════════════════════════

  /**
   * Send message to AI chat (uses Ollama/OpenAI/Gemini cascade)
   */
  async chat({ message, context = null, conversationId = null }) {
    return await this._request('/api/xy-ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        conversation_id: conversationId,
      }),
    });
  }

  /**
   * Get available chat models
   */
  async getChatModels() {
    return await this._request('/api/xy-ai/chat/models', { method: 'GET' });
  }

  // ═══════════════════════════════════════════════════════════════
  // VIDEO PROCESSING - Real clip generation
  // ═══════════════════════════════════════════════════════════════

  /**
   * Process video and generate clips
   */
  async processVideo({ videoUrl, videoPath, clipCount = 5, minDuration = 15, maxDuration = 60 }) {
    return await this._request('/api/video/process', {
      method: 'POST',
      body: JSON.stringify({
        video_url: videoUrl,
        video_path: videoPath,
        clip_count: clipCount,
        min_duration: minDuration,
        max_duration: maxDuration,
      }),
    });
  }

  /**
   * Generate faceless video from script
   */
  async generateFacelessVideo({ script, voice = 'default', style = 'documentary' }) {
    return await this._request('/api/video/faceless', {
      method: 'POST',
      body: JSON.stringify({ script, voice, style }),
    });
  }

  /**
   * Score video for virality potential
   */
  async scoreVideo({ videoPath }) {
    return await this._request('/api/video/score', {
      method: 'POST',
      body: JSON.stringify({ video_path: videoPath }),
    });
  }

  /**
   * Upload a file to FYIXT backend
   */
  async uploadFile(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ success: true, message: xhr.responseText });
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.open('POST', `${this.baseUrl}/api/upload`);
      xhr.send(formData);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCOUNTS & OAUTH - Real platform connections
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all connected accounts from FYIXT
   */
  async getAccounts() {
    return await this._request('/api/accounts', { method: 'GET' });
  }

  /**
   * Start OAuth flow for a platform
   * Returns the OAuth URL to redirect the user to
   */
  async startOAuth(platform) {
    const result = await this._request(`/oauth/start/${platform}`, { method: 'POST' });
    return result.auth_url || result.url;
  }

  /**
   * Get active accounts (selected accounts per platform)
   */
  async getActiveAccounts() {
    return await this._request('/api/active-accounts', { method: 'GET' });
  }

  /**
   * Set active account for a platform
   */
  async setActiveAccount(platform, accountId) {
    return await this._request('/api/active-accounts', {
      method: 'POST',
      body: JSON.stringify({ platform, account_id: accountId }),
    });
  }

  /**
   * Refresh account token
   */
  async refreshAccount(accountId) {
    return await this._request(`/api/accounts/${accountId}/refresh`, {
      method: 'POST',
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLISHING & SCHEDULING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Schedule a post
   */
  async schedulePost({ platforms, caption, mediaPath, scheduledAt }) {
    return await this._request('/api/schedule', {
      method: 'POST',
      body: JSON.stringify({
        platforms,
        caption,
        media_path: mediaPath,
        scheduled_at: scheduledAt,
      }),
    });
  }

  /**
   * Publish instantly to platforms
   */
  async publishInstant({ platforms, caption, mediaPath }) {
    return await this._request('/api/publish/instant', {
      method: 'POST',
      body: JSON.stringify({
        platforms,
        caption,
        media_path: mediaPath,
      }),
    });
  }

  /**
   * Get all scheduled posts
   */
  async getScheduledPosts() {
    return await this._request('/api/scheduled-posts', { method: 'GET' });
  }

  /**
   * Get analytics summary
   */
  async getAnalytics() {
    return await this._request('/api/analytics/summary', { method: 'GET' });
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Health check - verify FYIXT backend is running
   */
  async healthCheck() {
    try {
      const result = await this._request('/api/health', { method: 'GET' });
      return { online: true, ...result };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  /**
   * Get available niches
   */
  async getNiches() {
    return await this._request('/api/xy-ai/niches', { method: 'GET' });
  }

  /**
   * Translate text
   */
  async translate({ text, targetLanguage, sourceLanguage = 'auto' }) {
    return await this._request('/api/ai/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage,
      }),
    });
  }
}

// Export singleton instance
export const fyixtService = new FyixtService();

// Also export class for testing
export { FyixtService };
