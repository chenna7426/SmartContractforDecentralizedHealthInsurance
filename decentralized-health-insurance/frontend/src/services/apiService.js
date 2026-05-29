import axios from "axios";
import { API_BASE_URL } from "../config";

const SESSION_KEY = "dhi_session";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const storedSession = localStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return config;
  }

  try {
    const parsed = JSON.parse(storedSession);
    if (parsed?.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${parsed.token}`,
      };
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  }
);

export default api;
