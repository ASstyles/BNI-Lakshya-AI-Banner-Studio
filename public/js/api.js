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

  //Banner show
  getBanners: async function() {
    return this.request( "/api/banners");
  },
  
  //   saveBanner: async function(data) {
  //     return this.request("/api/banners", "POST", data);
  // },

  // getUserBanners: async function(uid) {
  //     return this.request(`/api/banners/user/${uid}`);
  // },

  // getAllBanners: async function() {
  //     return this.request("/api/banners");
  // },

  //   saveBanner(data){
  //   return this.request("/api/banners","POST",data);
  // },

  // getUserBanners(uid){
  //   return this.request(`/api/banners/user/${uid}`);
  // },

  // getAllBanners(){
  //   return this.request("/api/banners");
  // },

//   deleteBanner(id){
//     return this.request(`/api/banners/${id}`,"DELETE");
//   },
//   deleteBanner: async function(id) {
//     return this.request(`/api/banners/${id}`, "DELETE");
// },

  saveBanner: async function(data) {
    return this.request("/api/banners", "POST", data);
  },

  getUserBanners: async function(uid) {
    return this.request(`/api/banners/user/${uid}`);
  },

  getAllBanners: async function() {
    return this.request("/api/banners");
  },

  deleteBanner: async function(id) {
    return this.request(`/api/banners/${id}`, "DELETE");
  },

  // Get Admin Settings
  getSettings: async function() {
    return this.request('/api/settings');
  },

  updateBanner: async function(id, data) {
    return this.request(
        `/api/banners/${id}`,
        "PUT",
        data
    );
},

  // Update Settings
  updateSettings: async function(settingsData) {
    return this.request('/api/settings', 'POST', settingsData);
  },

  // Upload image
  uploadImage: async function(base64Image) {
    return this.request("/api/upload-image", "POST", { image: base64Image });
  },

  // Generate copy
  generateCopy: async function(inputData) {
    return this.request('/api/generate-copy', 'POST', inputData);
  }
};
