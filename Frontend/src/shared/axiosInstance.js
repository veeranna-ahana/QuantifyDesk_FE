// src/shared/axiosInstance.js
import axios from "axios";

import { handleSessionExpired } from "./sessionExpiry";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use(
  (config) => {
    // Never overwrite an Authorization header the caller set on purpose. The login call sends
    // the MyAhana PORTAL token explicitly (api/AuthApi.js); replacing it here with the stored
    // Quantify JWT made RBAC and PMS reject the login with 401.
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("⚠️ No token found in localStorage");
      }
    }

    // Read user role from cookie and attach as header
    try {
      const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
      if (match) {
        const userObj = JSON.parse(decodeURIComponent(match[1]));
        if (userObj && userObj.role) {
          config.headers["x-user-role"] = userObj.role;
        }
      }
    } catch (err) {
      // Ignore cookie parsing/decoding errors
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    console.error("[API Error]", message);

    // A 401 from the login call itself is a failed SSO handoff, not an
    // expired session — don't show the session-expired modal for it.
    const isLoginCall = String(error.config?.url || "").includes(
      "/api/auth/login",
    );
    if (error.response?.status === 401 && !isLoginCall) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
