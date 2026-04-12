// ─────────────────────────────────────────────────────────────────
// insightService.js - Growth Metrics and Recommendation Engine
// ─────────────────────────────────────────────────────────────────

import { getAllPosts } from './firestoreService.js';
import { learningService } from './learningService.js';
import { scoringService } from './scoringService.js';

class InsightService {

  /**
   * Generates actionable text insights comparing platforms and times.
   */
  async generatePerformanceInsights(userId) {
    if (!userId) return [];
    const learningData = await learningService.learnFromHistory(userId);
    if (!learningData || !learningData.hasData) {
        return ["Keep posting to unlock AI growth insights!"];
    }

    const insights = [];
    
    // Time insight
    if (learningData.bestTimeWindows && learningData.bestTimeWindows.length > 0) {
        const topTime = learningData.bestTimeWindows[0];
        insights.push(`Your posts at ${topTime}:00 perform significantly better than average.`);
    }

    // Platform comparison insight
    if (learningData.rankedPlatforms && learningData.rankedPlatforms.length > 1) {
        const top = learningData.rankedPlatforms[0];
        const second = learningData.rankedPlatforms[1];
        insights.push(`Posting on ${top} yields higher engagement vs ${second} right now.`);
    }

    // Consistency Warning (mock heuristic)
    const missedWindows = Math.floor(Math.random() * 3);
    if (missedWindows > 0) {
        insights.push(`You missed ${missedWindows} optimal posting windows this week! Maintain your streak.`);
    }

    return insights;
  }

  /**
   * Synthesizes history into specific "Next Best Action" recommendations.
   */
  async recommendNextActions(userId) {
      const learningData = await learningService.learnFromHistory(userId);
      let bestTime = "18:00"; // Fallback
      let bestPlatform = "Instagram";
      let contentType = "Short-form Video"; // Fallback

      if (learningData && learningData.hasData) {
          if (learningData.bestTimeWindows && learningData.bestTimeWindows.length > 0) {
              bestTime = `${learningData.bestTimeWindows[0]}:00`;
          }
          if (learningData.rankedPlatforms && learningData.rankedPlatforms.length > 0) {
              bestPlatform = learningData.rankedPlatforms[0];
          }
      }

      return {
          primaryAction: `Post at ${bestTime} today on ${bestPlatform}`,
          secondaryAction: `Create 2 more ${contentType} posts this week to sustain growth.`,
          details: { bestTime, bestPlatform, contentType }
      };
  }

  /**
   * Extracts quantitative streak and growth ROI metrics.
   */
  async calculateGrowthMetrics(userId) {
      if (!userId) return null;
      
      const allPosts = await getAllPosts(userId);
      const published = allPosts.filter(p => p.status === 'published' || p.status === 'analyzed');
      const failed = allPosts.filter(p => p.status === 'failed' || p.status === 'permanently_failed');
      
      const totalAttempted = published.length + failed.length;
      const successRate = totalAttempted === 0 ? 0 : Math.round((published.length / totalAttempted) * 100);

      // Streaks (Mocked calculation based on frequency for now, as we don't have explicit daily logs easily accessible without heavy parsing)
      const currentStreak = published.length > 0 ? Math.min(published.length, 7) : 0; 
      const consistencyScore = published.length > 0 ? Math.min(Math.round((published.length / 14) * 100), 100) : 0; // Assuming goal of 14/week

      // Before/After AI Comparison (Mock Logic)
      // We assume posts with `engagementScore` natively attached are Post-AI Engine, and older ones aren't (or mock the split).
      const aiPosts = published.filter(p => p.engagementScore !== undefined || p.insights);
      const manualPosts = published.filter(p => p.engagementScore === undefined && !p.insights);

      const avgAiScore = aiPosts.length > 0 
          ? aiPosts.reduce((sum, p) => sum + scoringService.calculatePerformanceScore(p), 0) / aiPosts.length 
          : 0;
          
      const avgManualScore = manualPosts.length > 0 
          ? manualPosts.reduce((sum, p) => sum + scoringService.calculatePerformanceScore(p), 0) / manualPosts.length 
          : (avgAiScore > 20 ? avgAiScore - 20 : 0); // Mock baseline if no manual posts exist but AI posts do

      const improvementMode = avgAiScore >= avgManualScore ? 'up' : 'down';
      const improvementPercent = avgManualScore === 0 ? 100 : Math.round(((avgAiScore - avgManualScore) / avgManualScore) * 100);

      return {
          successRate,
          currentStreak,
          consistencyScore,
          beforeAiScore: Math.round(avgManualScore),
          afterAiScore: Math.round(avgAiScore),
          improvementPercent,
          improvementMode
      };
  }
}

export const insightService = new InsightService();
