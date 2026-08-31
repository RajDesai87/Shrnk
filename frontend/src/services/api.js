// API Service for SHRNK

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Core fetch wrapper that automatically handles:
 * - Authorization headers (JWT Bearer token)
 * - JSON serialization / parsing
 * - Standardized error extraction
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('shrnk_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, config);
    
    // Handle 204 No Content
    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Extract clean error message without leaking raw stack traces
      let message = 'An unexpected error occurred. Please try again.';
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail[0].msg || message;
      } else if (data.message) {
        message = data.message;
      }

      // If token expired or unauthorized on protected routes, notify handlers
      if (res.status === 401 && token) {
        window.dispatchEvent(new CustomEvent('shrnk:unauthorized'));
      }

      throw new ApiError(message, res.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / server connection error
    throw new ApiError('Unable to connect to the SHRNK server. Please ensure the backend is running.', 0);
  }
}

export const api = {
  // Auth
  register: (name, email, password) => request('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me', { method: 'GET' }),
  updateProfile: (name) => request('/api/auth/profile', { method: 'PUT', body: { name } }),
  changePassword: (current_password, new_password) => request('/api/auth/change-password', { method: 'POST', body: { current_password, new_password } }),
  deleteAccount: () => request('/api/auth/account', { method: 'DELETE' }),

  // Dashboard & Analytics
  getDashboard: () => request('/api/dashboard', { method: 'GET' }),
  getAnalyticsOverview: (range = '7d') => request(`/api/analytics/overview?range=${range}`, { method: 'GET' }),

  // URLs
  createUrl: (original_url, custom_alias = null, expires_at = null) => 
    request('/api/urls', { method: 'POST', body: { original_url, custom_alias, expires_at } }),
  getUrls: (filter = 'all', search = '') => {
    let url = `/api/urls?filter=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url, { method: 'GET' });
  },
  getUrl: (id) => request(`/api/urls/${id}`, { method: 'GET' }),
  deleteUrl: (id) => request(`/api/urls/${id}`, { method: 'DELETE' }),
  getUrlAnalytics: (id) => request(`/api/urls/${id}/analytics`, { method: 'GET' }),
};

export default api;
