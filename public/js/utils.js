const utils = {
  // Toast notifications
  showToast: function(message, duration = 3000) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('hidden');

    // Reset animations
    toast.style.animation = 'none';
    toast.offsetHeight; // trigger reflow
    toast.style.animation = 'slide-in 0.3s ease';

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  },

  // Client History Manager (localStorage)
  saveBannerToHistory: function(bannerData) {
    try {
      const history = this.getHistory();
      
      // Keep only last 50 generated items to save space
      const updatedHistory = [bannerData, ...history].slice(0, 50);
      localStorage.setItem('bni_banner_history', JSON.stringify(updatedHistory));
      return true;
    } catch (err) {
      console.error('Failed to save banner to localStorage history:', err);
      return false;
    }
  },

  getHistory: function() {
    try {
      const data = localStorage.getItem('bni_banner_history');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to read localStorage history:', err);
      return [];
    }
  },

  deleteHistoryItem: function(id) {
    try {
      const history = this.getHistory();
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem('bni_banner_history', JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Failed to delete history item:', err);
      return false;
    }
  },

  // Input sanitization and validators
  validateFormInputs: function(fields) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    
    fields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (!input || !input.value.trim()) {
        isValid = false;
        if (input) {
          input.classList.add('input-error');
        }
      }
    });

    return isValid;
  },

  // Formatting timestamp
  formatDate: function(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return 'Recent';
    }
  }
};
