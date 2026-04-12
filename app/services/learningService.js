// ─────────────────────────────────────────────────────────────────
// learningService.js - Adaptive Intelligence Layer
// ─────────────────────────────────────────────────────────────────

import { scoringService } from './scoringService.js';
import { getAllPosts } from './firestoreService.js';

class LearningService {
  
  /**
   * Main intelligence aggregation function. Analyzes user history.
   * Pulls published posts and extracts scored behavioral distributions.
   */
  async learnFromHistory(userId) {
    if (!userId) return null;

    try {
      // Pull historical execution corpus (all posts including scheduled/draft/published)
      const allPosts = await getAllPosts(userId);
      
      // Filter strictly to historical records with a scheduled/published time logic
      const historicalPosts = allPosts.filter(p => p.status === 'published' || p.status === 'analyzed' || p.status === 'permanently_failed');

      if (historicalPosts.length === 0) {
        return {
          hasData: false,
          rankedPlatforms: [],
          bestTimeWindows: []
        };
      }

      // 1. Assign Performance Scores
      const scoredPosts = historicalPosts.map(post => ({
          ...post,
          adaptScore: scoringService.calculatePerformanceScore(post)
      }));

      // 2. Perform dimensional analysis
      const rankedPlatforms = this.rankPlatforms(scoredPosts);
      const bestTimeWindows = this.generateBestTimeSlots(scoredPosts);

      return {
        hasData: true,
        rankedPlatforms,
        bestTimeWindows,
        postCount: historicalPosts.length
      };

    } catch (error) {
       console.error("Learning Service Error:", error);
       return null;
    }
  }

  /**
   * Groups post adaptScores by platform and sorts highest to lowest.
   */
  rankPlatforms(scoredPosts) {
      const platformTotals = {};
      const platformCounts = {};

      scoredPosts.forEach(post => {
          // Some posts might have arrays in platforms, or singular strings depending on structure
          const platformsArr = Array.isArray(post.platforms) ? post.platforms : [post.platforms || 'instagram'];
          
          platformsArr.forEach(platform => {
              if (!platformTotals[platform]) {
                  platformTotals[platform] = 0;
                  platformCounts[platform] = 0;
              }
              platformTotals[platform] += post.adaptScore;
              platformCounts[platform] += 1;
          });
      });

      // Calculate averages
      const averages = Object.keys(platformTotals).map(platform => ({
          platform,
          avgScore: platformTotals[platform] / platformCounts[platform],
          successCount: platformCounts[platform]
      }));

      // Rank by avgScore descending
      averages.sort((a, b) => b.avgScore - a.avgScore);

      return averages.map(a => a.platform);
  }

  /**
   * Groups post adaptScores by hour of the day (scheduledAt or publishedAt) 
   * and returns top 3-5 performing hour blocks.
   */
  generateBestTimeSlots(scoredPosts) {
      const hourTotals = {};
      const hourCounts = {};

      scoredPosts.forEach(post => {
          // Extract Date
          let dateRef = post.publishedAt || post.scheduledAt;
          if (!dateRef) return;
          
          let dateStr;
          if (typeof dateRef.toDate === 'function') {
              dateStr = dateRef.toDate();
          } else {
              dateStr = new Date(dateRef);
          }
          
          const hour = dateStr.getHours();

          if (!hourTotals[hour]) {
              hourTotals[hour] = 0;
              hourCounts[hour] = 0;
          }
          
          hourTotals[hour] += post.adaptScore;
          hourCounts[hour] += 1;
      });

      // Calculate averages
      const hourAverages = Object.keys(hourTotals).map(hour => ({
          hour: parseInt(hour),
          avgScore: hourTotals[hour] / hourCounts[hour]
      }));

      // Sort descending by highest score
      hourAverages.sort((a, b) => b.avgScore - a.avgScore);

      // Return top 3 maximum, filtering out highly poorly performing hours optionally
      const topWindows = hourAverages.slice(0, 3).map(h => h.hour);

      return topWindows;
  }
}

export const learningService = new LearningService();
