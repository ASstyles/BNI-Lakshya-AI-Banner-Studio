const api = {
  // Config
  baseUrl: window.location.origin,

  // Helper fetch handler
  request: async function(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('bni_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Auth failure - trigger logout
        localStorage.removeItem('bni_auth_token');
        if (typeof app !== 'undefined') app.logout();
        throw new Error('Unauthorized session. Please login again.');
      }

      if (response.status === 429) {
        throw new Error('API Request Limit reached (Max 50 requests/hour). Please try again later.');
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `HTTP error ${response.status}`);
      }

      return result;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Log in
  login: async function(code) {
    return this.request('/api/auth/login', 'POST', { code });
  },

  // Get Admin Settings
  getSettings: async function() {
    return this.request('/api/settings');
  },

  // Update Settings
  updateSettings: async function(settingsData) {
    return this.request('/api/settings', 'POST', settingsData);
  },

  // Generate copy
  generateCopy: async function(inputData) {
    return this.request('/api/generate-copy', 'POST', inputData);
  }
};
