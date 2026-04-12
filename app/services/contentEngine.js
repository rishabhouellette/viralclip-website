// ─────────────────────────────────────────────────────────────────
// contentEngine.js - AI Content Automation Workflow Pipeline
// ─────────────────────────────────────────────────────────────────
import { aiService } from './aiService.js';
import { trendService } from './trendService.js';
import { createPost, getAnalytics } from './firestoreService.js';
import { learningService } from './learningService.js';
import { Timestamp } from '../js/firebase.js';

class ContentEngine {
  /**
   * Generates a batch content plan (7-14 posts) and returns the JSON structured plan.
   */
  async generateWeeklyPlan(userId, niche, frequency = 7) {
    // 1. Fetch system trends
    const trends = await trendService.getTrendingTopics();
    
    // 2. Map high-volume trends to the niche and prompt AiService for ideas
    const ideas = await aiService.generateContentIdeas(niche);
    
    // 2.5 Fetch User Analytics and Learning History for System Feedback Loop
    const analytics = await getAnalytics(userId);
    const learningData = await learningService.learnFromHistory(userId);

    // 3. Assemble the raw plan
    const plan = [];
    const now = new Date();

    for (let i = 0; i < frequency; i++) {
        // Round-robin idea allocation or use trends
        const idea = ideas[i % ideas.length];
        const trendTarget = trends[i % trends.length];

        // 4. Generate Caption
        const prompt = `Create a ${idea.format} about ${idea.title} leveraging the viral trend: ${trendTarget.topic}`;
        const captionPayload = await aiService.generateCaption(prompt);

        // 5. Apply Heuristics
        const platforms = this.decideBestPlatform({ format: idea.format, topic: trendTarget.topic }, analytics, learningData);
        const scheduledTime = await this.decideBestTime(plan, plan.length === 0 ? now : plan[plan.length - 1].scheduledDate, analytics, learningData);
        
        plan.push({
            caption: captionPayload.fullCaption,
            platforms: platforms,
            scheduledDate: scheduledTime,
            status: 'scheduled',
            tags: captionPayload.hashtags
        });
    }

    return plan;
  }

  /**
   * Triggers the full automated pipeline and injects posts into the database directly.
   */
  async autoGenerateAndSchedule(userId, niche, frequency = 7) {
    if (!userId) throw new Error("userId required for content engine scheduling.");
    
    try {
        const plan = await this.generateWeeklyPlan(userId, niche, frequency);
        const scheduledIds = [];

        // Store generated posts into existing Firestore flow
        for (const post of plan) {
            const dbPayload = {
                caption: post.caption,
                platforms: post.platforms,
                scheduledAt: Timestamp.fromDate(post.scheduledDate),
                status: 'scheduled'
            };
            const id = await createPost(userId, dbPayload);
            scheduledIds.push(id);
        }
        return { success: true, count: scheduledIds.length, ids: scheduledIds };
    } catch (error) {
        console.error("Content Engine Auto-Schedule Failed:", error);
        throw error;
    }
  }

  /**
   * Intelligent heuristic determining the optimal platforms for a format.
   */
  decideBestPlatform(contentIdea, analytics = [], learningData = null) {
     if (learningData && learningData.hasData && learningData.rankedPlatforms && learningData.rankedPlatforms.length > 0) {
         console.log(`[Adaptive Intelligence] Using learned top platform: ${learningData.rankedPlatforms[0]}`);
         return [learningData.rankedPlatforms[0]]; // Strongly prefer best platform
     }
     
     // Fallback to heuristics
     const platforms = [];
     const lowerFormat = contentIdea.format.toLowerCase();

     // Mock format matching
     if (lowerFormat.includes('reel') || lowerFormat.includes('tiktok') || lowerFormat.includes('video')) {
         platforms.push('tiktok', 'instagram', 'youtube'); // Shorts implies YouTube 
     } else if (lowerFormat.includes('carousel')) {
         platforms.push('instagram');
     } else if (lowerFormat.includes('vlog')){
         platforms.push('youtube');
     } else {
         platforms.push('instagram', 'tiktok'); // Default
     }

     // Feedback Loop: Add top performing platform dynamically if it has high engagement
     if (analytics && analytics.length > 0) {
         const topPlatform = analytics.reduce((prev, current) => {
             return (prev.engagement > current.engagement) ? prev : current;
         });
         
         if (topPlatform && topPlatform.engagement > 0) {
             console.log(`[Feedback Loop] Boosting top platform ${topPlatform.platform} due to high engagement.`);
             platforms.push(topPlatform.platform);
         }
     }

     return [...new Set(platforms)];
  }

  /**
   * Distributes posts sequentially into optimal time blocks.
   */
  async decideBestTime(planArr, lastDateRef, analytics = [], learningData = null) {
      const baseDate = new Date();
      
      let peakHour = 18; // Default 6 PM
      
      if (learningData && learningData.hasData && learningData.bestTimeWindows && learningData.bestTimeWindows.length > 0) {
          // Adaptive Intelligence Selection
          peakHour = learningData.bestTimeWindows[planArr.length % learningData.bestTimeWindows.length];
          console.log(`[Adaptive Intelligence] Using learned optimum hour: ${peakHour}:00`);
      } else {
          // Feedback Loop: Analyze best posting hour based on overall reach across platforms
          // (Mock heuristic fallback: if total reach is high, post earlier to capture more of the day. If low, stick to evening peaks)
          if (analytics && analytics.length > 0) {
              const totalReach = analytics.reduce((sum, a) => sum + (a.reach || 0), 0);
              if (totalReach > 100) {
                  peakHour = 12; // High reach accounts do well at noon
              } else if (totalReach > 0) {
                  peakHour = 17; // Modest reach, catch early evening
              }
          }
      }

      if (planArr.length === 0) {
          baseDate.setDate(baseDate.getDate() + 1);
          baseDate.setHours(peakHour, 0, 0, 0);
          return baseDate;
      } else {
          // If lastDateRef is provided from the previous post in the array
          const lastPostDate = new Date(planArr[planArr.length - 1].scheduledDate);
          lastPostDate.setDate(lastPostDate.getDate() + 1); // Increment day
          lastPostDate.setHours(peakHour, 0, 0, 0); // Re-align to best peak hour
          return lastPostDate;
      }
  }
}

export const contentEngine = new ContentEngine();
