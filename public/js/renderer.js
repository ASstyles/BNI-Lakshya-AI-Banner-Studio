console.log("renderer.js loaded");

const bannerRenderer = {
  // Current active data
  currentCopy: null,
  currentSettings: null,
  currentStyle: 'premium',
  currentAspectRatio: 'square',

  // Initialize and inject template copy
  render: function(copy, settings, style = 'premium', aspectRatio = 'square') {
    this.currentCopy = copy;
    this.currentSettings = settings;
    this.currentStyle = style;
    this.currentAspectRatio = aspectRatio;

    const container = document.getElementById('banner-preview-container');
    if (!container) return;

    // Reset classes
    container.className = '';

    // Add layout and style classes
    container.classList.add(`aspect-${aspectRatio}`);
    container.classList.add(`template-${style}`);

    // Reset any previously applied background photo
    container.style.backgroundImage = '';
    container.style.backgroundSize = '';
    container.style.backgroundPosition = '';

    // Retrieve template renderer
    const template = BANNER_TEMPLATES[style];
    if (!template) {
      console.error(`Template style ${style} not found.`);
      return;
    }

    // Inject HTML
    container.innerHTML = template.render(copy, settings);

    // Bind event listeners to edit fields locally in real-time
    this.bindEditorEvents(container);

    // Resize container preview to fit viewport nicely
    this.adjustPreviewSize();

    // Trigger photo selector UI in sidebar after render
    if (typeof renderPhotoSelector === 'function') {
      renderPhotoSelector(copy.category, style);
    }
  },

  // Bind keyup/input listeners for editable elements to sync changes back to currentCopy
  bindEditorEvents: function(container) {
    const editables = container.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
      el.addEventListener('input', (e) => {
        const field = el.dataset.field;
        const type = el.dataset.type;
        const index = el.dataset.index;
        const val = el.textContent.trim();

        if (field) {
          this.currentCopy[field] = val;
        } else if (type === 'bullet' && index !== undefined) {
          this.currentCopy.bulletPoints[parseInt(index)] = val;
        }

        // Dynamic caption updates if text is edited
        if (typeof app !== 'undefined' && app.updateCaptionsText) {
          app.updateCaptionsText();
        }
      });
    });
  },

  // Calculate scaling factor to display 1080px or 1920px canvas within current viewport
  adjustPreviewSize: function() {
    const parent = document.querySelector('.canvas-scale-wrapper');
    const preview = document.getElementById('banner-preview-container');
    if (!parent || !preview) return;

    const parentWidth = parent.clientWidth - 40; // 20px padding each side
    const parentHeight = 520; // fixed minimum stage height

    let targetWidth = 1080;
    let targetHeight = 1080;

    if (this.currentAspectRatio === 'portrait') {
      targetWidth = 1080;
      targetHeight = 1920;
    } else if (this.currentAspectRatio === 'landscape') {
      targetWidth = 1920;
      targetHeight = 1080;
    }

    // Find fit scale
    const scaleX = parentWidth / targetWidth;
    const scaleY = parentHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY, 0.45); // Max display scale is 0.45 for safety

    preview.style.transform = `scale(${scale})`;

    // Set parent height to match scaled canvas height
    parent.style.height = `${(targetHeight * scale) + 40}px`;
  },

  // Arial and Helvetica Neue are system fonts — no loading needed
  ensureFontsLoaded: async function() {
    try {
      await document.fonts.ready;
      return true;
    } catch (err) {
      console.warn('Font check failed, using system fonts.', err);
      return false;
    }
  },

  // Render HTML element to PNG and trigger download
  exportPng: async function(triggerDownload = true) {
    const preview = document.getElementById('banner-preview-container');
    if (!preview) return;

    utils.showToast('Rendering high-resolution image...');

    // Load fonts first
    await this.ensureFontsLoaded();

    // Disable scaling transform temporarily so html2canvas renders the actual size
    const originalTransform = preview.style.transform;
    const originalPosition = preview.style.position;

    preview.style.transform = 'none';
    preview.style.position = 'relative';

    try {
      // Small pause to let DOM paint
      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(preview, {
        scale: 2,
        backgroundColor: null, // transparent — template provides its own background
        useCORS: true,
        logging: false          // turn off noisy console logs
      });

      console.log("Canvas Width:", canvas.width);
      console.log("Canvas Height:", canvas.height);

      const dataUrl = canvas.toDataURL("image/png");

      console.log("Data URL Length:", dataUrl.length);
      console.log("Data URL Start:", dataUrl.substring(0, 50));

      // Restore style transforms
      preview.style.transform = originalTransform;
      preview.style.position = originalPosition;

      // Create download filename
      const categoryName = this.currentCopy.visitorCategory || 'Invite';
      const cleanCategory = categoryName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `BNI_Lakshya_${this.currentAspectRatio}_${cleanCategory}.png`;

      // Trigger download
      if (triggerDownload) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }

      // Return data so we can log to history
      return {
        dataUrl: dataUrl,
        filename: filename
      };

    } catch (err) {
      // Revert styles on failure
      preview.style.transform = originalTransform;
      preview.style.position = originalPosition;
      console.error('Canvas export error:', err);
      utils.showToast('Failed to export banner. Try again.');
      throw err;
    }
  }
};

// Window resize adjust listener
window.addEventListener('resize', () => {
  if (
    document.getElementById('screen-preview-export') &&
    !document.getElementById('screen-preview-export').classList.contains('hidden')
  ) {
    bannerRenderer.adjustPreviewSize();
  }
});

window.bannerRenderer = bannerRenderer;

console.log("renderer.js finished");
console.log(window.bannerRenderer);
