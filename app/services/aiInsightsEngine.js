// ─────────────────────────────────────────────────────────────────
// services/aiInsightsEngine.js — Mock performance insights
// ─────────────────────────────────────────────────────────────────

const INSIGHT_POOL = [
  { icon: '📉', text: 'Your last 3 posts underperformed — try a stronger hook' },
  { icon: '⏰', text: 'Best time to post: next 2 hours (7–9 PM)' },
  { icon: '✂️', text: 'Try shorter hooks (3–5 words) for better retention' },
  { icon: '🔥', text: 'Trending in your niche: "AI productivity hacks"' },
  { icon: '📊', text: 'Videos under 45s are getting 2x more reach this week' },
  { icon: '🎯', text: 'Your audience engages most with "how-to" content' },
  { icon: '📱', text: 'TikTok is outperforming Instagram for your niche right now' },
  { icon: '💡', text: 'Add a CTA in the last 3 seconds to boost comments' },
];

class AiInsightsEngine {
  /**
   * Get 3 relevant insights for the sidebar.
   * @returns {{ insights: Array<{ icon: string, text: string }> }}
   */
  getInsights() {
    // Pick 3 random, non-repeating insights
    const shuffled = [...INSIGHT_POOL].sort(() => 0.5 - Math.random());
    return {
      insights: shuffled.slice(0, 3),
    };
  }
}

export const aiInsightsEngine = new AiInsightsEngine();
