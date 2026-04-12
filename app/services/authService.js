// ─────────────────────────────────────────────────────────────────
// authService.js - Authentication Service
// ─────────────────────────────────────────────────────────────────

import { auth, db } from '../js/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { appState } from '../js/state.js';

// Initialize auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Ensure user document exists in Firestore after social login
 */
async function ensureUserDoc(user, provider) {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: { emailNotifications: true },
        hasCompletedOnboarding: false,
        niche: "",
        platforms: [],
        aiMode: "platform",
        apiKey: "",
        credits: 100,
        authProvider: provider
      });
    }
  } catch (e) {
    console.warn('ensureUserDoc error (non-fatal):', e);
  }
}

/**
 * Check for redirect result on page load (for signInWithRedirect fallback)
 */
export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureUserDoc(result.user, result.providerId || 'social');
      return result.user;
    }
  } catch (error) {
    console.error('Redirect result error:', error);
  }
  return null;
}

export async function signUpUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        emailNotifications: true,
      },
      hasCompletedOnboarding: false,
      niche: "",
      platforms: [],
      aiMode: "platform",
      apiKey: "",
      credits: 100
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user, 'google');
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error.code, error.message);
    // If popup blocked or COOP issue, fall back to redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/cancelled-popup-request') {
      console.log('Popup failed, falling back to redirect...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Sign in with Facebook popup
 */
export async function signInWithFacebook() {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await ensureUserDoc(result.user, 'facebook');
    return result.user;
  } catch (error) {
    console.error('Facebook sign-in error:', error.code, error.message);
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, facebookProvider);
      return null;
    }
    throw error;
  }
}

export async function signInWithTwitter() {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    await ensureUserDoc(result.user, 'twitter');
    return result.user;
  } catch (error) {
    console.error('Twitter sign-in error:', error.code, error.message);
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, twitterProvider);
      return null;
    }
    throw error;
  }
}

export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
}

export function initAuthStateListener(callbacks = {}) {
  return onAuthStateChanged(auth, user => {
    appState.setUser(user);
    if (user && callbacks.onLogin) {
      callbacks.onLogin(user);
    } else if (!user && callbacks.onLogout) {
      callbacks.onLogout();
    }
  });
}

export function waitForInitialAuthState() {
  return new Promise((resolve) => {
    let unsubscribe = () => {};
    unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, () => {
      unsubscribe();
      resolve(null);
    });
  });
}

export function getCurrentUser() {
  return auth.currentUser;
}
