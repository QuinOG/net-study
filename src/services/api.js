import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with request/response logging
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Request with auth to ${config.url}`);
    } else {
      console.log(`[API] Request without auth to ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] Error response from ${error.config?.url || 'unknown endpoint'}:`, 
      error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth services
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// User services
export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const updateUserProfile = (userId, data) => api.patch(`/users/${userId}`, data);
export const getUserStats = (userId) => api.get(`/users/${userId}/stats`);
export const updateUserStats = (userId, data) => api.patch(`/users/${userId}/stats`, data);
export const getUserAchievements = (userId) => api.get(`/users/${userId}/achievements`);

// Add a direct XP update function
export const addUserXP = (amount) => api.post('/users/xp', { amount });

// Game services
export const getAllGames = (filters) => api.get('/games', { params: filters });
export const getGame = (gameId) => api.get(`/games/${gameId}`);
export const getGameContent = (gameId, filters) => api.get(`/games/${gameId}/content`, { params: filters });
export const submitGameResults = (gameId, results) => api.post(`/games/${gameId}/results`, results);

// Leaderboard services
export const getGlobalLeaderboard = (params) => api.get('/leaderboards/global', { params });
export const getGameLeaderboard = (gameId, params) => api.get(`/leaderboards/games/${gameId}`, { params });

export default api;