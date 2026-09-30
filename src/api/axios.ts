import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: '/api', // Can be proxied via Vite or Nginx
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      keycloak.login();
    }
    return Promise.reject(error);
  }
);

export default api;
