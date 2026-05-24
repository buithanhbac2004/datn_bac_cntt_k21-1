import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const axiosClient = axios.create({
  baseURL: "/api", // Base URL của FastAPI
  // timeout: 10000,
  headers: {
    'accept': 'application/json',
  }
});

// INTERCEPTOR REQUEST: Tự động đính kèm Token
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy access_token từ Zustand Store
    const token = useAuthStore.getState().access_token; 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR RESPONSE: Xử lý lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu Backend báo 401 (Hết hạn hoặc sai token)
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn, đang đăng xuất...");
      useAuthStore.getState().logout(); 
      window.location.href = '/login'; // Đẩy về trang login
    }
    return Promise.reject(error);
  }
);

export default axiosClient;