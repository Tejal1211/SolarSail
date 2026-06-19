import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add token to requests
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle response errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Auth APIs
 */
export const authAPI = {
  signup: (email, name, password) =>
    api.post('/auth/signup', { email, name, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleAuth: (tokenId) => api.post('/auth/google', { tokenId }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/**
 * Carbon Tracking APIs
 */
export const carbonAPI = {
  logSaving: (data) => api.post('/carbon/log', data),
  getStats: (year, month) =>
    api.get('/carbon/stats', { params: { year, month } }),
  getHistory: (page, limit, category) =>
    api.get('/carbon/history', { params: { page, limit, category } }),
  deleteEntry: (entryId) => api.delete(`/carbon/${entryId}`),
};

/**
 * Mission APIs
 */
export const missionAPI = {
  getAllMissions: (category, difficulty, page, limit) =>
    api.get('/missions', { params: { category, difficulty, page, limit } }),
  getMissionDetails: (missionId) => api.get(`/missions/${missionId}`),
  startMission: (missionId) => api.post(`/missions/${missionId}/start`),
  completeStep: (missionId, stepNumber) =>
    api.post(`/missions/${missionId}/step`, { stepNumber }),
  getUserMissions: (status, page, limit) =>
    api.get('/missions/user/progress', { params: { status, page, limit } }),
};

/**
 * Leaderboard APIs
 */
export const leaderboardAPI = {
  getGlobal: (page, limit, period) =>
    api.get('/leaderboard/global', { params: { page, limit, period } }),
  getTopPerformers: (limit) =>
    api.get('/leaderboard/top', { params: { limit } }),
  getUserRank: () => api.get('/leaderboard/user-rank'),
  updateRankings: () => api.post('/leaderboard/update-rankings'),
};

export default api;
