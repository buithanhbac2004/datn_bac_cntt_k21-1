import axiosClient from "./axiosClient";
import type { User } from '@/types/auth';

export const authApi = {
  login: async (username: string, password: string): Promise<{ access_token: string; user: User }> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('scope', '');
    params.append('client_id', '');
    params.append('client_secret', '');

    // Dùng axiosClient thay vì axios
    const { data } = await axiosClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    return {
      access_token: data.access_token,
      user: data.data_user 
    };
  },

  // API lấy thông tin mình đang đăng nhập (Check Me)
  getMe: async (): Promise<User> => {
    const { data } = await axiosClient.get('/auth/me');
    return data;
  }
};