// GramSetu Unified API & Auth Client Service

const API_BASE_URL = 'http://localhost:5000/api';

// =====================================================
// Helper: Get authentication token
// =====================================================

function getToken() {
  return localStorage.getItem('gramsetu_token');
}

// =====================================================
// Helper: Common request function
// =====================================================

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new Error('Unable to connect to GramSetu. Please check that the backend is running.');
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(data.message || 'Password reset service is unavailable. Please try again.');
    }
    if (response.status === 429) {
      throw new Error('Too many attempts. Please try again later.');
    }
    if (response.status === 500 && !data.message) {
      throw new Error('GramSetu is temporarily unable to process your request. Please try again.');
    }
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}


// =====================================================
// GramSetu API Service
// =====================================================

export const apiService = {

  // ===================================================
  // AUTH - REGISTER
  // ===================================================

  async register(userData) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (data.token) {
      localStorage.setItem('gramsetu_token', data.token);
    }

    if (data.user) {
      localStorage.setItem(
        'gramsetu_user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ===================================================
  // AUTH - LOGIN
  // ===================================================

  async login({ identifier, password, role }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
        role
      })
    });

    if (data.token) {
      localStorage.setItem('gramsetu_token', data.token);
    }

    if (data.user) {
      localStorage.setItem(
        'gramsetu_user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ===================================================
  // AUTH - GET CURRENT USER
  // ===================================================

  async getCurrentUser() {
    const token = getToken();

    if (!token) {
      return null;
    }

    try {
      const data = await request('/auth/me');
      return data.user || null;
    } catch (error) {
      console.error('Get current user error:', error.message);
      return null;
    }
  },

  // ===================================================
  // AUTH - UPDATE PROFILE
  // ===================================================

  async updateProfile(profileData) {
    const data = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });

    if (data.user) {
      localStorage.setItem(
        'gramsetu_user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ===================================================
  // AUTH - LOGOUT
  // ===================================================

  async logout() {
    try {
      await request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout API error:', error.message);
    }

    localStorage.removeItem('gramsetu_token');
    localStorage.removeItem('gramsetu_user');

    sessionStorage.clear();

    return {
      success: true
    };
  },

  // ===================================================
  // HEALTH CHECK
  // ===================================================

  async healthCheck() {
    return await request('/health');
  },

  // ===================================================
  // PRICE - TODAY'S PRICE
  // ===================================================

  async getTodayPrice() {
    return await request('/prices/today');
  },

  // ===================================================
  // PRICE - BROKER OFFER CHECK
  // ===================================================

  async checkBrokerPrice(crop, brokerOffer, quantity = 1) {
    return await request('/prices/check-broker', {
      method: 'POST',
      body: JSON.stringify({
        crop,
        brokerOffer,
        quantity
      })
    });
  },

  // ===================================================
  // VILLAGE - GET VILLAGES
  // ===================================================

  async getVillages() {
    return await request('/village');
  },

  // ===================================================
  // VILLAGE - NDVI
  // ===================================================

  async getVillageNDVI(villageId) {
    return await request(`/village/${villageId}/ndvi`);
  },

  // ===================================================
  // AI - ADVISORY & VISION ANALYSIS
  // ===================================================

  async getAdvisory(message, context = {}) {
    return await request('/advisory', {
      method: 'POST',
      body: JSON.stringify({
        message,
        language: context.language || 'hi',
        crop: context.crop,
        variety: context.variety,
        village: context.village || null,
        district: context.district || null,
        state: context.state || null,
        context
      })
    });
  },

  async analyzeFarmImage(formData) {
    const token = getToken();

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const isHi = formData.get('language') === 'hi';
    let response;

    try {
      response = await fetch(`${API_BASE_URL}/ai/analyze-farm-image`, {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (netErr) {
      throw new Error(
        isHi
          ? 'सर्वर से संपर्क नहीं हो सका। इंटरनेट कनेक्शन जांचकर फिर प्रयास करें।'
          : 'Unable to connect to server. Please check your internet connection and try again.'
      );
    }

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message || (
          isHi
            ? 'फसल फोटो का विश्लेषण अभी उपलब्ध नहीं है। कृपया कुछ देर बाद दोबारा प्रयास करें।'
            : 'Photo analysis is currently unavailable. Please try again later.'
        )
      );
    }

    return data;
  },


  async getAllMills() {
    return await request('/mills');
  },

  async getNearbyMillsWithPrices({ village = '', district = '', state = '', crop = 'Paddy', variety = 'Common', lat, lng } = {}) {
    const params = new URLSearchParams();
    if (village) params.append('village', village);
    if (district) params.append('district', district);
    if (state) params.append('state', state);
    if (crop) params.append('crop', crop);
    if (variety) params.append('variety', variety);
    if (lat !== undefined && lng !== undefined) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    return await request(`/mills/nearby-with-prices?${params.toString()}`);
  },

  // ===================================================
  // MILLS - GET NEARBY MILLS
  // ===================================================

  async getNearbyMills({
    lat,
    lng,
    radiusKm = 25,
    crop = ''
  } = {}) {

    const params = new URLSearchParams();

    if (lat !== undefined && lng !== undefined) {
      params.append('lat', lat);
      params.append('lng', lng);
    }

    params.append('radiusKm', radiusKm);

    if (crop) {
      params.append('crop', crop);
    }

    return await request(
      `/mills/nearby?${params.toString()}`
    );
  },

  // ===================================================
  // MILLS - SEARCH BY LOCATION
  // ===================================================

  async searchMills({
    village = '',
    district = '',
    state = '',
    crop = ''
  } = {}) {

    const params = new URLSearchParams();

    if (village) {
      params.append('village', village);
    }

    if (district) {
      params.append('district', district);
    }

    if (state) {
      params.append('state', state);
    }

    if (crop) {
      params.append('crop', crop);
    }

    return await request(
      `/mills/search?${params.toString()}`
    );
  },

  // ===================================================
  // MILL - GET SINGLE MILL
  // ===================================================

  async getMillById(millId) {
    return await request(`/mills/${millId}`);
  },

  // ===================================================
  // MILL - CONTACT / DEAL REQUEST
  // ===================================================

  async contactMill(millId, dealData) {
    return await request(`/mills/${millId}/contact`, {
      method: 'POST',
      body: JSON.stringify(dealData)
    });
  },

  // ===================================================
  // AUTH - FORGOT PASSWORD (EMAIL)
  // ===================================================

  async forgotPasswordEmail(email) {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // ===================================================
  // AUTH - VERIFY RESET TOKEN
  // ===================================================

  async verifyResetToken(token) {
    return await request('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  // ===================================================
  // AUTH - RESET PASSWORD (EMAIL)
  // ===================================================

  async resetPasswordEmail(token, newPassword) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },

  // ===================================================
  // AUTH - FORGOT PASSWORD (MOBILE OTP)
  // ===================================================

  async forgotPasswordMobile(phone) {
    return await request('/auth/forgot-password-mobile', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyResetOtp(phone, otp) {
    return await request('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  },

  // ===================================================
  // AUTH - RESET PASSWORD (MOBILE OTP)
  // ===================================================

  async resetPasswordMobile(phone, otp, newPassword) {
    return await request('/auth/reset-password-mobile', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, newPassword })
    });
  },


  // ===================================================
  // LOCATIONS - GET ALL STATES & UTs
  // ===================================================

  async getLocationStates() {
    return await request('/locations/states');
  },

  // ===================================================
  // LOCATIONS - GET DISTRICTS BY STATE
  // ===================================================

  async getLocationDistricts(stateName) {
    return await request(`/locations/districts/${encodeURIComponent(stateName)}`);
  },

  // ===================================================
  // LOCATIONS - GET VILLAGES BY STATE & DISTRICT
  // ===================================================

  async getLocationVillages(stateName, districtName, searchQuery = '') {
    const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return await request(`/locations/villages/${encodeURIComponent(stateName)}/${encodeURIComponent(districtName)}${params}`);
  },

  // ===================================================
  // MSP - MINIMUM SUPPORT PRICE SERVICES
  // ===================================================

  async getAllMSP(filters = {}) {
    const params = new URLSearchParams();
    if (filters.season) params.append('season', filters.season);
    if (filters.marketingSeason) params.append('marketingSeason', filters.marketingSeason);
    if (filters.crop) params.append('crop', filters.crop);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/msp${queryString}`);
  },

  async getMSPByCrop(cropName) {
    if (!cropName) throw new Error('Crop name is required');
    return await request(`/msp/${encodeURIComponent(cropName.trim())}`);
  },

  // ===================================================
  // PRICES - MANDI, MILL & COMPARE SERVICES
  // ===================================================

  async getMandiPrices({ state = '', district = '', market = '', crop = '', variety = '', date = '' } = {}) {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    if (market) params.append('market', market);
    if (crop) params.append('crop', crop);
    if (variety) params.append('variety', variety);
    if (date) params.append('date', date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/prices/mandi${queryString}`);
  },

  async getMillPrices({ millId = '', crop = '', district = '', state = '', date = '' } = {}) {
    const params = new URLSearchParams();
    if (millId) params.append('millId', millId);
    if (crop) params.append('crop', crop);
    if (district) params.append('district', district);
    if (state) params.append('state', state);
    if (date) params.append('date', date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/prices/mill${queryString}`);
  },

  async submitMillOffer(offerData) {
    return await request('/prices/mill', {
      method: 'POST',
      body: JSON.stringify(offerData)
    });
  },

  async updateMillOffer(priceId, offerData) {
    return await request(`/prices/mill/${priceId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData)
    });
  },

  async deactivateMillOffer(priceId) {
    return await request(`/prices/mill/${priceId}`, {
      method: 'DELETE'
    });
  },

  async getComparePrices({ crop = '', state = '', district = '' } = {}) {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/prices/compare${queryString}`);
  },

  async getNearbyMillsWithPrices({ village = '', district = '', state = '', crop = 'Paddy', variety = 'Common' } = {}) {
    const params = new URLSearchParams();
    if (village) params.append('village', village);
    if (district) params.append('district', district);
    if (state) params.append('state', state);
    if (crop) params.append('crop', crop);
    if (variety) params.append('variety', variety);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/mills/nearby-with-prices${queryString}`);
  }

};

// =====================================================
// Export API base URL if needed elsewhere
// =====================================================

export { API_BASE_URL };