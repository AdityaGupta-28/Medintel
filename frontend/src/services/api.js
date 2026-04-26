import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle global 401 (token expired / invalid) ─────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isDemo = localStorage.getItem('token') === 'demo_token_medintel';
    // If the server returns 401 AND we are NOT in demo mode, clear session & redirect
    if (error?.response?.status === 401 && !isDemo) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login:    (credentials) => api.post('/auth/login', credentials),
  register: (userData)    => api.post('/auth/register', userData),
};

export const patientService = {
  getAll:  (params)              => api.get('/patients', { params }),   // { page, limit, search }
  getById: (id)                  => api.get(`/patients/${id}`),
  create:  (patientData)         => api.post('/patients', patientData),
  update:  (id, patientData)     => api.put(`/patients/${id}`, patientData),
  delete:  (id)                  => api.delete(`/patients/${id}`),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics'),
};

export default api;
