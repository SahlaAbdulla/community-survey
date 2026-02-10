import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // 👈 env ninn fetch

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,  // 👈 auto attach api/
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
