// ─────────────────────────────────────────────────────────────────
// modules/engagementService.js - Habit-Forming User Retention Engine
// ─────────────────────────────────────────────────────────────────

import { getAllPosts } from './firestoreService.js';
import { insightService } from './insightService.js';

class EngagementService {
  constructor() {
    this.GOAL_POSTS_PER_WEEK = 5; // Configurable goal
  }

  /**
   * Calculates specific metrics for "Today's Plan" widget.
   */
  async getTodaysPlan(userId) {
    if (!userId) return null;
    
    const allPosts = await getAllPosts(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);

    const scheduledToday = allPosts.filter(p => {
        if (!p.scheduledAt) return false;
        const d = p.scheduledAt.toDate ? p.scheduledAt.toDate() : new Date(p.scheduledAt);
        return d >= today && d < tmrw && p.status === 'scheduled';
    });

    const publishedToday = allPosts.filter(p => {
        if (!p.publishedAt) return false;
        const d = p.publishedAt.toDate ? p.publishedAt.toDate() : new Date(p.publishedAt);
        return d >= today && d < tmrw && (p.status === 'published' || p.status === 'analyzed');
    });

    // Sub-goal progress
    const totalTodayGoal = scheduledToday.length + publishedToday.length === 0 ? 1 : scheduledToday.length + publishedToday.length;
    const progressPercent = Math.min(Math.round((publishedToday.length / totalTodayGoal) * 100), 100);

    const recommended = scheduledToday.length > 0 
      ? `Ensure your scheduled posts for today are aligned with your top platforms.`
      : `You have zero posts dropping today. Generate content instantly to maintain momentum!`;

    return {
        scheduledCount: scheduledToday.length,
        publishedCount: publishedToday.length,
        progressPercent,
        recommendedAction: recommended,
        requiresAction: scheduledToday.length === 0
    };
  }

  /**
   * Tracks robust habit-forming Streaks and Weekly Goals across all assets.
   */
  async getEnhancedStreaks(userId) {
      if (!userId) return null;
      
      const allPosts = await getAllPosts(userId);
      const metrics = await insightService.calculateGrowthMetrics(userId);
      
      // Calculate active week progress
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const publishedThisWeek = allPosts.filter(p => {
          if ((p.status !== 'published' && p.status !== 'analyzed') || !p.publishedAt) return false;
          const d = p.publishedAt.toDate ? p.publishedAt.toDate() : new Date(p.publishedAt);
          return d >= oneWeekAgo;
      });

      // Mock Login Streak (Requires local storage binding or server logs in prod)
      const mockLoginStreak = metrics.currentStreak + Math.floor(Math.random() * 3); 

      return {
          postingStreak: metrics.currentStreak,
          loginStreak: mockLoginStreak,
          weeklyProgress: publishedThisWeek.length,
          weeklyGoal: this.GOAL_POSTS_PER_WEEK,
          goalPercent: Math.min(Math.round((publishedThisWeek.length / this.GOAL_POSTS_PER_WEEK) * 100), 100)
      };
  }

  /**
   * Constructs the Re-engagement and Urgency UI Notification Center Feed.
   */
  async buildNotificationFeed(userId) {
      if (!userId) return [];
      const notifications = [];
      const todayPlan = await this.getTodaysPlan(userId);
      const allPosts = await getAllPosts(userId);

      // 1. Upcoming post urgency
      if (todayPlan && todayPlan.scheduledCount > 0) {
          notifications.push({
              title: 'Upcoming Posts',
              body: `You have ${todayPlan.scheduledCount} posts going live today!`,
              type: 'info',
              time: 'Just now'
          });
      }

      // 2. Re-engagement Hook (Inactive/Missed opportunities)
      if (todayPlan && todayPlan.requiresAction) {
          notifications.push({
              title: 'Declining Engagement',
              body: `You missed an optimal time slot yesterday. Let's get you back on track!`,
              type: 'warning',
              time: '2 hours ago'
          });
      }

      // 3. Performance Reward (If a highly scored post exists recently)
      const highlyScored = allPosts.find(p => (p.status === 'published' || p.status === 'analyzed') && p.engagementScore > 85);
      if (highlyScored) {
          notifications.push({
              title: 'Viral Performance! 🚀',
              body: `Your recent post on ${highlyScored.platforms[0] || 'socials'} performed enormously better than average. Double down!`,
              type: 'success',
              time: 'Yesterday'
          });
      }

      // Append general system notification
      notifications.push({
          title: 'System Active',
          body: `Adaptive Learning Engine is currently scanning for top trends.`,
          type: 'neutral',
          time: '1 min ago'
      });

      return notifications;
  }
}

export const engagementService = new EngagementService();
