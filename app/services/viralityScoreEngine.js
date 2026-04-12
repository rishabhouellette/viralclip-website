// ─────────────────────────────────────────────────────────────────
// services/viralityScoreEngine.js — Mock clip virality scoring
// ─────────────────────────────────────────────────────────────────

class ViralityScoreEngine {
  /**
   * Score a clip for virality potential.
   * @param {Object} clip — { title, start, end, thumbnailUrl, ... }
   * @returns {{ score: number, hook_strength: string, trend: string, suggestions: string[] }}
   */
  scoreClip(clip) {
    // Deterministic-ish score based on title hash so it stays stable per clip
    const hash = this._simpleHash(clip.title || '');
    const score = 55 + (hash % 40); // 55–94

    const hook_strength = score >= 75 ? 'Strong' : score >= 60 ? 'Moderate' : 'Weak';
    const trend = score >= 65 ? '↑' : '↓';

    const suggestions = [];
    if (hook_strength !== 'Strong') suggestions.push('Use a question or bold claim in first 3 words');
    if (score < 70) suggestions.push('Add a pattern interrupt in the first 2 seconds');
    if (score < 80) suggestions.push('Keep total duration under 60 seconds for better retention');

    return { score, hook_strength, trend, suggestions };
  }

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const viralityScoreEngine = new ViralityScoreEngine();
