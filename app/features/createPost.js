// ─────────────────────────────────────────────────────────────────
// createPost.js - Create Post modal with Media Upload support
// ─────────────────────────────────────────────────────────────────

import {
  createPost,
  updatePost,
} from '../services/firestoreService.js';
import { Timestamp } from '../js/firebase.js';
import { appState } from '../js/state.js';
import { showToast } from '../js/app.js';
import { aiService } from '../services/aiService.js';
import { storageService } from '../services/storageService.js';

export class CreatePostModule {
  constructor() {
    this.modal = document.getElementById('createPostModal');
    this.form = document.getElementById('createPostForm');
    this.openBtn = document.getElementById('openCreatePostBtn');
    this.submitBtn = document.getElementById('createPostSubmitBtn');
    this.closeBtn = document.querySelector('.modal-close-btn');
    this.saveDraftBtn = document.getElementById('saveDraftBtn');
    this.captionInput = document.getElementById('postCaption');
    this.scheduleInput = document.getElementById('scheduleDateTime');
    this.platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
    this.generateCaptionBtn = document.getElementById('generateCaptionBtn');
    this.autoScheduleBtn = document.getElementById('autoScheduleBtn');
    this.editingPostId = null;

    // Media upload state
    this._selectedFile = null;
    this._mediaListenersAttached = false;

    // Listen to state changes to drive UI
    appState.subscribe((changes) => {
      if (changes.type === 'CREATE_POST_UPDATED') {
        this.updateMediaUI(changes.payload);
      }
    });

    this.init();
    // NOTE: initMediaUpload() is NOT called here because the modal DOM
    // is injected by ModalComponent and may not exist yet when this
    // constructor runs. It is called lazily in openModal() instead.
  }

  // ─── Media Upload Wiring (called lazily on first openModal) ──────

  initMediaUpload() {
    if (this._mediaListenersAttached) return; // already wired up

    const dropZone = document.getElementById('mediaDropZone');
    const fileInput = document.getElementById('mediaFileInput');
    const removeBtn = document.getElementById('removeMediaBtn');

    if (!dropZone || !fileInput) {
      console.warn('[CreatePost] initMediaUpload: DOM elements not found. dropZone:', dropZone, 'fileInput:', fileInput);
      return;
    }

    console.log('[CreatePost] initMediaUpload: attaching listeners');
    this._mediaListenersAttached = true;

    // Clicking the drop zone text/icon area passes through to the file input
    // (the file input covers 100% of the drop zone with opacity:0)
    // We call fileInput.click() only when something OTHER than the input itself is clicked
    dropZone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        console.log('[CreatePost] dropZone clicked — triggering file picker');
        fileInput.click();
      }
    });

    // File selected via native picker
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      console.log('[CreatePost] fileInput change — file:', file?.name, file?.type);
      if (file) this.handleFileSelected(file);
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('is-dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('is-dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('is-dragover');
      const file = e.dataTransfer.files[0];
      console.log('[CreatePost] File dropped:', file?.name, file?.type);
      if (file) this.handleFileSelected(file);
    });

    removeBtn?.addEventListener('click', () => this.clearMedia());
  }

  handleFileSelected(file) {
    console.log('[CreatePost] handleFileSelected:', file.name, file.type, `${(file.size/1024).toFixed(1)}KB`);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      console.warn('[CreatePost] File rejected:', validation.error);
      return;
    }

    this._selectedFile = file;
    console.log('[CreatePost] File accepted. Media type:', validation.mediaType);

    const objectUrl = URL.createObjectURL(file);
    appState.setCreatePostState({
      mediaUrl: objectUrl,
      mediaType: validation.mediaType,
      mediaPath: null,
      uploading: false,
      uploadProgress: 0,
      uploadError: null
    });
    
    showToast(`Media selected: ${file.name}`, 'info');
  }

  clearMedia() {
    this._selectedFile = null;
    const fileInput = document.getElementById('mediaFileInput');
    if (fileInput) fileInput.value = '';

    appState.setCreatePostState({
      mediaUrl: null,
      mediaType: null,
      mediaPath: null,
      uploading: false,
      uploadProgress: 0,
      uploadError: null
    });
  }

  // ─── State-Driven UI Update ─────────────────────────────────────────

  updateMediaUI(state) {
    const imgEl = document.getElementById('mediaImagePreview');
    const vidEl = document.getElementById('mediaVideoPreview');
    const previewContainer = document.getElementById('mediaPreviewContainer');
    const placeholder = document.getElementById('mediaDropPlaceholder');
    const dropZone = document.getElementById('mediaDropZone');
    
    // Media Preview update
    if (state.mediaUrl) {
      if (placeholder) placeholder.classList.add('hidden');
      if (dropZone) dropZone.classList.add('has-media');
      if (previewContainer) previewContainer.classList.add('active');

      if (state.mediaType === 'image') {
        if (imgEl) { imgEl.src = state.mediaUrl; imgEl.classList.remove('hidden'); }
        if (vidEl) vidEl.classList.add('hidden');
      } else {
        if (vidEl) { vidEl.src = state.mediaUrl; vidEl.classList.remove('hidden'); }
        if (imgEl) imgEl.classList.add('hidden');
      }
    } else {
      if (imgEl) { imgEl.src = ''; imgEl.classList.add('hidden'); }
      if (vidEl) { vidEl.src = ''; vidEl.classList.add('hidden'); }
      if (previewContainer) previewContainer.classList.remove('active');
      if (placeholder) placeholder.classList.remove('hidden');
      if (dropZone) dropZone.classList.remove('has-media');
    }

    // Upload Progress update
    const container = document.getElementById('uploadProgressContainer');
    const bar = document.getElementById('uploadProgressBar');
    const text = document.getElementById('uploadProgressText');

    if (state.uploading) {
      if (container) container.classList.add('active');
      if (bar) bar.style.width = `${state.uploadProgress}%`;
      if (text) text.textContent = `${state.uploadProgress}%`;
      this.setButtonsDisabled(true);
    } else {
      if (container) container.classList.remove('active');
      if (state.uploadError) {
        // UI reflection for error could be added here
      }
      this.setButtonsDisabled(false);
    }
  }

  // ─── Upload Before Submit ─────────────────────────────────────────

  async performUploadIfNeeded(userId) {
    const currentState = appState.getState().createPostState;
    console.log('[CreatePost] performUploadIfNeeded — selectedFile:', this._selectedFile?.name);

    if (!this._selectedFile) {
      console.log('[CreatePost] No file selected, skipping upload.');
      return currentState.mediaUrl ? {
        url: currentState.mediaUrl,
        mediaType: currentState.mediaType,
        path: currentState.mediaPath
      } : null;
    }

    if (currentState.mediaPath) {
      console.log('[CreatePost] File already uploaded, reusing URL:', currentState.mediaUrl);
      return {
        url: currentState.mediaUrl,
        mediaType: currentState.mediaType,
        path: currentState.mediaPath
      };
    }

    appState.setCreatePostState({ uploading: true, uploadProgress: 0, uploadError: null });
    showToast('Uploading media...', 'info');

    try {
      const result = await storageService.uploadFile(
        userId,
        this._selectedFile,
        (progress) => {
          console.log('[CreatePost] Upload progress:', progress + '%');
          appState.setCreatePostState({ uploadProgress: progress });
        }
      );
      
      appState.setCreatePostState({
        uploading: false,
        mediaUrl: result.url,
        mediaType: result.mediaType,
        mediaPath: result.path
      });
      
      this._selectedFile = null; // Mark as uploaded to prevent re-upload
      console.log('[CreatePost] Upload complete! URL:', result.url);
      showToast('Media uploaded! ✓', 'success');
      return result;
    } catch (err) {
      appState.setCreatePostState({ uploading: false, uploadError: err.message });
      console.error('[CreatePost] Upload failed:', err);
      throw new Error(`Media upload failed: ${err.message}`);
    }
  }

  // ─── Core Form Logic ──────────────────────────────────────────────

  init() {
    this.openBtn?.addEventListener('click', () => this.openModal());
    document.addEventListener('OPEN_CREATE_POST', () => this.openModal());
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.form?.addEventListener('submit', e => this.handleSubmit(e));
    this.saveDraftBtn?.addEventListener('click', e => this.handleSaveDraft(e));
    this.generateCaptionBtn?.addEventListener('click', () => this.handleGenerateCaption());
    this.autoScheduleBtn?.addEventListener('click', () => this.handleAutoSchedule());

    this.modal?.addEventListener('click', e => {
      if (e.target === this.modal) this.closeModal();
    });

    this.setMinDateTime();
  }

  setMinDateTime() {
    const now = new Date();
    const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    if (this.scheduleInput) this.scheduleInput.min = minDateTime;
  }

  openModal(postId = null) {
    // Lazily attach media listeners on first open (DOM is guaranteed to exist now)
    this.initMediaUpload();

    this.editingPostId = postId;
    this.clearMedia();

    if (postId) {
      const posts = appState.getState().posts;
      const post = posts.find(p => p.id === postId);
      if (post) {
        this.captionInput.value = post.caption || '';
        this.platformCheckboxes.forEach(checkbox => {
          checkbox.checked = post.platforms?.includes(checkbox.value) || false;
        });
        if (post.scheduledAt) {
          const date = post.scheduledAt.toDate
            ? post.scheduledAt.toDate()
            : new Date(post.scheduledAt);
          this.scheduleInput.value = this.formatDatetimeLocal(date);
        }
          // If the post has existing media, load into state
          if (post.mediaUrl) {
            appState.setCreatePostState({
              mediaUrl: post.mediaUrl,
              mediaType: post.mediaType,
              mediaPath: post.mediaPath || null,
              uploading: false,
              uploadProgress: 0,
              uploadError: null
            });
          }
        }
      } else {
        this.form?.reset();
        if (this.scheduleInput) this.scheduleInput.value = '';
        this.platformCheckboxes.forEach(checkbox => (checkbox.checked = false));
      }

      this.modal?.classList.add('active');
      this.captionInput?.focus();
  }

  closeModal() {
    this.modal?.classList.remove('active');
    this.form?.reset();
    this.clearMedia();
    this.editingPostId = null;
  }

  setButtonsDisabled(disabled) {
    if (this.submitBtn) this.submitBtn.disabled = disabled;
    if (this.saveDraftBtn) this.saveDraftBtn.disabled = disabled;
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.validateForm()) return;

    const user = appState.getState().user;
    if (!user) { showToast('User not authenticated', 'error'); return; }

    this.setButtonsDisabled(true);

    try {
      const mediaData = await this.performUploadIfNeeded(user.uid);
      const postData = this.getFormData(mediaData);
      postData.status = 'scheduled';

      if (this.editingPostId) {
        await updatePost(user.uid, this.editingPostId, postData);
        showToast('Post updated successfully', 'success');
      } else {
        await createPost(user.uid, postData);
        showToast('Post scheduled successfully ✨', 'success');
      }

      this.closeModal();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      this.setButtonsDisabled(false);
    }
  }

  async handleSaveDraft(e) {
    e.preventDefault();
    if (!this.validateCaption()) { showToast('Please enter a caption', 'warning'); return; }

    const user = appState.getState().user;
    if (!user) { showToast('User not authenticated', 'error'); return; }

    this.setButtonsDisabled(true);

    try {
      const mediaData = await this.performUploadIfNeeded(user.uid);
      const postData = this.getFormData(mediaData);
      postData.status = 'draft';
      postData.scheduledAt = null;

      if (this.editingPostId) {
        await updatePost(user.uid, this.editingPostId, postData);
        showToast('Draft updated', 'success');
      } else {
        await createPost(user.uid, postData);
        showToast('Draft saved', 'success');
      }

      this.closeModal();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      this.setButtonsDisabled(false);
    }
  }

  async handleGenerateCaption() {
    if (!this.captionInput) return;
    const prompt = this.captionInput.value.trim() || 'tech content creation setup';
    try {
      this.generateCaptionBtn.disabled = true;
      this.generateCaptionBtn.innerHTML = '<span class="spinner spinner-sm"></span> Generating...';
      const payload = await aiService.generateCaption(prompt);
      this.captionInput.value = payload.fullCaption;
      showToast('Caption generated! ✨', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      this.generateCaptionBtn.disabled = false;
      this.generateCaptionBtn.innerHTML = '✨ Generate AI Caption';
    }
  }

  async handleAutoSchedule() {
    if (!this.scheduleInput) return;
    try {
      this.autoScheduleBtn.disabled = true;
      this.autoScheduleBtn.innerHTML = '<span class="spinner spinner-sm"></span> Analyzing...';
      const user = appState.getState().user;
      const optimizedDetails = await aiService.getBestPostingTime(user);
      this.scheduleInput.value = this.formatDatetimeLocal(optimizedDetails.suggestedDate);
      showToast(`Auto Schedule applied: ${optimizedDetails.reason}`, 'info');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      this.autoScheduleBtn.disabled = false;
      this.autoScheduleBtn.innerHTML = '⏱ Auto Schedule';
    }
  }

  // ─── Validation ───────────────────────────────────────────────────

  validateForm() {
    if (!this.validateCaption()) {
      showToast('Please enter a caption', 'warning');
      return false;
    }
    if (!this.validatePlatforms()) {
      showToast('Please select at least one platform', 'warning');
      return false;
    }
    if (!this.validateScheduleTime()) {
      showToast('Please select a valid schedule time', 'warning');
      return false;
    }
    return true;
  }

  validateCaption() {
    return this.captionInput?.value.trim().length > 0;
  }

  validatePlatforms() {
    return Array.from(this.platformCheckboxes).some(cb => cb.checked);
  }

  validateScheduleTime() {
    if (!this.scheduleInput?.value) return false;
    return new Date(this.scheduleInput.value) > new Date();
  }

  // ─── Form Data ────────────────────────────────────────────────────

  getFormData(mediaData = null) {
    const platforms = Array.from(this.platformCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    const scheduleDateTime = this.scheduleInput?.value
      ? new Date(this.scheduleInput.value)
      : null;

    return {
      caption: this.captionInput?.value.trim() || '',
      platforms,
      scheduledAt: scheduleDateTime ? Timestamp.fromDate(scheduleDateTime) : null,
      // Media fields (null if no media selected)
      mediaUrl: mediaData?.url || null,
      mediaType: mediaData?.mediaType || null,
      mediaPath: mediaData?.path || null,
    };
  }

  formatDatetimeLocal(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  editPost(postId) {
    this.openModal(postId);
  }
}

export const createPostModule = new CreatePostModule();
