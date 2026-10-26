// src/shared/axiosInstance.js
import axios from "axios";

import { getSessionToken } from "@/auth/sessionStore";
import { handleSessionExpired } from "./sessionExpiry";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle errors globally for axiosInstance
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    console.error("[API Error]", message);

    const isLoginCall = String(error.config?.url || "").includes(
      "/api/auth/login",
    );
    if (error.response?.status === 401 && !isLoginCall) {
      handleSessionExpired(error.config);
    }

    return Promise.reject(error);
  },
);

// ── Global Axios Interceptor ──────────────────────────────────────────────────
// Ensures ANY component importing raw `axios` that encounters a 401 triggers
// the logged-out modal immediately instead of failing silently "without data".
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = String(error.config?.url || "").includes(
      "/api/auth/login",
    );
    if (error.response?.status === 401 && !isLoginCall) {
      handleSessionExpired(error.config);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
