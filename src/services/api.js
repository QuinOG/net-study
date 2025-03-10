import axios from 'axios';

// Determine the API host based on environment or configuration
// 1. Use the REACT_APP_API_URL from environment if available and not containing placeholders
// 2. Fallback to window.location.hostname to use the same host as the frontend
// 3. Finally fallback to localhost if all else fails
let API_HOST = process.env.REACT_APP_API_URL;

// Check if API_HOST contains placeholders (like YOUR_LOCAL_IP) and is therefore invalid
if (!API_HOST || API_HOST.includes('YOUR_LOCAL_IP') || API_HOST.includes('your_local_ip')) {
  // Fallback to using the same hostname as the frontend
  API_HOST = `http://${window.location.hostname}:5000/api`;
  console.log('[API] Environment variable contains placeholder. Using current hostname instead:', API_HOST);
}

const API_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;

console.log(`[API] Using API URL: ${API_URL}`);

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