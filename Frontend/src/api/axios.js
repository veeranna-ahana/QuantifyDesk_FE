import axios from "axios";

import { getSessionToken } from "@/auth/sessionStore";
import { handleSessionExpired } from "@/shared/sessionExpiry";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
});

api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleSessionExpired(error.config);
    }
    return Promise.reject(error);
  },
);

export default api;
