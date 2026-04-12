// ─────────────────────────────────────────────────────────────────
// components/modal.js - Modal Component
// ─────────────────────────────────────────────────────────────────

export class ModalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.render();
    }
  }

  render() {
    this.container.innerHTML = `
      <div id="createPostModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create New Post</h2>
            <button class="modal-close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <form id="createPostForm">

              <!-- Platform Selection -->
              <div class="form-group">
                <label>Select Platforms</label>
                <div class="platform-selector">
                  <label class="platform-checkbox">
                    <input type="checkbox" name="platforms" value="instagram" />
                    <span class="platform-icon">📷</span>
                    <span>Instagram</span>
                  </label>
                  <label class="platform-checkbox">
                    <input type="checkbox" name="platforms" value="tiktok" />
                    <span class="platform-icon">🎵</span>
                    <span>TikTok</span>
                  </label>
                  <label class="platform-checkbox">
                    <input type="checkbox" name="platforms" value="youtube" />
                    <span class="platform-icon">📺</span>
                    <span>YouTube</span>
                  </label>
                </div>
              </div>

              <!-- ── Media Upload Zone ── -->
              <div class="form-group">
                <label>Media <span class="form-label-note">(Optional — image or video, max 10MB)</span></label>

                <!-- Drop zone -->
                <div id="mediaDropZone" class="media-drop-zone">
                  <!-- Default state -->
                  <div id="mediaDropPlaceholder" class="media-drop-placeholder">
                    <div class="media-drop-icon">🖼️</div>
                    <div class="media-drop-title">Drop media here or click to browse</div>
                    <div class="media-drop-hint">Supports: JPEG, PNG, GIF, WebP, MP4, MOV, WebM</div>
                  </div>

                  <!-- Hidden file input -->
                  <input type="file" id="mediaFileInput" class="media-file-input" accept="image/*,video/*" />
                </div>

                <!-- Preview container (hidden until file selected) -->
                <div id="mediaPreviewContainer" class="media-preview-container">
                  <img id="mediaImagePreview" class="media-preview-image hidden" />
                  <video id="mediaVideoPreview" controls muted playsinline class="media-preview-video hidden">
                    Your browser does not support video preview.
                  </video>

                  <!-- Remove media button -->
                  <button type="button" id="removeMediaBtn" class="remove-media-btn">✕</button>
                </div>

                <!-- Upload progress bar -->
                <div id="uploadProgressContainer" class="upload-progress-container">
                  <div class="upload-progress-header">
                    <span>Uploading media...</span>
                    <span id="uploadProgressText">0%</span>
                  </div>
                  <div class="upload-progress-track">
                    <div id="uploadProgressBar" class="progress-bar-fill"></div>
                  </div>
                </div>
              </div>

              <!-- Caption -->
              <div class="form-group">
                <div class="flex-between">
                  <label>Caption</label>
                  <button type="button" class="btn btn-secondary btn-sm" id="generateCaptionBtn">✨ Generate AI Caption</button>
                </div>
                <textarea id="postCaption" placeholder="Write your caption or enter a topic to generate..." rows="5"></textarea>
              </div>

              <!-- Schedule -->
              <div class="form-row">
                <div class="form-group">
                  <div class="flex-between">
                    <label>Schedule Date &amp; Time</label>
                    <button type="button" class="btn btn-secondary btn-sm" id="autoScheduleBtn">⏱ Auto Schedule</button>
                  </div>
                  <input type="datetime-local" id="scheduleDateTime" />
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="saveDraftBtn">Save Draft</button>
                <button type="submit" class="btn btn-primary primary-btn" id="createPostSubmitBtn">Schedule Post</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}
