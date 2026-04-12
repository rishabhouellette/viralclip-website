// ─────────────────────────────────────────────────────────────────
// analyticsService.js - Analytics Ingestion Pipeline Simulation
// ─────────────────────────────────────────────────────────────────

import { db, Timestamp } from '../js/firebase.js';
import { appState } from '../js/state.js';
import { doc, setDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

class AnalyticsService {
  constructor() {
    this.intervalId = null;
    this.intervalMs = 5 * 60 * 1000; // 5 minutes
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.simulateIngestion(), this.intervalMs);
    
    // Fire off an initial sync after a short delay
    setTimeout(() => this.simulateIngestion(), 10000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async simulateIngestion() {
    const user = appState.getState().user;
    if (!user) return;

    try {
      const accounts = appState.getState().accounts;
      if (!accounts || accounts.length === 0) return;

      for (const account of accounts) {
        if (!account.platform) continue;
        
        const analyticsRef = doc(db, 'users', user.uid, 'analytics', account.platform);
        
        // Simulating incoming metrics from external API
        await setDoc(analyticsRef, {
          platform: account.platform,
          reach: increment(Math.floor(Math.random() * 50)),
          engagement: increment(Math.floor(Math.random() * 10)),
          followers: increment(Math.floor(Math.random() * 5)),
          updatedAt: Timestamp.now()
        }, { merge: true }).catch(() => {
          // Silent catch for simulated ingestion bounds
        });
      }
      console.log('Analytics simulated ingestion complete.');
    } catch (error) {
      console.error('Analytics ingestion failed:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
