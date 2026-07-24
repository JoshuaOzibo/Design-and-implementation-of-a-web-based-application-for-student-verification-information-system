import axios from "axios";
import { ENV } from "../config/env";

export const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true, // Send refresh cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Inject Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Refresh on 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if auth requests fail with 401
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request token refresh endpoint
        const response = await axios.post(
          `${ENV.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("Missing token in refresh response");
        }

        // Store new token
        localStorage.setItem("accessToken", newAccessToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens cleanly on refresh failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        
        return Promise.reject(refreshError);
      }
    }

    // Standardize error message extracted from API
    const apiError = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(apiError));
  }
);
export default axiosInstance;
