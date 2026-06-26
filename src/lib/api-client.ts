import axios from "axios";
import { getApiBaseUrl } from "@/lib/auth-client";
import { clearSession } from "@/lib/session";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);
