// ─────────────────────────────────────────────────────────────────
// scoringService.js - Performance Evaluation Engine
// ─────────────────────────────────────────────────────────────────

class ScoringService {
  /**
   * Calculates a holistic performance score out of 100 for a single post.
   * Weighs publish success vs failure, engagement base, and platform specifics.
   */
  calculatePerformanceScore(post) {
    if (!post || !post.status) return 0;
    
    let baseScore = 0;

    // Weight 1: Status (Heaviest Factor)
    if (post.status === 'published' || post.status === 'analyzed') {
      baseScore += 40; // Base points just for successfully publishing
    } else if (post.status === 'failed' || post.status === 'permanently_failed') {
      return 0; // Failures are heavily penalized (score 0 immediately stops them from ranking)
    }

    // Weight 2: Engagement Score
    // Hypothetical engagement points out of 60 possible points. 
    // Normalization logic: Assume "100" mock engagement is very good => 60 points max
    const engScore = post.engagementScore
      || (post.engagementRate ? post.engagementRate * 10 : 0)
      || (post.engagement || 0);
    const engPoints = Math.min((engScore / 100) * 60, 60);
    
    // Total aggregated score (max 100)
    return Math.floor(baseScore + engPoints);
  }
}

export const scoringService = new ScoringService();
