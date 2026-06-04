// BNI Lakshya Banner Studio SPA Application Controller

const app = {
  // Application State
  state: {
    isAuthenticated: false,
    activeCategory: null, // visitor_invite, weekly_meeting, feature_presentation
    activeAspectRatio: 'square', // square, portrait, landscape
    activeTemplateStyle: 'premium',
    brandSettings: null,
    generatedCopy: null, // copy object returned by AI
    currentCaptions: { whatsapp: '', linkedin: '' }
  },

  // Initialize Application
  init: async function() {
    console.log('Initializing BNI Lakshya Banner Studio...');
    
    // Check local auth token
    const token = localStorage.getItem('bni_auth_token');
    if (token) {
      this.state.isAuthenticated = true;
      document.getElementById('main-nav').classList.remove('hidden');
      this.showScreen('screen-select-type');
    } else {
      this.state.isAuthenticated = false;
      document.getElementById('main-nav').classList.add('hidden');
      this.showScreen('screen-login');
    }

    // Load brand configurations from server
    await this.loadSettings();

    // Initial load of history
    this.loadHistoryList();
  },

  // Load Admin/Brand Settings
  loadSettings: async function() {
    try {
      this.state.brandSettings = await api.getSettings();
      // Initialize admin settings form if admin script is available
      if (typeof admin !== 'undefined') {
        admin.initFormValues(this.state.brandSettings);
      }
    } catch (err) {
      console.warn('Could not load settings from server. Loading local defaults.');
      this.state.brandSettings = {
        chapterName: 'BNI Lakshya',
        primaryColor: '#CF142B',
        secondaryColor: '#D4AF37',
        fontPrimary: 'Montserrat',
        fontSecondary: 'Inter',
        footerText: 'BNI Lakshya Pune Chapter • Together Everyone Achieves More',
        defaultVenue: 'Conrad Pune, Mangaldas Rd',
        defaultTime: 'Thursday, 7:15 AM',
        defaultCta: 'DM us to attend as a visitor'
      };
    }
  },

  // Handle Login Form Submit
  handleLogin: async function(event) {
    event.preventDefault();
    const codeInput = document.getElementById('access-code');
    const errorMsg = document.getElementById('login-error');
    if (!codeInput) return;

    errorMsg.classList.add('hidden');
    const code = codeInput.value.trim();

    try {
      const response = await api.login(code);
      if (response.success) {
        localStorage.setItem('bni_auth_token', response.token);
        this.state.isAuthenticated = true;
        
        utils.showToast('Login successful! Welcome to the workspace.');
        codeInput.value = '';
        
        document.getElementById('main-nav').classList.remove('hidden');
        this.showScreen('screen-select-type');
      }
    } catch (err) {
      errorMsg.textContent = err.message || 'Invalid access code.';
      errorMsg.classList.remove('hidden');
      codeInput.focus();
    }
  },

  // Logout application
  logout: function() {
    localStorage.removeItem('bni_auth_token');
    this.state.isAuthenticated = false;
    document.getElementById('main-nav').classList.add('hidden');
    this.showScreen('screen-login');
    utils.showToast('Logged out of workspace.');
  },

  // Screen router logic
  showScreen: function(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));

    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo(0, 0);
    }

    // Handle active tab highlighting in nav bar
    const navBtnMap = {
      'screen-select-type': 'nav-btn-create',
      'screen-wizard-form': 'nav-btn-create',
      'screen-copy-review': 'nav-btn-create',
      'screen-preview-export': 'nav-btn-create',
      'screen-history': 'nav-btn-history',
      'screen-admin': 'nav-btn-admin'
    };

    const activeBtnId = navBtnMap[screenId];
    document.querySelectorAll('.nav-link').forEach(btn => {
      if (btn.id === activeBtnId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Refresh history grid if entering history screen
    if (screenId === 'screen-history') {
      this.loadHistoryList();
    }
  },

  // Start Form Wizard setup
  startWizard: function(category) {
    this.state.activeCategory = category;
    const dynamicContainer = document.getElementById('dynamic-fields');
    const titleEl = document.getElementById('wizard-title');
    const descEl = document.getElementById('wizard-desc');
    const settings = this.state.brandSettings;

    if (!dynamicContainer || !settings) return;

    // Reset validations
    document.getElementById('form-validation-error').classList.add('hidden');

    let html = '';

    if (category === 'visitor_invite') {
      titleEl.textContent = 'Create Visitor Invite Banner';
      descEl.textContent = 'Invite specific business professionals (e.g. Architects, Marketers) to explore connection points.';
      html = `
        <div class="form-group">
          <label for="input-visitor-category">Business Category to Invite *</label>
          <input type="text" id="input-visitor-category" placeholder="e.g. Makeup Artist, Interior Designer, HR Consultant" required>
        </div>
        <div class="form-group">
          <label for="input-opportunities">Opportunities / Target Connectors *</label>
          <textarea id="input-opportunities" rows="3" placeholder="Who can they connect with? e.g. wedding planners, professional photographers, event managers, corporate clients" required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label for="input-date">Meeting Date</label>
            <input type="text" id="input-date" value="Upcoming Thursday">
          </div>
          <div class="form-group col">
            <label for="input-time">Meeting Time</label>
            <input type="text" id="input-time" value="${settings.defaultTime}">
          </div>
        </div>
        <div class="form-group">
          <label for="input-venue">Meeting Venue</label>
          <input type="text" id="input-venue" value="${settings.defaultVenue}">
        </div>
        <div class="form-group">
          <label for="input-cta">CTA Button Text</label>
          <input type="text" id="input-cta" value="${settings.defaultCta}">
        </div>
      `;
    } else if (category === 'weekly_meeting') {
      titleEl.textContent = 'Weekly Meeting Invite';
      descEl.textContent = 'Announce and promote the general weekly meeting of BNI Lakshya.';
      html = `
        <div class="form-group">
          <label for="input-visitor-category">Featured Category Focus (Optional)</label>
          <input type="text" id="input-visitor-category" placeholder="e.g. Realtors, Chartered Accountants (Leave blank for generic meeting post)">
        </div>
        <div class="form-group">
          <label for="input-reason">Key Reason to Attend *</label>
          <textarea id="input-reason" rows="3" placeholder="e.g. Pitch your business to 50+ Pune business owners, explore structured referrals, and grow direct channels" required>Pitch your business to 50+ active business owners in Pune and build a qualified referral channel.</textarea>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label for="input-date">Meeting Date</label>
            <input type="text" id="input-date" value="Upcoming Thursday">
          </div>
          <div class="form-group col">
            <label for="input-time">Meeting Time</label>
            <input type="text" id="input-time" value="${settings.defaultTime}">
          </div>
        </div>
        <div class="form-group">
          <label for="input-venue">Meeting Venue</label>
          <input type="text" id="input-venue" value="${settings.defaultVenue}">
        </div>
        <div class="form-group">
          <label for="input-cta">CTA Button Text</label>
          <input type="text" id="input-cta" value="${settings.defaultCta}">
        </div>
      `;
    } else if (category === 'feature_presentation') {
      titleEl.textContent = 'Feature Presentation Announcement';
      descEl.textContent = 'Celebrate and announce a member\'s upcoming 10-minute presentation slot.';
      html = `
        <div class="form-row">
          <div class="form-group col">
            <label for="input-speaker-name">Speaker Name *</label>
            <input type="text" id="input-speaker-name" placeholder="e.g. Rohit Sharma" required>
          </div>
          <div class="form-group col">
            <label for="input-company-name">Company Name *</label>
            <input type="text" id="input-company-name" placeholder="e.g. Sharma Architects" required>
          </div>
        </div>
        <div class="form-group">
          <label for="input-visitor-category">Business Category *</label>
          <input type="text" id="input-visitor-category" placeholder="e.g. Landscape Architect, Digital Marketer" required>
        </div>
        <div class="form-group">
          <label for="input-topic">Presentation Topic *</label>
          <input type="text" id="input-topic" placeholder="e.g. Design secrets of high-yield commercial spaces" required>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label for="input-date">Presentation Date</label>
            <input type="text" id="input-date" value="Upcoming Thursday">
          </div>
          <div class="form-group col">
            <label for="input-time">Meeting Time</label>
            <input type="text" id="input-time" value="${settings.defaultTime}">
          </div>
        </div>
        <div class="form-group">
          <label for="input-venue">Meeting Venue</label>
          <input type="text" id="input-venue" value="${settings.defaultVenue}">
        </div>
        <div class="form-group">
          <label for="input-cta">CTA Button Text</label>
          <input type="text" id="input-cta" value="${settings.defaultCta}">
        </div>
      `;
    }

    dynamicContainer.innerHTML = html;
    this.showScreen('screen-wizard-form');
    
    // Focus first input field
    const firstInput = dynamicContainer.querySelector('input, textarea');
    if (firstInput) firstInput.focus();
  },

  // Submit wizard form and call backend
  handleFormSubmit: async function(event) {
    event.preventDefault();
    const settings = this.state.brandSettings;
    if (!settings) return;

    const validationFields = [];
    if (this.state.activeCategory === 'visitor_invite') {
      validationFields.push('input-visitor-category', 'input-opportunities');
    } else if (this.state.activeCategory === 'weekly_meeting') {
      validationFields.push('input-reason');
    } else if (this.state.activeCategory === 'feature_presentation') {
      validationFields.push('input-speaker-name', 'input-company-name', 'input-visitor-category', 'input-topic');
    }

    // Client-side validation
    const isValid = utils.validateFormInputs(validationFields);
    const validationError = document.getElementById('form-validation-error');
    
    if (!isValid) {
      validationError.classList.remove('hidden');
      utils.showToast('Please fill in all required fields.');
      return;
    }
    validationError.classList.add('hidden');

    // Collect inputs
    const selectedRatio = document.querySelector('input[name="aspectRatio"]:checked').value;
    this.state.activeAspectRatio = selectedRatio;

    const payload = {
      category: this.state.activeCategory,
      visitorCategory: document.getElementById('input-visitor-category') ? document.getElementById('input-visitor-category').value.trim() : '',
      opportunities: document.getElementById('input-opportunities') ? document.getElementById('input-opportunities').value.trim() : '',
      date: document.getElementById('input-date') ? document.getElementById('input-date').value.trim() : 'Upcoming Thursday',
      time: document.getElementById('input-time') ? document.getElementById('input-time').value.trim() : settings.defaultTime,
      venue: document.getElementById('input-venue') ? document.getElementById('input-venue').value.trim() : settings.defaultVenue,
      cta: document.getElementById('input-cta') ? document.getElementById('input-cta').value.trim() : settings.defaultCta,
      
      // Feature presentation fields
      speakerName: document.getElementById('input-speaker-name') ? document.getElementById('input-speaker-name').value.trim() : '',
      companyName: document.getElementById('input-company-name') ? document.getElementById('input-company-name').value.trim() : '',
      topic: document.getElementById('input-topic') ? document.getElementById('input-topic').value.trim() : '',
      
      // Weekly meeting fields
      reason: document.getElementById('input-reason') ? document.getElementById('input-reason').value.trim() : ''
    };

    // Show loading skeleton
    this.showScreen('screen-loading');
    
    // Animate loader text messages dynamically
    this.animateLoaderText();

    try {
      const result = await api.generateCopy(payload);
      
      if (result.success) {
        // Enforce the inputted logistics into the copy state
        const copy = result.copy;
        copy.category = this.state.activeCategory;
        copy.date = payload.date;
        copy.time = payload.time;
        copy.venue = payload.venue;
        
        // Ensure bulletPoints is an array
        if (!Array.isArray(copy.bulletPoints)) {
          copy.bulletPoints = ['Opportunity 1', 'Opportunity 2', 'Opportunity 3'];
        }

        this.state.generatedCopy = copy;
        
        // Update engine badge
        document.getElementById('ai-engine-used').textContent = result.engine || 'Gemini AI';
        
        // Show copy review editor
        this.populateCopyReview();
        this.showScreen('screen-copy-review');
      }
    } catch (err) {
      console.error(err);
      utils.showToast(err.message || 'API request failed. Try again.');
      this.showScreen('screen-wizard-form');
    }
  },

  // Animate loading subtitles
  animateLoaderText: function() {
    const subtitles = [
      "Analyzing business networking patterns...",
      "Structuring growth opportunities...",
      "Refining high-impact BNI copywriting guidelines...",
      "Gemini is generating caption variants for WhatsApp and LinkedIn..."
    ];
    let idx = 0;
    const loaderSub = document.getElementById('loader-sub');
    
    if (this.loaderInterval) clearInterval(this.loaderInterval);
    
    this.loaderInterval = setInterval(() => {
      if (!document.getElementById('screen-loading').classList.contains('hidden')) {
        loaderSub.textContent = subtitles[idx];
        idx = (idx + 1) % subtitles.length;
      } else {
        clearInterval(this.loaderInterval);
      }
    }, 1500);
  },

  // Fill in fields in the Editor Screen
  populateCopyReview: function() {
    const copy = this.state.generatedCopy;
    if (!copy) return;

    document.getElementById('edit-headline').value = copy.headline || '';
    document.getElementById('edit-subheadline').value = copy.subheadline || '';
    document.getElementById('edit-cta').value = copy.cta || '';

    // Populate points
    const pointsList = document.getElementById('edit-points-list');
    pointsList.innerHTML = '';
    
    copy.bulletPoints.forEach((pt, idx) => {
      this.renderPointInputRow(pt, idx);
    });
  },

  // Render a bullet point edit row
  renderPointInputRow: function(text, index) {
    const pointsList = document.getElementById('edit-points-list');
    const row = document.createElement('div');
    row.className = 'point-input-row';
    row.dataset.index = index;
    row.innerHTML = `
      <input type="text" class="point-input" value="${text}" placeholder="Bullet point under 5 words" required>
      <button type="button" class="btn-remove-point" onclick="app.removePointInput(${index})">✕</button>
    `;
    pointsList.appendChild(row);
  },

  // Add new blank row in points editor
  addNewPointInput: function() {
    const pointsList = document.getElementById('edit-points-list');
    const newIdx = pointsList.children.length;
    
    if (newIdx >= 6) {
      utils.showToast('Maximum 6 bullet points allowed for visual sizing.');
      return;
    }
    
    this.renderPointInputRow('', newIdx);
  },

  // Remove point input row
  removePointInput: function(index) {
    const row = document.querySelector(`.point-input-row[data-index="${index}"]`);
    if (row) {
      row.remove();
      // Re-index remaining elements
      const rows = document.querySelectorAll('.point-input-row');
      rows.forEach((r, idx) => {
        r.dataset.index = idx;
        const removeBtn = r.querySelector('.btn-remove-point');
        removeBtn.setAttribute('onclick', `app.removePointInput(${idx})`);
      });
    }
  },

  // Proceed from Editor to Visual Canvas Selection
  proceedToTemplateSelection: function() {
    const copy = this.state.generatedCopy;
    if (!copy) return;

    // Gather edited inputs
    copy.headline = document.getElementById('edit-headline').value.trim();
    copy.subheadline = document.getElementById('edit-subheadline').value.trim();
    copy.cta = document.getElementById('edit-cta').value.trim();

    const bulletPoints = [];
    document.querySelectorAll('.point-input').forEach(input => {
      if (input.value.trim()) {
        bulletPoints.push(input.value.trim());
      }
    });

    copy.bulletPoints = bulletPoints;

    // Render active design style onto canvas preview
    bannerRenderer.render(
      copy, 
      this.state.brandSettings, 
      this.state.activeTemplateStyle, 
      this.state.activeAspectRatio
    );

    // Render social captions
    this.updateCaptionsText();

    // Show Preview / Export screen
    this.showScreen('screen-preview-export');
    
    // Set aspect ratio info tag
    const ratioInfo = {
      'square': '1080 x 1080 px (Square)',
      'portrait': '1080 x 1920 px (Portrait Status)',
      'landscape': '1920 x 1080 px (Landscape 16:9)'
    };
    document.getElementById('preview-dimensions-info').textContent = ratioInfo[this.state.activeAspectRatio];
  },

  // Reformat text box values if template contents change
  updateCaptionsText: function() {
    const copy = this.state.generatedCopy;
    const settings = this.state.brandSettings;
    if (!copy || !settings) return;

    const finalDate = copy.date || 'Thursday';
    const finalTime = copy.time || settings.defaultTime;
    const finalVenue = copy.venue || settings.defaultVenue;
    const finalCta = copy.cta || settings.defaultCta;
    
    let whatsappText = '';
    let linkedinText = '';

    if (copy.category === 'visitor_invite') {
      const cat = copy.visitorCategory || 'Professionals';
      const bulletStr = copy.bulletPoints.map(p => `• Collaborate with ${p}`).join('\n');
      
      whatsappText = `*BNI Lakshya Chapter Pune is inviting ${cat}s!*\n\nLooking to scale your business? Visit our chapter meeting and explore business opportunities. Connect directly with our core connectors:\n\n${bulletStr}\n\n🗓️ *Meeting Details:*\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n📍 Venue: ${finalVenue}\n\n👉 *Join as Visitor:* DM us or click to RSVP. ${finalCta}!`;
      
      linkedinText = `Are you a ${cat} in Pune looking for structured word-of-mouth business referrals? \n\nBNI Lakshya is hosting an exclusive business meeting inviting premium ${cat}s. Meet over 50+ business founders and connectors who can introduce you to wedding planners, high-value corporate accounts, salon chains, and property developers. \n\nMeeting Details:\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n🏢 Venue: ${finalVenue}\n\nTo lock in an invitation, leave a comment below or send a direct message. \n\n#BNI_Lakshya #BNILakshya #PuneBusiness #Networking #Referrals #GiversGain`;
    } else {
      whatsappText = `*Maximize Your Referrals at BNI Lakshya!*\n\nPitch your business to 50+ business leaders this week. \n\n🗓️ *Meeting Details:*\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n📍 Venue: ${finalVenue}\n\n👉 *CTA:* DM to reserve visitor seat.`;
      
      linkedinText = `Expand your referral network in Pune. BNI Lakshya invites founders and industry professionals to attend our next high-energy chapter meeting. \n\n📅 Date: ${finalDate}\n⏰ Time: ${finalTime}\n🏢 Venue: ${finalVenue}\n\nDM to secure guest registration code.`;
    }

    // Set textarea boxes
    document.getElementById('whatsapp-caption-text').value = whatsappText;
    document.getElementById('linkedin-caption-text').value = linkedinText;
    
    this.state.currentCaptions.whatsapp = whatsappText;
    this.state.currentCaptions.linkedin = linkedinText;
  },

  // Toggle template styles in sidebar
  changeTemplateStyle: function(styleId) {
    this.state.activeTemplateStyle = styleId;
    
    // Toggle button active state
    document.querySelectorAll('.btn-style').forEach(btn => {
      if (btn.getAttribute('onclick').includes(styleId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Re-render
    bannerRenderer.render(
      this.state.generatedCopy,
      this.state.brandSettings,
      styleId,
      this.state.activeAspectRatio
    );
  },

  // Render & Export PNG
  exportBannerPng: async function() {
    try {
      const result = await bannerRenderer.exportPng();
      
      // Save item to client-side localStorage history
      const historyItem = {
        id: 'banner_' + Date.now(),
        category: this.state.activeCategory,
        aspectRatio: this.state.activeAspectRatio,
        style: this.state.activeTemplateStyle,
        visitorCategory: this.state.generatedCopy.visitorCategory || 'Invite',
        timestamp: new Date().toISOString(),
        imageUrl: result.dataUrl, // stored base64 image data string
        copy: this.state.generatedCopy
      };

      utils.saveBannerToHistory(historyItem);
      utils.showToast('Banner downloaded and logged to history!');
    } catch (err) {
      console.error(err);
    }
  },

  // Switch tabs on Social Captions
  switchCaptionTab: function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('onclick').includes(tabId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tabId === 'whatsapp') {
      document.getElementById('caption-whatsapp').classList.remove('hidden');
      document.getElementById('caption-linkedin').classList.add('hidden');
    } else {
      document.getElementById('caption-whatsapp').classList.add('hidden');
      document.getElementById('caption-linkedin').classList.remove('hidden');
    }
  },

  // Copy caption text to clipboard
  copyCaption: function(tabId) {
    const textarea = document.getElementById(`${tabId}-caption-text`);
    if (!textarea) return;

    textarea.select();
    textarea.setSelectionRange(0, 99999); // Mobile
    
    navigator.clipboard.writeText(textarea.value)
      .then(() => {
        utils.showToast(`${tabId === 'whatsapp' ? 'WhatsApp' : 'LinkedIn'} caption copied to clipboard!`);
      })
      .catch(() => {
        utils.showToast('Failed to copy. Double-click text to copy manually.');
      });
  },

  // Draw History Items
  loadHistoryList: function() {
    const history = utils.getHistory();
    const grid = document.getElementById('history-grid');
    const emptyState = document.getElementById('history-empty-state');
    
    if (!grid || !emptyState) return;

    if (history.length === 0) {
      grid.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    grid.innerHTML = history.map(item => {
      const typeLabel = getHeaderLabel(item.category);
      const categoryTag = item.category || 'visitor_invite';
      const cleanDate = utils.formatDate(item.timestamp);
      
      return `
        <div class="history-card" id="history-card-${item.id}">
          <div class="history-thumbnail-wrapper">
            <img src="${item.imageUrl}" class="history-thumb-img" alt="Banner Thumbnail">
          </div>
          <div class="history-card-body">
            <span class="history-meta-tag ${categoryTag}">${typeLabel}</span>
            <h4>${item.visitorCategory} (${item.aspectRatio})</h4>
            <div class="history-date">Generated: ${cleanDate}</div>
            <div class="history-card-actions">
              <button class="btn-primary btn-sm" onclick="app.redownloadHistory('${item.id}')">Download</button>
              <button class="btn-secondary btn-sm" onclick="app.loadHistoryToWorkspace('${item.id}')">Edit</button>
              <button class="btn-text btn-sm" style="color: var(--error);" onclick="app.deleteHistory('${item.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Direct trigger download of history item image
  redownloadHistory: function(id) {
    const history = utils.getHistory();
    const item = history.find(i => i.id === id);
    if (!item) return;

    const link = document.createElement('a');
    link.download = `BNI_Lakshya_${item.aspectRatio}_${item.visitorCategory.replace(/[^a-zA-Z0-9]/g, '_')}_Redownload.png`;
    link.href = item.imageUrl;
    link.click();
    utils.showToast('Re-downloaded history banner!');
  },

  // Load history data back into active workspace editor
  loadHistoryToWorkspace: function(id) {
    const history = utils.getHistory();
    const item = history.find(i => i.id === id);
    if (!item) return;

    this.state.activeCategory = item.category;
    this.state.activeAspectRatio = item.aspectRatio;
    this.state.activeTemplateStyle = item.style;
    this.state.generatedCopy = item.copy;

    this.populateCopyReview();
    this.showScreen('screen-copy-review');
    utils.showToast('Loaded banner copy to workspace editor.');
  },

  // Delete history item
  deleteHistory: function(id) {
    if (confirm('Are you sure you want to delete this banner from history?')) {
      utils.deleteHistoryItem(id);
      const card = document.getElementById(`history-card-${id}`);
      if (card) card.remove();
      this.loadHistoryList(); // check empty states
      utils.showToast('Deleted item from history.');
    }
  }
};

// Start application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
