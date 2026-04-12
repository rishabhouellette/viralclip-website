// ─────────────────────────────────────────────────────────────────
// state.js - Centralized State Management
// ─────────────────────────────────────────────────────────────────

class StateManager {
  constructor() {
    this.state = {
      user: null,
      posts: [],
      drafts: [],
      scheduled: [],
      published: [],
      logs: [],
      accounts: [],
      analytics: [],
      createPostState: {
        uploading: false,
        uploadProgress: 0,
        uploadError: null,
        mediaUrl: null,
        mediaType: null
      },
      profile: null
    };
    this.listeners = [];
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners
  notify(actionType, payload) {
    this.listeners.forEach(listener => listener({ type: actionType, payload, state: this.state }));
  }

  // ─── Actions ─── //

  setUser(user) {
    this.state.user = user;
    this.notify('USER_UPDATED', user);
  }

  setProfile(profile) {
    this.state.profile = profile;
    this.notify('PROFILE_UPDATED', profile);
  }

  setPosts(posts) {
    this.state.posts = posts;
    this.state.drafts = posts.filter(p => p.status === 'draft');
    this.state.scheduled = posts.filter(p => p.status === 'scheduled');
    this.state.published = posts.filter(p => p.status === 'published' || p.status === 'ready_to_publish' || p.status === 'analyzed');
    this.notify('POSTS_UPDATED', posts);
  }

  setAccounts(accounts) {
    this.state.accounts = accounts;
    this.notify('ACCOUNTS_UPDATED', accounts);
  }

  setAnalytics(analytics) {
    this.state.analytics = analytics;
    this.notify('ANALYTICS_UPDATED', analytics);
  }

  setLogs(logs) {
    this.state.logs = logs;
    this.notify('LOGS_UPDATED', logs);
  }

  setCreatePostState(newState) {
    this.state.createPostState = {
      ...this.state.createPostState,
      ...newState
    };
    this.notify('CREATE_POST_UPDATED', this.state.createPostState);
  }

  // ─── Getters ─── //

  getState() {
    return this.state;
  }
}

export const appState = new StateManager();
