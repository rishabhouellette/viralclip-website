// ─────────────────────────────────────────────────────────────────
// schedulerService.js - Background scheduler engine
// ─────────────────────────────────────────────────────────────────

import { appState } from '../js/state.js';
import { updatePost } from './firestoreService.js';
import { showToast } from '../js/app.js';

class SchedulerService {
  constructor() {
    this.intervalId = null;
    this.intervalMs = 60000; // Check every 60 seconds
    this.isProd = true; // Set to true to rely on Cloud functions instead
  }

  start() {
    if (this.isProd) {
      console.log("Client-side scheduler disabled in production. Cloud Function handles scheduling.");
      return;
    }
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.checkScheduledPosts(), this.intervalMs);
    // Initial check right away
    this.checkScheduledPosts();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkScheduledPosts() {
    const user = appState.getState().user;
    if (!user) return;

    const scheduledPosts = appState.getState().scheduled;
    if (!scheduledPosts || scheduledPosts.length === 0) return;

    const now = new Date();

    for (const post of scheduledPosts) {
      if (post.status === 'scheduled' && post.scheduledAt) {
        let postDate;
        if (post.scheduledAt.toDate) {
          postDate = post.scheduledAt.toDate();
        } else {
          postDate = new Date(post.scheduledAt); // Handle string representation just in case
        }

        if (postDate <= now) {
          try {
            await updatePost(user.uid, post.id, { status: 'ready_to_publish' });
            showToast(`Post scheduled for ${postDate.toLocaleTimeString()} is now ready to publish!`, 'success');
          } catch (error) {
            console.error(`Failed to update status for post ${post.id}:`, error);
          }
        }
      }
    }
  }
}

export const schedulerService = new SchedulerService();
