import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://feedback-sys-tickets-jklu-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) =>
    api.post('/auth/register', userData),
};

export const complaintAPI = {
  getComplaints: () => api.get('/complaints'),
  getComplaint: (id: string) => api.get(`/complaints/${id}`),
  createComplaint: (data: any) => api.post('/complaints', data),
  updateComplaint: (id: string, data: any) => api.put(`/complaints/${id}`, data),
  markSeen: (id: string) => api.put(`/complaints/${id}/mark-seen`),
  transferComplaint: (id: string, data: any) => api.post(`/complaints/${id}/transfer`, data),
  getPublicComplaints: () => api.get('/complaints/public'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getDomains: () => api.get('/users/domains'),
  getStats: () => api.get('/users/stats'),
};

export const adminAPI = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  createUser: (userData: any) => api.post('/admin/users', userData),
  toggleUser: (id: string) => api.put(`/admin/users/${id}/toggle`),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
  getDashboard: () => api.get('/admin/dashboard'),
};

export default api;
