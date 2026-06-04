const BANNER_TEMPLATES = {
  premium: {
    name: "Premium Corporate",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      return `
        <div class="banner-content-inner">
          <div class="banner-header">
            <div class="chapter-badge" contenteditable="true" data-field="chapterName">${settings.chapterName || 'BNI Lakshya'}</div>
            <div class="badge-label" contenteditable="true" data-field="headerLabel">${headerLabel}</div>
          </div>
          <div class="banner-body">
            <h1 class="banner-title" contenteditable="true" data-field="headline">${copy.headline}</h1>
            <p class="banner-subtitle" contenteditable="true" data-field="subheadline">${copy.subheadline}</p>
            <ul class="banner-bullets">
              ${copy.bulletPoints.map((pt, idx) => `
                <li contenteditable="true" data-type="bullet" data-index="${idx}">${pt}</li>
              `).join('')}
            </ul>
          </div>
          <div class="banner-footer">
            <div class="meta-details">
              <div class="meta-line">🗓️ Date: <strong contenteditable="true" data-field="date">${copy.date}</strong></div>
              <div class="meta-line">⏰ Time: <strong contenteditable="true" data-field="time">${copy.time}</strong></div>
              <div class="meta-line">📍 Venue: <strong contenteditable="true" data-field="venue">${copy.venue}</strong></div>
            </div>
            <div class="banner-cta" contenteditable="true" data-field="cta">${copy.cta}</div>
          </div>
          <div class="banner-disclaimer" contenteditable="true" data-field="footerText">${copy.footerText !== undefined ? copy.footerText : (settings.footerText || '')}</div>
        </div>
      `;
    }
  },
  gold: {
    name: "Golden Opportunity",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      return `
        <div class="banner-content-inner">
          <div class="banner-header">
            <div class="chapter-badge" contenteditable="true" data-field="chapterName">${settings.chapterName || 'BNI Lakshya'}</div>
            <div class="badge-label" contenteditable="true" data-field="headerLabel">${headerLabel}</div>
          </div>
          <div class="banner-body">
            <h1 class="banner-title" contenteditable="true" data-field="headline">${copy.headline}</h1>
            <p class="banner-subtitle" contenteditable="true" data-field="subheadline">${copy.subheadline}</p>
            <ul class="banner-bullets">
              ${copy.bulletPoints.map((pt, idx) => `
                <li contenteditable="true" data-type="bullet" data-index="${idx}">${pt}</li>
              `).join('')}
            </ul>
          </div>
          <div class="banner-footer">
            <div class="meta-details">
              <div class="meta-line">🗓️ Date: <strong contenteditable="true" data-field="date">${copy.date}</strong></div>
              <div class="meta-line">⏰ Time: <strong contenteditable="true" data-field="time">${copy.time}</strong></div>
              <div class="meta-line">📍 Venue: <strong contenteditable="true" data-field="venue">${copy.venue}</strong></div>
            </div>
            <div class="banner-cta" contenteditable="true" data-field="cta">${copy.cta}</div>
          </div>
          <div class="banner-disclaimer" contenteditable="true" data-field="footerText">${copy.footerText !== undefined ? copy.footerText : (settings.footerText || '')}</div>
        </div>
      `;
    }
  },
  spotlight: {
    name: "Spotlight Focus",
    render: (copy, settings) => {
      const headerLabel = getHeaderLabel(copy.category);
      return `
        <div class="banner-content-inner">
          <div class="banner-header">
            <div class="chapter-badge" contenteditable="true" data-field="chapterName">${settings.chapterName || 'BNI Lakshya'}</div>
            <div class="badge-label" contenteditable="true" data-field="headerLabel">${headerLabel}</div>
          </div>
          <div class="banner-body">
            <h1 class="banner-title" contenteditable="true" data-field="headline">${copy.headline}</h1>
            <p class="banner-subtitle" contenteditable="true" data-field="subheadline">${copy.subheadline}</p>
            <ul class="banner-bullets">
              ${copy.bulletPoints.map((pt, idx) => `
                <li contenteditable="true" data-type="bullet" data-index="${idx}">${pt}</li>
              `).join('')}
            </ul>
          </div>
          <div class="banner-footer">
            <div class="meta-details">
              <div class="meta-line">🗓️ Date: <strong contenteditable="true" data-field="date">${copy.date}</strong> • Time: <strong contenteditable="true" data-field="time">${copy.time}</strong></div>
              <div class="meta-line">📍 Venue: <strong contenteditable="true" data-field="venue">${copy.venue}</strong></div>
            </div>
            <div class="banner-cta" contenteditable="true" data-field="cta">${copy.cta}</div>
          </div>
          <div class="banner-disclaimer" contenteditable="true" data-field="footerText">${copy.footerText !== undefined ? copy.footerText : (settings.footerText || '')}</div>
        </div>
      `;
    }
  }
};

function getHeaderLabel(category) {
  switch (category) {
    case 'visitor_invite':
      return 'Visitor Invitation';
    case 'weekly_meeting':
      return 'Weekly Meeting Invitation';
    case 'feature_presentation':
      return 'Speaker Feature Spotlight';
    default:
      return 'BNI Lakshya Presents';
  }
}
