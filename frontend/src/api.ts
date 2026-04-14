import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth
  register: (email: string, password: string, phoneNumber?: string) =>
    api.post('/auth/register', { email, password, phoneNumber }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  // Search
  search: (params: any) =>
    api.post('/search', params),
  
  getSearchResults: (searchSessionId: string) =>
    api.get(`/search/${searchSessionId}`),
  
  getSearchHistory: () =>
    api.get('/search/history/user'),

  // Alerts
  createAlert: (alert: any) =>
    api.post('/alerts', alert),
  
  getAlerts: () =>
    api.get('/alerts'),
  
  getAlert: (alertId: string) =>
    api.get(`/alerts/${alertId}`),
  
  updateAlert: (alertId: string, data: any) =>
    api.patch(`/alerts/${alertId}`, data),
  
  deleteAlert: (alertId: string) =>
    api.delete(`/alerts/${alertId}`),
};

export default api;
