// Stock photo library — add your downloaded BNI stock images here
const STOCK_PHOTOS = {
  visitor_invite: [
    '/assets/stock/bni-networking-1.jpeg',
    '/assets/stock/bni-networking-2.jpeg'
  ],
  weekly_meeting: [
    '/assets/stock/bni-meeting-1.jpeg',
    '/assets/stock/bni-meeting-2.jpeg'
  ],
  feature_presentation: [
    '/assets/stock/bni-speaker-1.jpeg',
    '/assets/stock/bni-speaker-2.jpeg'
  ],
  default: [
    '/assets/stock/bni-professional-1.jpeg',
  ]
};

// Currently selected photo — defaults to first in category
let selectedPhotoUrl = null;

function getPhotosForCategory(category) {
  return STOCK_PHOTOS[category] || STOCK_PHOTOS['default'];
}

function getDefaultPhoto(category) {
  const photos = getPhotosForCategory(category);
  return photos[0];
}

// Call this whenever you want to apply the photo to the banner
function applyPhotoToBanner(photoUrl, templateKey) {
  selectedPhotoUrl = photoUrl;
  const bannerEl = document.getElementById('banner-preview-container');
  if (!bannerEl) return;

  // Reset main container background
  bannerEl.style.backgroundImage = '';
  
  // Find internal photo wrapper (used in Clean Corporate Split layout)
  const innerPhotoEl = bannerEl.querySelector('.banner-photo-wrapper');
  if (innerPhotoEl) {
    innerPhotoEl.style.backgroundImage = '';
  }

  if (photoUrl) {
    bannerEl.classList.add('has-photo');
    bannerEl.classList.remove('no-photo');
    
    if (innerPhotoEl) {
      // For Clean Corporate Split, apply image to split wrapper directly
      // No heavy overlay needed as there's no text on top of the image!
      innerPhotoEl.style.backgroundImage = `url('${photoUrl}')`;
      innerPhotoEl.style.backgroundSize = 'cover';
      innerPhotoEl.style.backgroundPosition = 'center';
    } else {
      // Full bleed overlays
      let overlay = 'rgba(255, 255, 255, 0.90)'; // Default light tint
      let gradientStyle = '';

      if (templateKey === 'spotlight') {
        // Spotlight/Crimson Bold uses a beautiful gradient overlay:
        // Landscape: Horizontal gradient (solid red on left text side, fading completely on right photo side)
        // Square/Portrait: Vertical gradient (solid red at bottom, fading completely at top)
        const isLandscape = bannerEl.classList.contains('aspect-landscape');
        if (isLandscape) {
          gradientStyle = 'linear-gradient(to right, rgba(207, 32, 48, 0.98) 0%, rgba(207, 32, 48, 0.85) 50%, rgba(207, 32, 48, 0) 100%)';
        } else {
          gradientStyle = 'linear-gradient(to top, rgba(207, 32, 48, 0.98) 0%, rgba(207, 32, 48, 0.85) 50%, rgba(207, 32, 48, 0) 100%)';
        }
      } else if (templateKey === 'gold') {
        overlay = 'rgba(255, 255, 255, 0.91)'; // Soft white/grey tint for gold
        gradientStyle = `linear-gradient(${overlay}, ${overlay})`;
      } else {
        overlay = 'rgba(255, 255, 255, 0.90)'; // Soft white/grey tint for others
        gradientStyle = `linear-gradient(${overlay}, ${overlay})`;
      }

      bannerEl.style.backgroundImage = `
        ${gradientStyle},
        url('${photoUrl}')
      `;
      bannerEl.style.backgroundSize = 'cover';
      bannerEl.style.backgroundPosition = 'center';
    }
  } else {
    bannerEl.classList.remove('has-photo');
    bannerEl.classList.add('no-photo');
  }
}

// Renders the photo thumbnail picker into the sidebar
// Session uploaded photos
let customUploadedPhotos = [];

// Renders the photo thumbnail picker into the sidebar
function renderPhotoSelector(category, templateKey, photoToSelect = null) {
  const container = document.getElementById('photo-selector-container');
  if (!container) return;

  const defaultPhotos = getPhotosForCategory(category);
  // Combine default photos with custom uploaded photos
  const allPhotos = [...defaultPhotos, ...customUploadedPhotos];
  
  const currentPhoto = photoToSelect || selectedPhotoUrl || defaultPhotos[0];

  container.innerHTML = `
    <div class="control-group">
      <label class="form-label" style="margin-bottom: 4px;">DEFAULT SELECTION</label>
      <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:8px; margin-top:8px;">
        ${allPhotos.map((photo, i) => {
          const isCustom = customUploadedPhotos.includes(photo);
          return `
            <div
              class="photo-thumb"
              data-photo="${photo}"
              onclick="selectPhoto('${photo}', '${templateKey}', this)"
              style="
                aspect-ratio: 1;
                background-image: url('${photo}');
                background-size: cover;
                background-position: center;
                border-radius: 6px;
                cursor: pointer;
                position: relative;
                border: 2px solid ${photo === currentPhoto ? '#CF2030' : 'transparent'};
              "
            >
              ${isCustom ? `<span style="position:absolute; top:2px; right:2px; background:#CF2030; color:white; font-size:9px; padding:2px 4px; border-radius:3px; font-weight:bold; line-height:1; pointer-events:none;">User</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center;">
        <button 
          onclick="document.getElementById('photo-upload-input').click()" 
          class="btn-secondary btn-sm" 
          style="flex: 1; font-size: 0.8rem; padding: 6px 12px;">
          📤 Upload Custom Photo
        </button>
        <button 
          onclick="selectPhoto(null, '${templateKey}', null)"
          class="btn-text"
          style="font-size:0.8rem; padding: 6px;">
          Remove Photo
        </button>
      </div>
      
      <input 
        type="file" 
        id="photo-upload-input" 
        accept="image/*" 
        style="display:none;" 
        onchange="handleBackgroundUpload(event, '${templateKey}', '${category}')"
      >
    </div>
  `;

  // Apply photo selection
  applyPhotoToBanner(currentPhoto, templateKey);
}

function selectPhoto(photoUrl, templateKey, thumbEl) {
  // Update border on all thumbs
  document.querySelectorAll('.photo-thumb').forEach(t => {
    t.style.border = '2px solid transparent';
  });
  if (thumbEl) {
    thumbEl.style.border = '2px solid #CF2030';
  }
  applyPhotoToBanner(photoUrl, templateKey);
}

// Global upload handler
window.handleBackgroundUpload = function(event, templateKey, category) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (!customUploadedPhotos.includes(dataUrl)) {
      customUploadedPhotos.push(dataUrl);
    }
    // Re-render and select the custom photo
    renderPhotoSelector(category, templateKey, dataUrl);
  };
  reader.readAsDataURL(file);
};


// BNI Logo HTML — uses the real logo file
// Make sure /assets/bni-logo-red.png exists for light templates
// and /assets/bni-logo-white.png for dark/red templates
function getBNILogo(templateKey) {
  const logoSrc = templateKey === 'spotlight'
    ? '/assets/bni-logo-white.png'
    : '/assets/bni-logo-red.png';

  return `<img 
    src="${logoSrc}" 
    alt="BNI" 
    style="height:40px; display:block;"
    onerror="this.style.display='none'"
  >`;
}

// Layout Helper functions
function getCleanChapterName(settings) {
  return "Lakshya";
}

function getCleanFooterText(copy, settings) {
  const rawText = copy.footerText !== undefined ? copy.footerText : (settings.footerText || '');
  if (!rawText) return '';
  if (rawText.toLowerCase().includes('firebase')) return '';
  return rawText;
}

function getCTAHtml(copy, settings) {
  const link = copy.ctaLink || settings.defaultCta || '';
  const cleanLink = link.trim();
  const hasLink = cleanLink && cleanLink !== '#';
  
  if (hasLink) {
    return `
      <a href="${cleanLink}" target="_blank" style="text-decoration: none; display: inline-block;" onclick="event.stopPropagation();">
        <div class="banner-cta" contenteditable="true" data-field="cta">${copy.cta}</div>
      </a>
    `;
  } else {
    return `
      <div class="banner-cta" contenteditable="true" data-field="cta">${copy.cta}</div>
    `;
  }
}


const BANNER_TEMPLATES = {
  premium: {
    name: "Clean Corporate Split",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      return `
        <div class="banner-content-inner">
          <div class="banner-text-side">
            <div class="banner-header">
              <div style="display:flex; align-items:center; gap:12px;">
                ${getBNILogo('premium')}
                <div class="chapter-badge" contenteditable="true" 
                     data-field="chapterName">${getCleanChapterName(settings)}</div>
              </div>
              <div class="badge-label" contenteditable="true" 
                   data-field="headerLabel">${headerLabel}</div>
            </div>
            <div class="banner-body">
              <h1 class="banner-title" contenteditable="true" 
                  data-field="headline">${copy.headline}</h1>
              <p class="banner-subtitle" contenteditable="true" 
                 data-field="subheadline">${copy.subheadline}</p>
              <ul class="banner-bullets">
                ${copy.bulletPoints.map((pt, idx) => `
                  <li contenteditable="true" data-type="bullet" 
                      data-index="${idx}">${pt}</li>
                `).join('')}
              </ul>
            </div>
            <div class="banner-footer">
              <div class="meta-details">
                <div class="meta-line">
                    🗓️ Date:
                    <strong contenteditable="true" data-field="date">${copy.date}</strong>
                </div>

                <div class="meta-line">
                    ⏰ Time:
                    <strong contenteditable="true" data-field="time">${copy.time}</strong>
                </div>

                <div class="meta-line">
                    📍 Venue:
                    <strong contenteditable="true" data-field="venue">${copy.venue}</strong>
                </div>

                ${copy.visitorPrice ? `
                <div class="meta-line">
                    🎟️ Visitor Pass:
                    <strong contenteditable="true" data-field="visitorPrice">
                        ₹${copy.visitorPrice}
                    </strong>
                </div>
                ` : ''}
              </div>
              ${getCTAHtml(copy, settings)}
            </div>
            <div class="banner-disclaimer" contenteditable="true" 
                 data-field="footerText">${getCleanFooterText(copy, settings)}</div>
          </div>
          <div class="banner-photo-wrapper"></div>
        </div>
      `;
    }
  },

  gold: {
    name: "Minimalist Light",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      const hasBullets = copy.bulletPoints && copy.bulletPoints.filter(pt => pt && pt.trim() !== '').length > 0;
      const bulletsHtml = hasBullets ? `
        <div class="banner-gold-card">
          <ul class="banner-bullets">
            ${copy.bulletPoints.map((pt, idx) => `
              <li contenteditable="true" data-type="bullet" 
                  data-index="${idx}">${pt}</li>
            `).join('')}
          </ul>
        </div>
      ` : '';

      return `
        <div class="banner-content-inner">
          <div class="banner-header">
            <div style="display:flex; align-items:center; gap:12px;">
              ${getBNILogo('gold')}
              <div class="chapter-badge" contenteditable="true" 
                   data-field="chapterName">${getCleanChapterName(settings)}</div>
            </div>
            <div class="badge-label" contenteditable="true" 
                 data-field="headerLabel">${headerLabel}</div>
          </div>
          <div class="banner-body">
            <h1 class="banner-title" contenteditable="true" 
                data-field="headline">${copy.headline}</h1>
            <p class="banner-subtitle" contenteditable="true" 
               data-field="subheadline">${copy.subheadline}</p>
            ${bulletsHtml}
          </div>
          <div class="banner-footer">
            <div class="meta-line">
                    🗓️ Date:
                    <strong contenteditable="true" data-field="date">${copy.date}</strong>
                </div>

                <div class="meta-line">
                    ⏰ Time:
                    <strong contenteditable="true" data-field="time">${copy.time}</strong>
                </div>

                <div class="meta-line">
                    📍 Venue:
                    <strong contenteditable="true" data-field="venue">${copy.venue}</strong>
                </div>

                ${copy.visitorPrice ? `
                <div class="meta-line">
                    🎟️ Visitor Pass:
                    <strong contenteditable="true" data-field="visitorPrice">
                        ₹${copy.visitorPrice}
                    </strong>
                </div>
                ` : ''}
            ${getCTAHtml(copy, settings)}
          </div>
          <div class="banner-disclaimer" contenteditable="true" 
               data-field="footerText">${getCleanFooterText(copy, settings)}</div>
        </div>
      `;
    }
  },

  spotlight: {
    name: "Crimson Split",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      return `
        <div class="banner-content-inner">
          <div class="banner-text-side">
            <div class="banner-header">
              <div style="display:flex; align-items:center; gap:12px;">
                ${getBNILogo('spotlight')}
                <div class="chapter-badge" contenteditable="true" 
                     data-field="chapterName">${getCleanChapterName(settings)}</div>
              </div>
              <div class="badge-label" contenteditable="true" 
                   data-field="headerLabel">${headerLabel}</div>
            </div>
            <div class="banner-body">
              <h1 class="banner-title" contenteditable="true" 
                  data-field="headline">${copy.headline}</h1>
              <p class="banner-subtitle" contenteditable="true" 
                 data-field="subheadline">${copy.subheadline}</p>
              <ul class="banner-bullets">
                ${copy.bulletPoints.map((pt, idx) => pt && pt.trim() !== '' ? `
                  <li contenteditable="true" data-type="bullet" 
                      data-index="${idx}">${pt}</li>
                ` : '').join('')}
              </ul>
            </div>
            <div class="banner-footer">
              <div class="meta-line">
                    🗓️ Date:
                    <strong contenteditable="true" data-field="date">${copy.date}</strong>
                </div>

                <div class="meta-line">
                    ⏰ Time:
                    <strong contenteditable="true" data-field="time">${copy.time}</strong>
                </div>

                <div class="meta-line">
                    📍 Venue:
                    <strong contenteditable="true" data-field="venue">${copy.venue}</strong>
                </div>

                ${copy.visitorPrice ? `
                <div class="meta-line">
                    🎟️ Visitor Pass:
                    <strong contenteditable="true" data-field="visitorPrice">
                        ₹${copy.visitorPrice}
                    </strong>
                </div>
                ` : ''}
              ${getCTAHtml(copy, settings)}
            </div>
            <div class="banner-disclaimer" contenteditable="true" 
                 data-field="footerText">${getCleanFooterText(copy, settings)}</div>
          </div>
          <div class="banner-photo-wrapper"></div>
        </div>
      `;
    }
  }
};

function getHeaderLabel(category) {
  switch (category) {
    case 'visitor_invite':    return 'Visitor Invitation';
    case 'weekly_meeting':    return 'Weekly Meeting Invitation';
    case 'feature_presentation': return 'Speaker Feature Spotlight';
    default:                  return 'BNI Lakshya Presents';
  }
}
