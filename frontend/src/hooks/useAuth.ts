import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      toast.error('Vui lòng nhập tài khoản và mật khẩu!');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login(username, password);
      
      // Lưu access_token và user vào store
      setAuth(data.user, data.access_token);
      
      toast.success(`Chào mừng trở lại, ${data.user.full_name}!`);
      
      // Điều hướng dựa trên Role
      if (data.user.role === 'ADMIN') {
        navigate('/');
      } else {
        navigate('/employees');
      }
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};