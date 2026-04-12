// ─────────────────────────────────────────────────────────────────
// trendService.js - Viral Trend Monitoring System
// ─────────────────────────────────────────────────────────────────

class TrendService {
  constructor() {
    this.niche = "tech"; // Default mock niche
  }

  /**
   * Fetches mock trending topics, audio formats, and hashtags.
   */
  async getTrendingTopics() {
    // Simulating external TikTok / Twitter trends API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: 1,
        topic: "AI Agents taking over workflows",
        volume: "1.2M",
        type: "concept",
        trendDirection: "up"
      },
      {
        id: 2,
        topic: "Pedro Pedro Pedro",
        volume: "850K",
        type: "audio",
        trendDirection: "peaking"
      },
      {
        id: 3,
        topic: "Day in the life of a software engineer",
        volume: "400K",
        type: "format",
        trendDirection: "stable"
      },
      {
        id: 4,
        topic: "Devin AI vs Human Developer",
        volume: "2.1M",
        type: "concept",
        trendDirection: "up"
      }
    ];
  }
}

export const trendService = new TrendService();
