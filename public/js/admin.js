// BNI Lakshya Banner Studio Admin Panel Controller

const admin = {
  // Populate form with current settings values
  initFormValues: function(settings) {
    if (!settings) return;

    // Brand settings
    document.getElementById('admin-chapter-name').value = settings.chapterName || 'BNI Lakshya';
    document.getElementById('admin-footer-text').value = settings.footerText || '';
    
    // Primary Color
    document.getElementById('admin-primary-color').value = settings.primaryColor || '#CF142B';
    document.getElementById('admin-primary-color-hex').value = settings.primaryColor || '#CF142B';

    // Secondary Color
    document.getElementById('admin-secondary-color').value = settings.secondaryColor || '#C8C8C8';
    document.getElementById('admin-secondary-color-hex').value = settings.secondaryColor || '#C8C8C8';

    // Meeting defaults
    document.getElementById('admin-default-time').value = settings.defaultTime || 'Thursday, 7:15 AM';
    document.getElementById('admin-default-venue').value = settings.defaultVenue || '';
    document.getElementById('admin-default-cta').value = settings.defaultCta || '';

    // API Keys
    document.getElementById('admin-gemini-key').value = settings.geminiApiKey || '';
    document.getElementById('admin-grok-key').value = settings.grokApiKey || '';

    // Errors count and last reset
    const lastReset = settings.lastResetTime || 'Never';
    document.getElementById('admin-error-count').innerHTML = `
      ${settings.errorCount || 0} calls 
      <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal; margin-left: 0.5rem;">
        (Last reset: ${lastReset})
      </span>
    `;

    // Bind color picker helpers
    this.bindColorPickerEvents('admin-primary-color', 'admin-primary-color-hex');
    this.bindColorPickerEvents('admin-secondary-color', 'admin-secondary-color-hex');
  },

  // Bidirectional binding between Color Picker input and Hex Text input
  bindColorPickerEvents: function(pickerId, textId) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (!picker || !text) return;

    picker.addEventListener('input', (e) => {
      text.value = e.target.value.toUpperCase();
    });

    text.addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) {
        val = '#' + val;
      }
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        picker.value = val;
      }
    });
  },

  // Save Settings Form
  saveSettings: async function(event) {
    event.preventDefault();

    const successMsg = document.getElementById('admin-save-success');
    const errorMsg = document.getElementById('admin-save-error');
    if (!successMsg || !errorMsg) return;

    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    const settingsData = {
      chapterName: document.getElementById('admin-chapter-name').value.trim(),
      footerText: document.getElementById('admin-footer-text').value.trim(),
      primaryColor: document.getElementById('admin-primary-color').value,
      secondaryColor: document.getElementById('admin-secondary-color').value,
      defaultTime: document.getElementById('admin-default-time').value.trim(),
      defaultVenue: document.getElementById('admin-default-venue').value.trim(),
      defaultCta: document.getElementById('admin-default-cta').value.trim(),
      geminiApiKey: document.getElementById('admin-gemini-key').value.trim(),
      grokApiKey: document.getElementById('admin-grok-key').value.trim()
    };

    try {
      const response = await api.updateSettings(settingsData);
      if (response.success) {
        // Update local memory state in app
        app.state.brandSettings = response.settings;
        
        // Dynamic color variable updates on body element for custom rendering if needed
        document.documentElement.style.setProperty('--bni-crimson', response.settings.primaryColor);
        document.documentElement.style.setProperty('--bni-gold', response.settings.secondaryColor);

        successMsg.classList.remove('hidden');
        utils.showToast('Settings saved successfully!');
        
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Auto-hide success banner
        setTimeout(() => {
          successMsg.classList.add('hidden');
        }, 4000);
      }
    } catch (err) {
      errorMsg.textContent = err.message || 'Failed to save settings.';
      errorMsg.classList.remove('hidden');
      utils.showToast('Error saving settings config.');
    }
  },

  // Clear errors tracker logs count
  resetErrorCount: async function() {
    const nowStr = new Date().toLocaleString('en-IN');
    try {
      const response = await api.updateSettings({ errorCount: 0, lastResetTime: nowStr });
      if (response.success) {
        app.state.brandSettings.errorCount = 0;
        app.state.brandSettings.lastResetTime = nowStr;
        document.getElementById('admin-error-count').innerHTML = `
          0 calls 
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: normal; margin-left: 0.5rem;">
            (Last reset: ${nowStr})
          </span>
        `;
        utils.showToast('Error counter reset successfully.');
      }
    } catch (err) {
      utils.showToast('Failed to reset error counter.');
    }
  }
};
