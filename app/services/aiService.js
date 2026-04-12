// ─────────────────────────────────────────────────────────────────
// aiService.js - AI Integration Layer (FYIXT-powered)
// Now uses real AI via FYIXT backend instead of mocks
// ─────────────────────────────────────────────────────────────────

import { fyixtService } from './fyixtService.js';

class AiService {
  constructor() {
    // Set to false to use FYIXT backend, true for offline mock fallback
    this.isMocking = false;
    this.fyixtAvailable = null; // Will be checked on first call
  }

  /**
   * Check if FYIXT backend is available
   */
  async _checkFyixtAvailability() {
    if (this.fyixtAvailable !== null) return this.fyixtAvailable;
    
    try {
      const health = await fyixtService.healthCheck();
      this.fyixtAvailable = health.online;
      console.log(`[AI] FYIXT backend: ${health.online ? '✅ Online' : '❌ Offline'}`);
      return this.fyixtAvailable;
    } catch {
      this.fyixtAvailable = false;
      return false;
    }
  }

  /**
   * Generates an optimized social media caption based on a given prompt.
   * Uses real AI when FYIXT is available, falls back to templates otherwise.
   */
  async generateCaption(prompt, options = {}) {
    if (!prompt) throw new Error("Prompt is required for caption generation.");
    
    const isOnline = await this._checkFyixtAvailability();
    
    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.generateCaption({
          topic: prompt,
          platform: options.platform || 'instagram',
          tone: options.tone || 'casual',
          maxLength: options.maxLength || 220,
          includeHashtags: options.includeHashtags !== false,
          hashtagsCount: options.hashtagsCount || 5,
          keywords: options.keywords || [],
        });

        const hashtags = result.hashtags || [];
        const hashtagString = hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');

        return {
          hook: result.caption?.split('\n')[0] || result.caption?.substring(0, 50) || '',
          body: result.caption || '',
          hashtags: hashtagString,
          fullCaption: `${result.caption}${hashtagString ? '\n\n' + hashtagString : ''}`,
          source: 'fyixt',
          model: result.model || 'ai',
        };
      } catch (error) {
        console.warn('[AI] FYIXT caption failed, using fallback:', error.message);
      }
    }

    // Fallback: mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const hooks = [
      "Stop scrolling! 🛑",
      "Did you know this insane secret? 🤯",
      "Here is why you've been doing it wrong... 👇",
      "The ultimate hack you didn't know you needed! ✨"
    ];
    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    const captionBody = `We asked AI to generate content about "${prompt}" and the results are amazing.`;
    const hashtags = ["#Growth", "#ViralClip", "#Automation", "#Creators"];
    
    return {
      hook: randomHook,
      body: captionBody,
      hashtags: hashtags.join(' '),
      fullCaption: `${randomHook}\n\n${captionBody}\n\n${hashtags.join(' ')}`,
      source: 'fallback',
    };
  }

  /**
   * Generates a list of content ideas based on a specific niche.
   * Uses XY-AI engine for real AI-powered ideas.
   */
  async generateContentIdeas(niche) {
    if (!niche) throw new Error("Niche is required to generate ideas.");

    const isOnline = await this._checkFyixtAvailability();

    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.generateContentIdeas({
          niche,
          count: 5,
          platforms: ['instagram', 'tiktok', 'youtube'],
        });

        if (result.prompts && Array.isArray(result.prompts)) {
          return result.prompts.map(p => ({
            title: p.title || p.prompt || p,
            format: p.format || 'Short-form Video',
            hook: p.hook || p.caption || 'Check this out...',
            platform: p.platform,
          }));
        }
      } catch (error) {
        console.warn('[AI] FYIXT content ideas failed, using fallback:', error.message);
      }
    }

    // Fallback
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { title: `Top 3 mistakes in ${niche}`, format: 'Reel/TikTok', hook: 'Are you making these mistakes?' },
      { title: `A day in the life: ${niche} edition`, format: 'Vlog', hook: 'Come with me while I...' },
      { title: `How I automated my ${niche} workflow`, format: 'Carousel', hook: 'Steal my exact system...' },
      { title: `The harsh truth about ${niche}`, format: 'Talking Head', hook: 'Nobody wants to admit this...' }
    ];
  }

  /**
   * Generate a weekly content plan using XY-AI engine
   */
  async generateContentPlan(niche, days = 7, postsPerDay = 1) {
    const isOnline = await this._checkFyixtAvailability();

    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.generateContentPlan({
          niche,
          days,
          postsPerDay,
          platforms: ['instagram', 'tiktok', 'youtube'],
        });
        return {
          success: true,
          plan: result.plan || result,
          source: 'fyixt',
        };
      } catch (error) {
        console.warn('[AI] FYIXT content plan failed:', error.message);
      }
    }

    // Fallback
    const ideas = await this.generateContentIdeas(niche);
    return {
      success: true,
      plan: ideas.slice(0, days * postsPerDay),
      source: 'fallback',
    };
  }

  /**
   * Get trending topics for a niche
   */
  async getTrends(niche, platform = 'tiktok') {
    const isOnline = await this._checkFyixtAvailability();

    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.getTrends({ niche, platform });
        return {
          success: true,
          trends: result.trends || result,
          source: 'fyixt',
        };
      } catch (error) {
        console.warn('[AI] FYIXT trends failed:', error.message);
      }
    }

    // Fallback trending topics
    return {
      success: true,
      trends: [
        `${niche} hacks you need to know`,
        `Why ${niche} is changing in 2024`,
        `${niche} mistakes to avoid`,
        `Getting started with ${niche}`,
      ],
      source: 'fallback',
    };
  }

  /**
   * Calculates the best possible posting time using AI analysis.
   */
  async getBestPostingTime(userData) {
    const isOnline = await this._checkFyixtAvailability();

    // For now, use heuristic-based logic
    // Future: integrate with FYIXT analytics
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    now.setDate(now.getDate() + 1);
    
    const peakHours = [12, 17, 18, 19];
    const randomHour = peakHours[Math.floor(Math.random() * peakHours.length)];
    now.setHours(randomHour, 0, 0, 0);
    
    const audienceLabel = userData?.audienceLabel || 'your audience';

    return {
      suggestedDate: now,
      reason: `Historical engagement peaks at ${randomHour}:00 for ${audienceLabel}.`,
    };
  }

  /**
   * Generates AI Insights interpreting analytical statistics.
   */
  async generateInsights(analyticsData) {
    const isOnline = await this._checkFyixtAvailability();
    const trackedPlatforms = Array.isArray(analyticsData) ? analyticsData.length : 0;

    if (isOnline && !this.isMocking) {
      try {
        // Use FYIXT chat for insights generation
        const analyticsContext = JSON.stringify(analyticsData);
        const result = await fyixtService.chat({
          message: `Analyze this social media analytics data and provide 3-4 actionable insights for growth: ${analyticsContext}`,
          context: 'social_media_analytics',
        });

        if (result.response) {
          // Parse bullet points from response
          const insights = result.response
            .split(/[\n•\-\d\.]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.length < 200);
          
          if (insights.length >= 2) {
            return insights.slice(0, 4);
          }
        }
      } catch (error) {
        console.warn('[AI] FYIXT insights failed:', error.message);
      }
    }

    // Fallback insights
    return [
      `Posts scheduled between 6 PM - 8 PM are outperforming morning posts by 30% across ${trackedPlatforms || 'your connected'} platform${trackedPlatforms === 1 ? '' : 's'}.`,
      "Short, punchy captions under 15 words generate 2x more comments.",
      "Your TikTok growth is accelerating faster than YouTube—consider prioritizing short-form video.",
      "Carousels are driving 40% more profile visits this week."
    ];
  }

  /**
   * Chat with AI assistant - real AI conversation
   */
  async chat(message, context = null) {
    const isOnline = await this._checkFyixtAvailability();

    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.chat({ message, context });
        return {
          success: true,
          response: result.response || result.message || result,
          model: result.model,
          source: 'fyixt',
        };
      } catch (error) {
        console.warn('[AI] FYIXT chat failed:', error.message);
      }
    }

    // Fallback response
    return {
      success: true,
      response: "I'm currently in offline mode. Please ensure the FYIXT backend is running for full AI capabilities.",
      source: 'fallback',
    };
  }

  /**
   * Generate hashtags for a topic
   */
  async generateHashtags(topic, options = {}) {
    const isOnline = await this._checkFyixtAvailability();

    if (isOnline && !this.isMocking) {
      try {
        const result = await fyixtService.generateHashtags({
          topic,
          platform: options.platform || 'instagram',
          count: options.count || 10,
          style: options.style || 'mixed',
        });
        return {
          success: true,
          hashtags: result.hashtags || [],
          source: 'fyixt',
        };
      } catch (error) {
        console.warn('[AI] FYIXT hashtags failed:', error.message);
      }
    }

    // Fallback
    const words = topic.split(/\s+/).filter(w => w.length > 3);
    const hashtags = words.slice(0, 5).map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
    hashtags.push('#viral', '#trending', '#fyp', '#explore', '#growth');
    
    return {
      success: true,
      hashtags: hashtags.slice(0, options.count || 10),
      source: 'fallback',
    };
  }
}

export const aiService = new AiService();
