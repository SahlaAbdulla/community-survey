import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // env ninn fetch

const httpClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,   // 👈 /api auto attach
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptor to always send JWT if available
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 👈 clean way
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default httpClient;
