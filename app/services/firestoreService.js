// ─────────────────────────────────────────────────────────────────
// firestoreService.js - Firestore data operations
// ─────────────────────────────────────────────────────────────────

import { db } from '../js/firebase.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const ALLOWED_POST_STATUSES = new Set([
  'draft',
  'scheduled',
  'ready_to_publish',
  'publishing',
  'published',
  'analyzed',
  'failed',
  'permanently_failed',
]);

const ALLOWED_PLATFORMS = new Set(['youtube', 'twitter', 'instagram', 'tiktok']);

function normalizePlatform(platform) {
  if (!platform) return null;
  const value = String(platform).trim().toLowerCase();
  if (value === 'x') return 'twitter';
  return ALLOWED_PLATFORMS.has(value) ? value : null;
}

function normalizePlatforms(platforms) {
  const values = Array.isArray(platforms) ? platforms : [platforms];
  return [...new Set(values.map(normalizePlatform).filter(Boolean))];
}

function normalizePostStatus(status) {
  const value = String(status || 'draft').trim().toLowerCase();
  return ALLOWED_POST_STATUSES.has(value) ? value : 'draft';
}

function normalizeText(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value == null) {
    return fallback;
  }
  return String(value).trim();
}

export function normalizeDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value?.seconds === 'number') {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePlatformStatus(platforms, platformStatus) {
  const next = {};
  const input = platformStatus && typeof platformStatus === 'object' ? platformStatus : {};

  const resolvedPlatforms = Array.isArray(platforms) && platforms.length > 0
    ? platforms
    : normalizePlatforms(Object.keys(input));

  resolvedPlatforms.forEach((platform) => {
    const value = normalizeText(input[platform], '');
    next[platform] = value ? value.toLowerCase() : 'queued';
  });

  return next;
}

function normalizeInsightPayload(insights) {
  if (!insights || typeof insights !== 'object') return null;

  const summary = normalizeText(insights.summary || '', '') || null;
  const whatWorked = normalizeText(insights.whatWorked || '', '') || null;
  const whatFailed = normalizeText(insights.whatFailed || '', '') || null;
  const nextAction = normalizeText(
    insights.nextAction || insights.suggestedNextContentIdea || insights.nextContentIdea || '',
    ''
  ) || null;
  const hookStyle = normalizeText(insights.hookStyle || '', '') || null;
  const performanceBand = normalizeText(insights.performanceBand || '', '') || null;
  const performanceDelta = Number(insights.performanceDelta ?? 0) || 0;

  if (!summary && !whatWorked && !whatFailed && !nextAction && !hookStyle && !performanceBand && !performanceDelta) {
    return null;
  }

  return {
    summary,
    whatWorked,
    whatFailed,
    nextAction,
    suggestedNextContentIdea: nextAction,
    performanceDelta,
    hookStyle,
    performanceBand,
  };
}

function normalizePostRecord(postData = {}) {
  const platforms = normalizePlatforms(postData.platforms || postData.platform || []);
  const primaryPlatform = normalizePlatform(postData.primaryPlatform || platforms[0]) || platforms[0] || null;
  const scheduledAt = normalizeDateValue(postData.scheduledAt);
  const publishedAt = normalizeDateValue(postData.publishedAt);
  const nextRetryAt = normalizeDateValue(postData.nextRetryAt);
  const clipId = normalizeText(postData.clipId || postData.sourceClipId || '', '') || null;
  const caption = normalizeText(postData.caption || postData.title || 'Untitled Clip', 'Untitled Clip');
  const insight = normalizeInsightPayload(postData.insight || postData.insights);
  const normalizedStatus = normalizePostStatus(postData.status);
  const analyzed = typeof postData.analyzed === 'boolean' ? postData.analyzed : normalizedStatus === 'analyzed';

  return {
    title: normalizeText(postData.title || '', ''),
    caption,
    platforms,
    primaryPlatform,
    scheduledAt,
    publishedAt,
    status: normalizedStatus,
    analyzed,
    reach: Number(postData.reach ?? 0) || 0,
    engagement: Number(postData.engagement ?? 0) || 0,
    engagementRate: Number(postData.engagementRate ?? 0) || 0,
    engagementScore: Number(postData.engagementScore ?? 0) || 0,
    views: Math.max(0, Number(postData.views ?? 0) || 0),
    likes: Math.max(0, Number(postData.likes ?? 0) || 0),
    comments: Math.max(0, Number(postData.comments ?? 0) || 0),
    watchTime: Math.max(0, Number(postData.watchTime ?? 0) || 0),
    mediaUrl: normalizeText(postData.mediaUrl || '', '') || null,
    mediaType: normalizeText(postData.mediaType || '', '') || null,
    mediaPath: normalizeText(postData.mediaPath || '', '') || null,
    clipId,
    sourceClipId: clipId,
    platformStatus: normalizePlatformStatus(platforms, postData.platformStatus),
    retryCount: Math.max(0, Number(postData.retryCount ?? 0) || 0),
    nextRetryAt,
    errorMessage: normalizeText(postData.errorMessage || '', '') || null,
    origin: normalizeText(postData.origin || '', '') || null,
    workflow: normalizeText(postData.workflow || '', '') || null,
    insight,
    insights: insight,
    analyticsUpdatedAt: normalizeDateValue(postData.analyticsUpdatedAt),
    analyzedAt: normalizeDateValue(postData.analyzedAt),
    analysisSource: normalizeText(postData.analysisSource || '', '') || null,
    schemaVersion: Number(postData.schemaVersion ?? 2) || 2,
  };
}

function normalizePostUpdateRecord(updates = {}) {
  const normalized = { ...updates };

  if ('platforms' in updates || 'platform' in updates || 'primaryPlatform' in updates) {
    const platforms = normalizePlatforms(updates.platforms || updates.platform || []);
    normalized.platforms = platforms;
    normalized.primaryPlatform = normalizePlatform(updates.primaryPlatform || platforms[0]) || platforms[0] || null;
  }

  if ('status' in updates) {
    normalized.status = normalizePostStatus(updates.status);
    if (!('analyzed' in updates)) {
      normalized.analyzed = normalized.status === 'analyzed';
    }
  }

  if ('caption' in updates || 'title' in updates) {
    normalized.caption = normalizeText(updates.caption || updates.title || 'Untitled Clip', 'Untitled Clip');
  }

  if ('title' in updates) {
    normalized.title = normalizeText(updates.title || '', '');
  }

  if ('scheduledAt' in updates) {
    normalized.scheduledAt = normalizeDateValue(updates.scheduledAt);
  }

  if ('publishedAt' in updates) {
    normalized.publishedAt = normalizeDateValue(updates.publishedAt);
  }

  if ('nextRetryAt' in updates) {
    normalized.nextRetryAt = normalizeDateValue(updates.nextRetryAt);
  }

  if ('analyticsUpdatedAt' in updates) {
    normalized.analyticsUpdatedAt = normalizeDateValue(updates.analyticsUpdatedAt);
  }

  if ('analyzedAt' in updates) {
    normalized.analyzedAt = normalizeDateValue(updates.analyzedAt);
  }

  if ('analyzed' in updates) {
    normalized.analyzed = Boolean(updates.analyzed);
  }

  if ('clipId' in updates || 'sourceClipId' in updates) {
    const clipId = normalizeText(updates.clipId || updates.sourceClipId || '', '') || null;
    normalized.clipId = clipId;
    normalized.sourceClipId = clipId;
  }

  if ('platformStatus' in updates) {
    const platforms = Array.isArray(normalized.platforms)
      ? normalized.platforms
      : normalizePlatforms(updates.platforms || Object.keys(updates.platformStatus || {}));
    normalized.platformStatus = normalizePlatformStatus(platforms, updates.platformStatus);
  }

  if ('views' in updates) {
    normalized.views = Math.max(0, Number(updates.views ?? 0) || 0);
  }

  if ('likes' in updates) {
    normalized.likes = Math.max(0, Number(updates.likes ?? 0) || 0);
  }

  if ('comments' in updates) {
    normalized.comments = Math.max(0, Number(updates.comments ?? 0) || 0);
  }

  if ('watchTime' in updates) {
    normalized.watchTime = Math.max(0, Number(updates.watchTime ?? 0) || 0);
  }

  if ('engagementRate' in updates) {
    normalized.engagementRate = Number(updates.engagementRate ?? 0) || 0;
  }

  if ('engagementScore' in updates) {
    normalized.engagementScore = Number(updates.engagementScore ?? 0) || 0;
  }

  if ('insight' in updates || 'insights' in updates) {
    const insight = normalizeInsightPayload(updates.insight || updates.insights);
    normalized.insight = insight;
    normalized.insights = insight;
  }

  if ('analysisSource' in updates) {
    normalized.analysisSource = normalizeText(updates.analysisSource || '', '') || null;
  }

  return normalized;
}

function normalizeStoredPost(post) {
  const normalized = normalizePostRecord(post);
  return {
    id: post.id,
    ...post,
    ...normalized,
  };
}

// ─── Posts Operations ─── //

export async function createPost(userId, postData) {
  try {
    const postsRef = collection(db, 'users', userId, 'posts');
    const normalized = normalizePostRecord(postData);
    const docRef = await addDoc(postsRef, {
      title: normalized.title,
      caption: normalized.caption,
      platforms: normalized.platforms,
      primaryPlatform: normalized.primaryPlatform,
      scheduledAt: normalized.scheduledAt,
      publishedAt: normalized.publishedAt,
      status: normalized.status,
      analyzed: normalized.analyzed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reach: normalized.reach,
      engagement: normalized.engagement,
      engagementRate: normalized.engagementRate,
      engagementScore: normalized.engagementScore,
      views: normalized.views,
      likes: normalized.likes,
      comments: normalized.comments,
      watchTime: normalized.watchTime,
      mediaUrl: normalized.mediaUrl,
      mediaType: normalized.mediaType,
      mediaPath: normalized.mediaPath,
      clipId: normalized.clipId,
      sourceClipId: normalized.sourceClipId,
      platformStatus: normalized.platformStatus,
      retryCount: normalized.retryCount,
      nextRetryAt: normalized.nextRetryAt,
      errorMessage: normalized.errorMessage,
      origin: normalized.origin,
      workflow: normalized.workflow,
      insight: normalized.insight,
      insights: normalized.insights,
      analyticsUpdatedAt: normalized.analyticsUpdatedAt,
      analyzedAt: normalized.analyzedAt,
      analysisSource: normalized.analysisSource,
      schemaVersion: normalized.schemaVersion,
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updatePost(userId, postId, updates) {
  try {
    const postRef = doc(db, 'users', userId, 'posts', postId);
    const normalized = normalizePostUpdateRecord(updates);
    await updateDoc(postRef, {
      ...normalized,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deletePost(userId, postId) {
  try {
    const postRef = doc(db, 'users', userId, 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getPostById(userId, postId) {
  try {
    const postRef = doc(db, 'users', userId, 'posts', postId);
    const snapshot = await getDoc(postRef);

    if (!snapshot.exists()) {
      return null;
    }

    return normalizeStoredPost({
      id: snapshot.id,
      ...snapshot.data(),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAllPosts(userId) {
  try {
    const postsRef = collection(db, 'users', userId, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => normalizeStoredPost({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

export function subscribeToPosts(userId, callback, onError) {
  const postsRef = collection(db, 'users', userId, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => normalizeStoredPost({
      id: doc.id,
      ...doc.data(),
    }));
    callback(posts);
  }, (error) => {
    console.error("Firestore subscription error:", error);
    if (typeof onError === 'function') {
      onError(error);
    }
  });
}

export function subscribeToLogs(userId, callback) {
  const logsRef = collection(db, 'users', userId, 'logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(logs);
  }, (error) => {
    console.error("Firestore logs subscription error:", error);
  });
}

// ─── Accounts Operations ─── //

export async function connectAccount(userId, platform, accountData) {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', platform);
    await setDoc(accountRef, {
      platform,
      username: accountData.username,
      connected: true,
      connectedAt: serverTimestamp(),
      followers: accountData.followers || 0,
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function disconnectAccount(userId, platform) {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', platform);
    await deleteDoc(accountRef);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAccounts(userId) {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const snapshot = await getDocs(accountsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

// ─── Clip Pipeline Operations ─── //

export async function createVideo(userId, videoData) {
  try {
    const videosRef = collection(db, 'users', userId, 'videos');
    const docRef = await addDoc(videosRef, {
      userId,
      fileName: videoData.fileName,
      fileSize: videoData.fileSize || 0,
      fileType: videoData.fileType || 'video/mp4',
      videoUrl: videoData.videoUrl,
      storagePath: videoData.storagePath || null,
      status: videoData.status || 'uploaded',
      clipsCount: videoData.clipsCount || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateVideo(userId, videoId, updates) {
  try {
    const videoRef = doc(db, 'users', userId, 'videos', videoId);
    await updateDoc(videoRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserVideos(userId) {
  try {
    const videosRef = collection(db, 'users', userId, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((videoDoc) => ({
      id: videoDoc.id,
      ...videoDoc.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createClip(userId, clipData) {
  try {
    const clipsRef = collection(db, 'users', userId, 'clips');
    const docRef = await addDoc(clipsRef, {
      userId,
      videoId: clipData.videoId,
      start: clipData.start,
      end: clipData.end,
      title: clipData.title,
      thumbnailUrl: clipData.thumbnailUrl || null,
      videoUrl: clipData.videoUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function saveGeneratedClips(userId, videoId, clips) {
  try {
    await Promise.all(
      clips.map((clip) =>
        createClip(userId, {
          ...clip,
          videoId,
        })
      )
    );
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getClipsForVideo(userId, videoId) {
  try {
    const clipsRef = collection(db, 'users', userId, 'clips');
    const q = query(clipsRef, where('videoId', '==', videoId));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((clipDoc) => ({
        id: clipDoc.id,
        ...clipDoc.data(),
      }))
      .sort((a, b) => (a.start || 0) - (b.start || 0));
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAllClips(userId) {
  try {
    const clipsRef = collection(db, 'users', userId, 'clips');
    const q = query(clipsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((clipDoc) => ({
      id: clipDoc.id,
      ...clipDoc.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

// ─── Analytics Operations ─── //

export async function updateAnalytics(userId, platform, analyticsData) {
  try {
    const analyticsRef = doc(db, 'users', userId, 'analytics', platform);
    await setDoc(analyticsRef, {
      platform,
      reach: analyticsData.reach || 0,
      engagement: analyticsData.engagement || 0,
      engagementRate: analyticsData.engagementRate || 0,
      followers: analyticsData.followers || 0,
      growthRate: analyticsData.growthRate || 0,
      topPost: analyticsData.topPost || null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAnalytics(userId) {
  try {
    const analyticsRef = collection(db, 'users', userId, 'analytics');
    const snapshot = await getDocs(analyticsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

// ─── User Operations ─── //

export async function updateUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ─── Helper Functions ─── //

export function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
