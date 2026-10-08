import axios from "axios";

import { handleSessionExpired } from "@/shared/sessionExpiry";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shows the app-level session-expired modal on any 401 — see
// shared/sessionExpiry.js / components/SessionExpiredModal.jsx.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  },
);

export default api;
