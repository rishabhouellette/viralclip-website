// ─────────────────────────────────────────────────────────────────
// router.js - Simple client-side router
// ─────────────────────────────────────────────────────────────────

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  async navigate(path) {
    // Remove hash and leading slash
    const cleanPath = path.replace(/^#\//, '').split('?')[0] || 'dashboard';

    // Check if route exists
    if (!this.routes[cleanPath]) {
      console.warn(`Route not found: ${cleanPath}`);
      this.showView('dashboard');
      return;
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    // Show requested view
    this.showView(cleanPath);

    // Call route handler if it exists
    if (this.routes[cleanPath]) {
      try {
        await this.routes[cleanPath]();
      } catch (err) {
        console.error(`Error in route handler for ${cleanPath}:`, err);
      }
    }

    // Update active nav item (sidebar)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === cleanPath) {
        item.classList.add('active');
      }
    });

    // Update active topbar nav tab
    document.querySelectorAll('.topbar-nav-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.view === cleanPath) {
        tab.classList.add('active');
      }
    });

    this.currentView = cleanPath;
  }

  showView(viewName) {
    const container = document.getElementById("main-content");

    if (!container) {
      console.error("Main content container missing");
      return;
    }

    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) {
      viewElement.classList.add('active');
    } else {
      const fallback = document.createElement('p');
      fallback.textContent = "View failed to load";
      container.innerHTML = "";
      container.appendChild(fallback);
    }
  }

  renderCurrentView() {
    if (this.currentView && this.routes[this.currentView]) {
      this.routes[this.currentView]();
    }
  }

  init() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash);
    });

    // Initial route
    const hash = window.location.hash || '#/dashboard';
    this.navigate(hash);
  }
}

export const router = new Router();
