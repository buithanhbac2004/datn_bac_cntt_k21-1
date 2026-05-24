import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Gọi Hook
  const { login, isLoading } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent tracking-tight mb-2">
              AI Quiz
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đăng nhập hệ thống nội bộ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Tài khoản</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                placeholder="Nhập tài khoản..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang xác thực IP & Đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;