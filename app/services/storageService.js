// ─────────────────────────────────────────────────────────────────
// services/storageService.js - Firebase Storage Upload Service
// ─────────────────────────────────────────────────────────────────

import { storage } from '../js/firebase.js';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

/*
  =========================================
  🚨 TEMPORARY FIREBASE STORAGE RULES (DEBUG)
  =========================================
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if true;
      }
    }
  }

  =========================================
  🌐 CORS CONFIGURATION
  =========================================
  1. Create cors.json:
  [
    {
      "origin": [
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "https://yourdomain.com",
        "*"
      ],
      "method": ["GET", "POST", "PUT"],
      "maxAgeSeconds": 3600,
      "responseHeader": [
        "Content-Type",
        "Authorization",
        "x-goog-resumable"
      ]
    }
  ]
  2. Run: gsutil cors set cors.json gs://viralcliptech-36846.firebasestorage.app
*/

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/quicktime', 'video/webm', 'video/avi'];
const DEFAULT_MAX_FILE_SIZE_MB = 10;
const VIDEO_UPLOAD_MAX_FILE_SIZE_MB = 250;

export const storageService = {

  /**
   * Validate a file — returns { valid, error, mediaType }
   */
  validateFile(file, options = {}) {
    const {
      maxSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
      allowImages = true,
      allowVideos = true
    } = options;
    const maxFileSizeBytes = maxSizeMb * 1024 * 1024;

    if (!file) return { valid: false, error: 'No file selected' };

    console.log('[StorageService] Validating file:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

    if (file.size > maxFileSizeBytes) {
      return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max is ${maxSizeMb}MB.` };
    }

    if (allowImages && ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: true, mediaType: 'image' };
    }

    if (allowVideos && ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: true, mediaType: 'video' };
    }

    return {
      valid: false,
      error: `Unsupported file type: "${file.type}". Use JPEG, PNG, GIF, WebP, MP4, MOV, or WebM.`
    };
  },

  /**
   * Upload a file to Firebase Storage using uploadBytesResumable.
   * @param {string} userId
   * @param {File} file
   * @param {Function} onProgress - Optional: called with progress percentage
   * @returns {Promise<{ url: string, mediaType: string, path: string }>}
   */
  uploadFile(userId, file, onProgress = null, folder = 'posts', validationOptions = {}) {
    return new Promise((resolve, reject) => {
      console.log('[StorageService] uploadFile() called');
      console.log('[StorageService]  → userId:', userId);
      console.log('[StorageService]  → file:', file?.name, file?.type, file?.size);

      const validation = this.validateFile(file, validationOptions);
      if (!validation.valid) {
        console.error('[StorageService] Validation failed:', validation.error);
        return reject(new Error(validation.error));
      }

      console.log('[StorageService] Validation passed. Media type:', validation.mediaType);

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `users/${userId}/${folder}/${timestamp}_${safeFileName}`;

      console.log('[StorageService] Storage path:', storagePath);

      if (onProgress) onProgress(0);

      const storageRef = ref(storage, storagePath);
      console.log('[StorageService] Ref created:', storageRef.fullPath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('[StorageService] Upload is ' + progress + '% done');
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('[StorageService] Upload FAILED:', error.code, error.message, error);
          reject(new Error(`Upload failed (${error.code || 'UNKNOWN'}): ${error.message}`));
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[StorageService] Download URL:', url);
            resolve({
              url,
              mediaType: validation.mediaType,
              path: storagePath
            });
          } catch (err) {
            console.error('[StorageService] Failed to get download URL:', err);
            reject(new Error(`Failed to get URL: ${err.message}`));
          }
        }
      );
    });
  },

  uploadVideo(userId, file, onProgress = null) {
    return this.uploadFile(userId, file, onProgress, 'videos', {
      maxSizeMb: VIDEO_UPLOAD_MAX_FILE_SIZE_MB,
      allowImages: false,
      allowVideos: true
    });
  },

  /**
   * Delete a file from Firebase Storage by its stored path.
   */
  async deleteFile(storagePath) {
    if (!storagePath) return;
    try {
      console.log('[StorageService] Deleting file:', storagePath);
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      console.log('[StorageService] File deleted.');
    } catch (err) {
      console.warn('[StorageService] Could not delete file:', err.code, err.message);
    }
  }
};
