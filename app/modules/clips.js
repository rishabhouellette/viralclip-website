// ─────────────────────────────────────────────────────────────────
// modules/clips.js - ViralClip clip generation prototype
// ─────────────────────────────────────────────────────────────────

import { appState } from '../js/state.js';
import { escapeHtml, showToast } from '../js/app.js';
import { storageService } from '../services/storageService.js';
import {
  createVideo,
  getClipsForVideo,
  getUserVideos,
  saveGeneratedClips,
  updateVideo
} from '../services/firestoreService.js';
import { processVideo } from '../services/clipService.js';
import { viralityScoreEngine } from '../services/viralityScoreEngine.js';

class ClipsModule {
  constructor() {
    this.container = document.getElementById('view-clips');
    this.videos = [];
    this.clips = [];
    this.activeVideo = null;
    this.selectedFile = null;
    this.status = {
      stage: 'idle',
      message: 'Upload a long-form video to generate your first set of clips.',
      progress: 0
    };
  }

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="view-header">
        <h1>Clip Studio</h1>
      </div>

      <div class="clips-workspace">
        <section class="card clips-upload-card">
          <div class="clips-section-head">
            <div>
              <h2 class="clips-section-title">Upload Source Video</h2>
              <p class="clips-section-copy">Drop in one long-form video and we will break it into multiple short clips.</p>
            </div>
          </div>

          <form id="clipsUploadForm" class="clips-upload-form">
            <label for="clipVideoInput" id="clipsDropzone" class="clips-dropzone">
              <span class="clips-dropzone-icon">🎬</span>
              <span class="clips-dropzone-title">Choose a video file</span>
              <span class="clips-dropzone-copy">MP4, MOV, WebM and other standard video formats are supported.</span>
            </label>
            <input id="clipVideoInput" class="hidden" type="file" accept="video/*" />

            <div id="clipFileMeta" class="clips-file-meta">No file selected yet.</div>

            <div class="clips-upload-actions">
              <button id="generateClipsBtn" type="submit" class="btn btn-primary primary-btn">Generate Clips</button>
            </div>
          </form>
        </section>

        <section id="clipsStatusCard" class="card clips-status-card"></section>

        <section class="card clips-history-card">
          <div class="clips-section-head clips-section-head--compact">
            <div>
              <h2 class="clips-section-title">Recent Videos</h2>
              <p class="clips-section-copy">Re-open previous runs and review generated segments.</p>
            </div>
          </div>
          <div id="clipsHistoryList" class="clips-history-list"></div>
        </section>

        <section class="clips-results-block">
          <div class="clips-section-head clips-section-head--compact">
            <div>
              <h2 class="clips-section-title">Generated Clips</h2>
              <p class="clips-section-copy">Preview the first mock segments from the current source video.</p>
            </div>
          </div>
          <div id="clipsResultsGrid" class="clips-list"></div>
        </section>
      </div>
    `;

    this.fileInput = document.getElementById('clipVideoInput');
    this.dropzone = document.getElementById('clipsDropzone');
    this.fileMeta = document.getElementById('clipFileMeta');
    this.statusCard = document.getElementById('clipsStatusCard');
    this.historyList = document.getElementById('clipsHistoryList');
    this.resultsGrid = document.getElementById('clipsResultsGrid');
    this.form = document.getElementById('clipsUploadForm');
    this.generateBtn = document.getElementById('generateClipsBtn');

    this.attachListeners();
    await this.loadExistingVideos();
    this.renderSelectedFile();
    this.renderStatus();
    this.renderHistory();
    this.renderClips();
  }

  attachListeners() {
    this.form?.addEventListener('submit', (event) => this.handleUpload(event));

    this.fileInput?.addEventListener('change', (event) => {
      const [file] = event.target.files || [];
      this.selectedFile = file || null;
      this.syncSelectionStatus();
      this.renderSelectedFile();
    });

    this.dropzone?.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.dropzone.classList.add('is-dragover');
    });

    this.dropzone?.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('is-dragover');
    });

    this.dropzone?.addEventListener('drop', (event) => {
      event.preventDefault();
      this.dropzone.classList.remove('is-dragover');
      const [file] = event.dataTransfer?.files || [];
      if (!file) return;
      this.selectedFile = file;
      if (this.fileInput) {
        this.fileInput.files = event.dataTransfer.files;
      }
      this.syncSelectionStatus();
      this.renderSelectedFile();
    });

    this.historyList?.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-video-id]');
      if (!button) return;
      await this.selectVideo(button.dataset.videoId);
    });
  }

  async loadExistingVideos() {
    const user = appState.getState().user;
    if (!user) return;

    this.videos = await getUserVideos(user.uid);
    if (this.videos.length > 0) {
      await this.selectVideo(this.videos[0].id, false);
    }
  }

  async selectVideo(videoId, showSelectionToast = false) {
    const user = appState.getState().user;
    if (!user || !videoId) return;

    const video = this.videos.find((item) => item.id === videoId);
    if (!video) return;

    this.activeVideo = video;
    this.clips = await getClipsForVideo(user.uid, videoId);

    if (video.status === 'processing') {
      this.status = {
        stage: 'processing',
        message: `Processing ${video.fileName}...`,
        progress: 100
      };
    } else {
      this.status = {
        stage: 'complete',
        message: `${this.clips.length} clips generated from ${video.fileName}.`,
        progress: 100
      };
    }

    this.renderStatus();
    this.renderHistory();
    this.renderClips();

    if (showSelectionToast) {
      showToast(`Loaded clips from ${video.fileName}`, 'info');
    }
  }

  renderSelectedFile() {
    if (!this.fileMeta) return;
    if (!this.selectedFile) {
      this.fileMeta.textContent = 'No file selected yet.';
      return;
    }

    const sizeMb = (this.selectedFile.size / (1024 * 1024)).toFixed(1);
    this.fileMeta.textContent = `Selected: ${this.selectedFile.name} • ${sizeMb} MB`;
  }

  renderStatus() {
    if (!this.statusCard) return;

    const isBusy = this.status.stage === 'uploading' || this.status.stage === 'processing';
    const hasSelectedFile = !!this.selectedFile;
    const progressWidth = Math.max(0, Math.min(100, this.status.progress || 0));
    const statusToneClass = `clips-status-card--${this.status.stage}`;

    this.statusCard.className = `card clips-status-card ${statusToneClass}`;
    this.statusCard.innerHTML = `
      <div class="clips-status-top">
        <div>
          <div class="clips-status-label">Status</div>
          <h2 class="clips-status-title">${this.getStatusTitle()}</h2>
        </div>
        <div class="clips-status-badge">${progressWidth}%</div>
      </div>
      <p class="clips-status-copy">${escapeHtml(this.status.message)}</p>
      <div class="clips-progress-track">
        <div id="clipsProgressFill" class="clips-progress-fill"></div>
      </div>
      ${this.renderStatusFoot(isBusy, hasSelectedFile)}
    `;

    const progressFill = document.getElementById('clipsProgressFill');
    if (progressFill) {
      progressFill.style.width = `${progressWidth}%`;
    }

    if (this.generateBtn) {
      this.generateBtn.disabled = isBusy || !hasSelectedFile;
      this.generateBtn.textContent = isBusy ? 'Working...' : 'Upload & Generate Clips';
    }
  }

  renderStatusFoot(isBusy, hasSelectedFile) {
    if (isBusy) {
      return '<div class="clips-status-foot">This is a simulated v1 processor. Results will appear automatically.</div>';
    }

    if (this.status.stage === 'selected' || hasSelectedFile) {
      return '<div class="clips-status-foot">A file is selected but not uploaded yet. Click "Upload & Generate Clips" to start.</div>';
    }

    return '<div class="clips-status-foot">Choose a source video first, then start the upload from the button below.</div>';
  }

  syncSelectionStatus() {
    if (this.selectedFile) {
      this.status = {
        stage: 'selected',
        message: `${this.selectedFile.name} is ready. Click "Upload & Generate Clips" to start the upload.`,
        progress: 0
      };
    } else if (this.status.stage === 'selected') {
      this.status = {
        stage: 'idle',
        message: 'Upload a long-form video to generate your first set of clips.',
        progress: 0
      };
    }

    this.renderStatus();
  }

  renderHistory() {
    if (!this.historyList) return;

    if (this.videos.length === 0) {
      this.historyList.innerHTML = '<div class="clips-empty card">No videos processed yet.</div>';
      return;
    }

    this.historyList.innerHTML = this.videos.map((video) => {
      const activeClass = this.activeVideo?.id === video.id ? 'active' : '';
      const clipCount = video.clipsCount || 0;
      return `
        <button class="clips-history-item ${activeClass}" data-video-id="${video.id}">
          <div class="clips-history-title">${escapeHtml(video.fileName || 'Untitled video')}</div>
          <div class="clips-history-meta">${clipCount} clips • ${escapeHtml(video.status || 'uploaded')}</div>
        </button>
      `;
    }).join('');
  }

  renderClips() {
    if (!this.resultsGrid) return;

    if (this.clips.length === 0) {
      this.resultsGrid.innerHTML = `
        <div class="clips-empty card">
          <div class="clips-empty-icon">✂️</div>
          <div class="clips-empty-title">No clips yet</div>
          <div class="clips-empty-copy">Upload a source video and the generated clip segments will show up here.</div>
        </div>
      `;
      return;
    }

    this.resultsGrid.innerHTML = this.clips.map((clip, index) => {
      const thumbnail = clip.thumbnailUrl || '/assets/images/dashboard-mock.png';
      const vs = viralityScoreEngine.scoreClip(clip);
      const badgeClass = vs.score >= 75 ? 'high' : vs.score >= 60 ? 'medium' : 'low';
      const hookClass = vs.hook_strength === 'Strong' ? 'strong' : vs.hook_strength === 'Moderate' ? 'moderate' : 'weak';
      const trendClass = vs.trend === '↑' ? 'trend-up' : 'trend-down';
      return `
        <article class="clip-card clip-result-card">
          <div class="clip-thumbnail clip-thumbnail-shell">
            <img src="${thumbnail}" alt="${escapeHtml(clip.title)}" class="clip-thumbnail-image" />
            <div class="clip-virality-badge clip-virality-badge--${badgeClass}">${vs.score}</div>
            <div class="clip-time-badge">${this.formatSeconds(clip.start)} - ${this.formatSeconds(clip.end)}</div>
          </div>
          <div class="clip-info">
            <div class="clip-sequence">Clip ${index + 1}</div>
            <div class="clip-title">${escapeHtml(clip.title)}</div>
            <div class="clip-meta">${clip.end - clip.start}s segment</div>
            <div class="clip-score-labels">
              <span class="clip-score-label clip-score-label--${hookClass}">Hook: ${vs.hook_strength}</span>
              <span class="clip-score-label clip-score-label--${trendClass}">Trend: ${vs.trend}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  async handleUpload(event) {
    event.preventDefault();

    const user = appState.getState().user;
    if (!user) {
      showToast('Please sign in before uploading a video.', 'warning');
      return;
    }

    if (!this.selectedFile) {
      showToast('Please choose a video file first.', 'warning');
      return;
    }

    const validation = storageService.validateFile(this.selectedFile, {
      maxSizeMb: 250,
      allowImages: false,
      allowVideos: true
    });
    if (!validation.valid || validation.mediaType !== 'video') {
      showToast(validation.error || 'Please upload a valid video file.', 'error');
      return;
    }

    this.status = {
      stage: 'uploading',
      message: `Uploading ${this.selectedFile.name}...`,
      progress: 0
    };
    this.clips = [];
    this.renderStatus();
    this.renderClips();

    let videoId = null;

    try {
      const uploaded = await storageService.uploadVideo(user.uid, this.selectedFile, (progress) => {
        this.status = {
          stage: 'uploading',
          message: `Uploading ${this.selectedFile.name}...`,
          progress
        };
        this.renderStatus();
      });

      videoId = await createVideo(user.uid, {
        fileName: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        fileType: this.selectedFile.type,
        videoUrl: uploaded.url,
        storagePath: uploaded.path,
        status: 'processing',
        clipsCount: 0
      });

      this.activeVideo = {
        id: videoId,
        fileName: this.selectedFile.name,
        status: 'processing',
        clipsCount: 0,
        videoUrl: uploaded.url
      };

      this.status = {
        stage: 'processing',
        message: `Processing ${this.selectedFile.name}...`,
        progress: 100
      };
      this.renderStatus();

      const generatedClips = await processVideo(uploaded.url);
      const clipsToStore = generatedClips.map((clip) => ({
        ...clip,
        thumbnailUrl: '/assets/images/dashboard-mock.png',
        videoUrl: uploaded.url
      }));

      await saveGeneratedClips(user.uid, videoId, clipsToStore);
      await updateVideo(user.uid, videoId, {
        status: 'processed',
        clipsCount: clipsToStore.length
      });

      this.videos = await getUserVideos(user.uid);
      await this.selectVideo(videoId, false);
      this.selectedFile = null;
      if (this.fileInput) this.fileInput.value = '';
      this.renderSelectedFile();
      this.syncSelectionStatus();
      showToast(`Generated ${clipsToStore.length} clips successfully.`, 'success');
    } catch (error) {
      console.error('[ClipsModule] Upload/processing error:', error);
      
      if (videoId) {
        await updateVideo(user.uid, videoId, {
          status: 'failed'
        }).catch(() => {});
      }

      // More specific error messages
      let errorMessage = error.message || 'The clip pipeline failed.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage access denied. Please sign in again.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Upload failed after multiple retries. Check your connection.';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Cross-origin error. Contact support.';
      }

      this.status = {
        stage: 'error',
        message: errorMessage,
        progress: 0
      };
      this.renderStatus();
      showToast(errorMessage, 'error');
    }
  }

  getStatusTitle() {
    const titles = {
      idle: 'Ready to Process',
      selected: 'Ready to Upload',
      uploading: 'Uploading Video',
      processing: 'Processing...',
      complete: 'Clips Ready',
      error: 'Processing Failed'
    };

    return titles[this.status.stage] || 'Clip Pipeline';
  }

  formatSeconds(totalSeconds = 0) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

export const clipsModule = new ClipsModule();
