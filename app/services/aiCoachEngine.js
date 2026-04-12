// ─────────────────────────────────────────────────────────────────
// services/aiCoachEngine.js — Mock AI Coach suggestion generator
// ─────────────────────────────────────────────────────────────────

const TOPICS = [
  { topic: "Nobody tells this about trading…", niche: "Finance", trend_pct: 32 },
  { topic: "3 habits that changed my life forever", niche: "Self-improvement", trend_pct: 45 },
  { topic: "Why 90% of people fail at fitness", niche: "Fitness", trend_pct: 28 },
  { topic: "The truth about making money online", niche: "Business", trend_pct: 51 },
  { topic: "Stop doing this if you want to grow", niche: "Growth", trend_pct: 38 },
  { topic: "How I went from 0 to 100K followers", niche: "Social Media", trend_pct: 62 },
  { topic: "This morning routine changed everything", niche: "Productivity", trend_pct: 41 },
  { topic: "The AI tool nobody is talking about", niche: "Tech", trend_pct: 73 },
];

const HOOKS = [
  "\"Nobody tells this about trading…\"",
  "\"Stop scrolling — you need to hear this.\"",
  "\"I wish I knew this 5 years ago.\"",
  "\"This one change doubled my income.\"",
  "\"The #1 mistake killing your growth.\"",
  "\"Here's what actually works in 2025.\"",
  "\"You're doing it wrong. Here's why.\"",
  "\"3 seconds to change your perspective.\"",
];

const BEST_TIMES = [
  "7:30 PM", "8:00 PM", "6:00 PM", "12:30 PM",
  "9:00 AM", "7:00 PM", "5:30 PM", "1:00 PM"
];

class AiCoachEngine {
  /**
   * Generate a fresh AI Coach suggestion with mock data.
   * @returns {{ topic: string, hook: string, niche: string, trend_pct: number, best_time: string, virality_score: number }}
   */
  generateSuggestion() {
    const pick = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const hook = HOOKS[Math.floor(Math.random() * HOOKS.length)];
    const best_time = BEST_TIMES[Math.floor(Math.random() * BEST_TIMES.length)];
    const virality_score = Math.floor(Math.random() * 30) + 60; // 60-89

    return {
      topic: pick.topic,
      hook,
      niche: pick.niche,
      trend_pct: pick.trend_pct,
      best_time,
      virality_score,
    };
  }
}

export const aiCoachEngine = new AiCoachEngine();
