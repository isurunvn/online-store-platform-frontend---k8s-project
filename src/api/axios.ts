import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: '/', // Service paths already include /api; Gateway routes them unchanged.
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      await keycloak.updateToken(30);
    }
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
