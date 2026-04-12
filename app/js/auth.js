// ─────────────────────────────────────────────────────────────────
// auth.js - Authentication utilities and UI management
// ─────────────────────────────────────────────────────────────────

import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  initAuthStateListener, 
  getCurrentUser,
  signInWithGoogle,
  signInWithFacebook,
  signInWithTwitter,
  checkRedirectResult
} from '../services/authService.js';

export class AuthManager {
  constructor() {
    this.boundEvents = new WeakMap();
    this.authStateBound = false;
    this.setupAuthElements();
    this.setupAuthListeners();
    this.initAuthStateListener();
    // Check for redirect result (fallback when popup is blocked)
    checkRedirectResult().catch(e => console.warn('Redirect check:', e));
  }

  addListenerOnce(element, eventName, handler, key = eventName) {
    if (!element) return;

    let eventKeys = this.boundEvents.get(element);
    if (!eventKeys) {
      eventKeys = new Set();
      this.boundEvents.set(element, eventKeys);
    }

    const listenerKey = `${eventName}:${key}`;
    if (eventKeys.has(listenerKey)) return;

    element.addEventListener(eventName, handler);
    eventKeys.add(listenerKey);
  }

  setupAuthElements() {
    this.authModal = document.getElementById('authModal');
    this.loginForm = document.getElementById('loginForm');
    this.signupForm = document.getElementById('signupForm');
    this.loginEmail = document.getElementById('loginEmail');
    this.loginPassword = document.getElementById('loginPassword');
    this.loginBtn = document.getElementById('loginBtn');
    this.signupName = document.getElementById('signupName');
    this.signupEmail = document.getElementById('signupEmail');
    this.signupPassword = document.getElementById('signupPassword');
    this.signupConfirmPassword = document.getElementById('signupConfirmPassword');
    this.signupBtn = document.getElementById('signupBtn');
    this.switchToSignupBtn = document.getElementById('switchToSignupBtn');
    this.switchToLoginBtn = document.getElementById('switchToLoginBtn');
    this.authError = document.getElementById('authError');
    this.sidebar = document.getElementById('sidebar');
    this.mainContent = document.querySelector('.main-content');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.userAvatar = document.getElementById('userAvatar');
    this.userName = document.getElementById('userName');
    
    // Social auth buttons
    this.googleLoginBtn = document.getElementById('googleLoginBtn');
    this.facebookLoginBtn = document.getElementById('facebookLoginBtn');
    this.twitterLoginBtn = document.getElementById('twitterLoginBtn');
    this.googleSignupBtn = document.getElementById('googleSignupBtn');
    this.facebookSignupBtn = document.getElementById('facebookSignupBtn');
    this.twitterSignupBtn = document.getElementById('twitterSignupBtn');
  }

  setupAuthListeners() {
    this.addListenerOnce(this.loginBtn, 'click', e => this.handleLogin(e), 'login');
    this.addListenerOnce(this.signupBtn, 'click', e => this.handleSignup(e), 'signup');
    this.addListenerOnce(this.switchToSignupBtn, 'click', () => this.showSignupForm(), 'switch-signup');
    this.addListenerOnce(this.switchToLoginBtn, 'click', () => this.showLoginForm(), 'switch-login');
    this.addListenerOnce(this.logoutBtn, 'click', () => this.handleLogout(), 'logout');
    
    // Social auth buttons - Login
    this.addListenerOnce(this.googleLoginBtn, 'click', e => this.handleSocialLogin('google', e), 'google-login');
    this.addListenerOnce(this.facebookLoginBtn, 'click', e => this.handleSocialLogin('facebook', e), 'facebook-login');
    this.addListenerOnce(this.twitterLoginBtn, 'click', e => this.handleSocialLogin('twitter', e), 'twitter-login');
    
    // Social auth buttons - Signup (same functionality)
    this.addListenerOnce(this.googleSignupBtn, 'click', e => this.handleSocialLogin('google', e), 'google-signup');
    this.addListenerOnce(this.facebookSignupBtn, 'click', e => this.handleSocialLogin('facebook', e), 'facebook-signup');
    this.addListenerOnce(this.twitterSignupBtn, 'click', e => this.handleSocialLogin('twitter', e), 'twitter-signup');

    // Enter key support
    this.addListenerOnce(this.loginEmail, 'keypress', e => {
      if (e.key === 'Enter') this.handleLogin(e);
    }, 'login-email-enter');
    this.addListenerOnce(this.loginPassword, 'keypress', e => {
      if (e.key === 'Enter') this.handleLogin(e);
    }, 'login-password-enter');
    this.addListenerOnce(this.signupEmail, 'keypress', e => {
      if (e.key === 'Enter') this.handleSignup(e);
    }, 'signup-email-enter');
  }

  initAuthStateListener() {
    if (this.authStateBound) return;
    this.authStateBound = true;

    initAuthStateListener({
      onLogin: (user) => {
        this.showDashboard(user);
      },
      onLogout: () => {
        this.showAuthModal();
      }
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = this.loginEmail.value.trim();
    const password = this.loginPassword.value.trim();

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email');
      return;
    }

    if (!password) {
      this.showError('Please enter your password');
      return;
    }

    try {
      this.authError.classList.remove('show');
      this.loginBtn.disabled = true;
      this.loginBtn.textContent = 'Signing in...';

      await signInUser(email, password);

      // Clear form
      this.loginEmail.value = '';
      this.loginPassword.value = '';
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.loginBtn.disabled = false;
      this.loginBtn.textContent = 'Sign In';
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const name = this.signupName.value.trim();
    const email = this.signupEmail.value.trim();
    const password = this.signupPassword.value.trim();
    const confirmPassword = this.signupConfirmPassword.value.trim();

    if (!name) {
      this.showError('Please enter your name');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    try {
      this.authError.classList.remove('show');
      this.signupBtn.disabled = true;
      this.signupBtn.textContent = 'Creating account...';

      await signUpUser(email, password, name);

      // Clear form
      this.signupName.value = '';
      this.signupEmail.value = '';
      this.signupPassword.value = '';
      this.signupConfirmPassword.value = '';

      // Switch back to login
      this.showLoginForm();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.signupBtn.disabled = false;
      this.signupBtn.textContent = 'Create Account';
    }
  }

  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOutUser();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }

  /**
   * Handle social login (Google, Facebook, Twitter)
   */
  async handleSocialLogin(provider, e) {
    e.preventDefault();
    
    try {
      this.authError.classList.remove('show');
      
      // Disable all social buttons during login
      const socialBtns = document.querySelectorAll('.social-auth-btn');
      socialBtns.forEach(btn => btn.disabled = true);
      
      let user;
      switch (provider) {
        case 'google':
          user = await signInWithGoogle();
          break;
        case 'facebook':
          user = await signInWithFacebook();
          break;
        case 'twitter':
          user = await signInWithTwitter();
          break;
        default:
          throw new Error('Unknown provider');
      }
      
      console.log(`Signed in with ${provider}:`, user.email);
      // Auth state listener will handle the rest
      
    } catch (error) {
      // Handle popup closed by user
      if (error.message.includes('popup-closed-by-user')) {
        // User closed popup, no error message needed
        return;
      }
      
      // Handle account-exists-with-different-credential
      if (error.message.includes('account-exists-with-different-credential')) {
        this.showError('An account already exists with this email. Try a different sign-in method.');
        return;
      }
      
      this.showError(error.message);
    } finally {
      // Re-enable social buttons
      const socialBtns = document.querySelectorAll('.social-auth-btn');
      socialBtns.forEach(btn => btn.disabled = false);
    }
  }

  showLoginForm() {
    this.loginForm.classList.remove('hidden');
    this.signupForm.classList.add('hidden');
    this.authError.classList.remove('show');
    if (this.loginEmail) this.loginEmail.focus();
  }

  showSignupForm() {
    this.signupForm.classList.remove('hidden');
    this.loginForm.classList.add('hidden');
    this.authError.classList.remove('show');
    if (this.signupName) this.signupName.focus();
  }

  showError(message) {
    this.authError.textContent = message;
    this.authError.classList.add('show');
  }

  showAuthModal() {
    if (this.authModal) {
      this.authModal.classList.add('active');
    }
    if (this.sidebar) {
      this.sidebar.classList.add('hidden');
    }
    if (this.mainContent) {
      this.mainContent.classList.add('hidden');
    }
    this.showLoginForm();
  }

  showDashboard(user) {
    if (this.authModal) {
      this.authModal.classList.remove('active');
    }
    if (this.sidebar) {
      this.sidebar.classList.remove('hidden');
      this.sidebar.classList.remove('loading');
    }
    if (this.mainContent) {
      this.mainContent.classList.remove('hidden');
    }

    // Update user info
    if (this.userName && user.displayName) {
      this.userName.textContent = user.displayName;
    } else if (this.userName && user.email) {
      this.userName.textContent = user.email.split('@')[0];
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getCurrentUser() {
    return getCurrentUser();
  }
}

export const authManager = new AuthManager();
