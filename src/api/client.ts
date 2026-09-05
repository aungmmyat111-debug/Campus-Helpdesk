import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/helpdesk/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('app_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;