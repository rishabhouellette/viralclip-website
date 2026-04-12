// ─────────────────────────────────────────────────────────────────
// modules/onboarding.js - User Activation & First-Time Flow
// ─────────────────────────────────────────────────────────────────

import { appState } from '../js/state.js';
import { contentEngine } from '../services/contentEngine.js';
import { createPost, updateAnalytics, updateUserProfile } from '../services/firestoreService.js';
import { showToast } from '../js/app.js';
import { Timestamp } from '../js/firebase.js';

export class OnboardingModule {
  constructor() {
    this.modalId = 'onboardingWizardModal';
    this.hasShownThisSession = false;
  }

  getStorageKey(userId) {
    return userId ? `onboardingComplete:${userId}` : 'onboardingComplete';
  }

  isLocalOnboardingComplete(userId) {
    if (!userId) return false;
    return localStorage.getItem(this.getStorageKey(userId)) === 'true';
  }

  markLocalOnboardingComplete(userId) {
    if (!userId) return;
    localStorage.setItem(this.getStorageKey(userId), 'true');
    localStorage.removeItem('onboardingComplete');
  }

  checkAndTriggerOnboarding() {
    if (this.hasShownThisSession) return false;
    
    const state = appState.getState();
    if (!state.user || !state.profile) return false;
    const localStorageKey = this.getStorageKey(state.user.uid);
    const legacyCompletionFlag = localStorage.getItem('onboardingComplete');

    const hasCompletedOnboarding = state.profile.hasCompletedOnboarding;
    
    // Step 10: Debug (MANDATORY)
    console.log("User onboarding status:", hasCompletedOnboarding);
    console.log("Onboarding status (Local):", localStorage.getItem(localStorageKey));

    if (hasCompletedOnboarding === true) {
        this.markLocalOnboardingComplete(state.user.uid);
        return false;
    }

    // Check if user has already permanently triggered/dismissed it on this device
    // Step 7: Block Repeat Modal
    if (this.isLocalOnboardingComplete(state.user.uid)) {
        console.log("Onboarding skipped: Found in localStorage");
        return false;
    }

    if (legacyCompletionFlag === 'true') {
        localStorage.removeItem('onboardingComplete');
    }
    
    // Check Firestore state
    if (hasCompletedOnboarding === false && !document.getElementById(this.modalId)) {
       console.log("Triggering onboarding modal...");
       this.showWizard();
       this.hasShownThisSession = true;
       return true;
    }

    // Step 9: Cleanup legacy localStorage logic if it exists
    localStorage.removeItem('viralclip_wizard_seen_' + state.user.uid);

    return false;
  }

  showWizard() {
    if (document.getElementById(this.modalId)) return;

    const modalHtml = `
      <div id="${this.modalId}" class="modal onboarding-modal active">
        <div class="modal-content onboarding-panel">
          
          <div class="onboarding-emoji">🚀</div>
          <h2 class="onboarding-title">Welcome to ViralClip</h2>
          <p class="onboarding-copy">Let's generate your first week of strictly optimized content in under 60 seconds.</p>

          <form id="wizardForm" class="onboarding-form">
            <div class="form-group">
              <label class="onboarding-label">What is your niche?</label>
              <input type="text" id="wizardNiche" class="onboarding-input" placeholder="e.g. Finance, Tech, Fitness" required />
            </div>

            <div class="form-group">
              <label class="onboarding-label">Target Platforms</label>
              <div class="onboarding-platform-row">
                <label data-platform="tiktok" class="platform-select-btn active">
                  <input type="checkbox" name="platforms" value="tiktok" checked class="hidden" /> TikTok
                </label>
                <label data-platform="instagram" class="platform-select-btn">
                  <input type="checkbox" name="platforms" value="instagram" class="hidden" /> Insta
                </label>
                <label data-platform="youtube" class="platform-select-btn">
                  <input type="checkbox" name="platforms" value="youtube" class="hidden" /> YouTube
                </label>
              </div>
            </div>

            <button type="submit" id="wizardSubmitBtn" class="btn btn-primary primary-btn onboarding-submit-btn">
              ✨ Generate My First Week
            </button>
          </form>

          <div class="onboarding-demo-section">
            <button id="wizardDemoBtn" class="onboarding-demo-btn">
              Or Try Demo Mode (Pre-load Analytics & History)
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Step 4: Toggle platforms
    document.querySelectorAll('.platform-select-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const checkbox = btn.querySelector('input');
            checkbox.checked = !checkbox.checked;
            btn.classList.toggle('active', checkbox.checked);
        });
    });

    document.getElementById('wizardForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const niche = document.getElementById('wizardNiche').value.trim();
        const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.value);

        // Step 4: Validation
        if (!niche) {
            showToast("Please enter your niche", "error");
            return;
        }
        if (selectedPlatforms.length === 0) {
            showToast("Please select at least one platform", "error");
            return;
        }

        const btn = document.getElementById('wizardSubmitBtn');
        btn.innerHTML = '<span class="spinner spinner-sm"></span> System is thinking...';
        btn.disabled = true;

        try {
            const user = appState.getState().user;
            
            // Step 5: Save Data (CRITICAL)
            await updateUserProfile(user.uid, { 
                hasCompletedOnboarding: true,
                niche: niche,
                platforms: selectedPlatforms
            });

            appState.setProfile({
                ...(appState.getState().profile || {}),
                hasCompletedOnboarding: true,
                niche,
                platforms: selectedPlatforms
            });

            // Step 6: Local Fallback
            this.markLocalOnboardingComplete(user.uid);
            this.hasShownThisSession = true;

            await contentEngine.autoGenerateAndSchedule(user.uid, niche, 7);
            
            document.getElementById(this.modalId).remove();
            showToast("Success! Your dashboard is now populated.", "success");
            
            // Re-render dashboard to reflect changes
            import('../modules/dashboard.js').then(({ dashboardModule }) => {
                dashboardModule.render();
            });

            // Mark tooltips dynamically on the dashboard DOM
            setTimeout(() => this.injectGuidedHints(), 1000);
        } catch (err) {
            showToast("Failed to generate: " + err.message, "error");
            btn.innerHTML = '✨ Generate My First Week';
            btn.disabled = false;
        }
    });

    document.getElementById('wizardDemoBtn').addEventListener('click', async () => {
        const btn = document.getElementById('wizardDemoBtn');
        btn.innerText = "Loading massive dataset...";
        document.getElementById('wizardSubmitBtn').disabled = true;
        
        try {
            await this.loadDemoData();
            
            const user = appState.getState().user;
            // Step 5-6: Save Data & Local Fallback
            await updateUserProfile(user.uid, { 
                hasCompletedOnboarding: true,
                niche: "General",
                platforms: ["tiktok", "instagram"]
            });
            appState.setProfile({
                ...(appState.getState().profile || {}),
                hasCompletedOnboarding: true,
                niche: "General",
                platforms: ["tiktok", "instagram"]
            });
            this.markLocalOnboardingComplete(user.uid);

            // Mark as shown so onboarding never re-fires this session
            this.hasShownThisSession = true;

            // Dismiss the modal cleanly
            const modal = document.getElementById(this.modalId);
            if (modal) modal.remove();

            showToast("Demo environment loaded! ✨", "success");

            // Re-render the dashboard in-place without a page reload.
            // The Firestore subscription will pick up the new posts automatically,
            // but we also trigger a manual render to be instant.
            setTimeout(() => {
                import('../modules/dashboard.js').then(({ dashboardModule }) => {
                    dashboardModule.renderOverview();
                    dashboardModule.renderGrowthWidgets();
                }).catch(() => window.location.reload());
            }, 800);
        } catch(e) {
            showToast("Demo load failed: " + e.message, "error");
            btn.innerText = "Or Try Demo Mode (Pre-load Analytics & History)";
            document.getElementById('wizardSubmitBtn').disabled = false;
        }
    });
  }

  injectGuidedHints() {
      // Small pulse animations for newly generated items
      const firstPost = document.querySelector('.post-card');
      if (firstPost) {
          firstPost.classList.add('guided-highlight', 'guided-highlight-primary');
          firstPost.insertAdjacentHTML('beforebegin', '<div class="guided-hint-text">📍 These posts were auto-generated & scheduled optimally for you</div>');
      }

      const actionCard = document.querySelector('#growthActionSection .analytics-card');
      if (actionCard) {
          actionCard.classList.add('guided-highlight', 'guided-highlight-success');
          actionCard.insertAdjacentHTML('afterbegin', '<div class="guided-insight-badge">New Insight</div>');
      }
  }

  async loadDemoData() {
      const user = appState.getState().user;
      if (!user) throw new Error("No user");

      // Mock Analytics
      const platforms = ['instagram', 'tiktok', 'youtube'];
      for (const platform of platforms) {
          await updateAnalytics(user.uid, platform, {
              reach: Math.floor(Math.random() * 50000) + 10000,
              engagement: Math.floor(Math.random() * 5000) + 500,
              engagementRate: (Math.random() * 10) + 2,
              followers: Math.floor(Math.random() * 20000) + 1000,
              growthRate: (Math.random() * 5) + 1
          });
      }

      // Mock Historical Posts for Growth System Context
      for (let i = 0; i < 15; i++) {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - (15 - i));
          pastDate.setHours(Math.floor(Math.random() * 10) + 9, 0, 0, 0); // Random hour 9am - 6pm

          const mockScore = Math.floor(Math.random() * 60) + 30; // 30-90
          await createPost(user.uid, {
              caption: `Past post #${i+1} analyzing trends for Growth Metrics...`,
              platforms: i % 2 === 0 ? ['tiktok'] : ['instagram'],
              status: 'published',
              scheduledAt: Timestamp.fromDate(pastDate),
              publishedAt: Timestamp.fromDate(pastDate),
              engagementScore: mockScore, // Artificial AI tracker
              reach: Math.floor(mockScore * 100),
              engagement: Math.floor(mockScore * 10)
          });
      }
  }

  renderEmptyState() {
      // Replaces the standard empty dashboard with a high-conversion CTA
      return `
        <div class="empty-dashboard-state">
            <div class="empty-dashboard-state-icon">👋</div>
            <h2 class="empty-dashboard-state-title">Your Command Center is Empty</h2>
            <p class="empty-dashboard-state-copy">
               The fastest way to grow your **${appState.getState().profile?.niche || 'brand'}** is to let our AI Engine map out your first week of strictly optimized viral content instantly.
            </p>
            <button onclick="document.dispatchEvent(new CustomEvent('TRIGGER_WIZARD'))" class="btn btn-primary primary-btn empty-dashboard-state-btn">
               ✨ Initialize Auto-Wizard
            </button>
        </div>
      `;
  }
}

export const onboardingModule = new OnboardingModule();

// Global hook for empty state buttons
document.addEventListener('TRIGGER_WIZARD', () => {
    onboardingModule.showWizard();
});
