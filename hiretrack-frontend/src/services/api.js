import axios from 'axios';

// In development: uses http://localhost:5000/api (direct or via Vite proxy)
// In production:  set VITE_API_BASE_URL to your deployed backend URL, e.g.
//                 https://your-backend.railway.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // send HTTP-only cookie for refresh token
});

// ── Request interceptor: attach access token ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: refresh on 401 ─────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  updatePreferences: (prefs) => api.patch('/auth/preferences', { preferences: prefs }),
};

// ── Resume ────────────────────────────────────────────────────────
export const resumeApi = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('resume', file);
    return api.post('/resume/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: () => api.get('/resume'),
  update: (id, data) => api.patch(`/resume/${id}`, data),
  delete: (id) => api.delete(`/resume/${id}`),
};

// ── Jobs ──────────────────────────────────────────────────────────
export const jobsApi = {
  feed: (params) => api.get('/jobs/feed', { params }),
};

// ── Applications ──────────────────────────────────────────────────
export const applicationsApi = {
  create: (data) => api.post('/applications', data),
  getAll: () => api.get('/applications'),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  addInterview: (id, data) => api.post(`/applications/${id}/interviews`, data),
  checkApplied: (jobId) => api.get(`/applications/check/${jobId}`),
};

// ── Offers ────────────────────────────────────────────────────────
export const offersApi = {
  create: (data) => api.post('/offers', data),
  getAll: () => api.get('/offers'),
  update: (id, data) => api.patch(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  compare: (offerIds) => api.post('/offers/compare', { offerIds }),
};

// ── Activity ──────────────────────────────────────────────────────
export const activityApi = {
  getAll: () => api.get('/activity'),
};

export default api;
