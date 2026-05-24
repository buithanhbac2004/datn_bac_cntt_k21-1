import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
// --- PLACEHOLDER PAGES (Tách ra thư mục src/pages/ sau) ---
// import { usePageTitle } from './hooks/usePageTitle';
import DocumentsPage from './pages/Documents';
import DashboardPage from './pages/Dashboard';
import GeneratorPage from './pages/Generator';
import QuestionBankPage from './pages/QuestionBank';
import LoginPage from '@/pages/LoginPage';
import { Toaster } from 'react-hot-toast';


// 5. Trang Cài đặt
// const Settings = () => {
//   usePageTitle('Cài đặt Hệ thống', 'Tùy chỉnh cấu hình mô hình AI, Prompt mặc định và thông tin cá nhân');
//   return <div className="p-6 bg-surface rounded-2xl border border-border h-full">Nội dung Cài đặt</div>;
// };



function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  
  // Tạm thời hardcode token = true để xem được Layout bên trong
  const token = useAuthStore((state) => state.access_token);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Toaster position="top-right" /> {/* Nằm ngoài Routes */}
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <LoginPage /> : <Navigate replace to="/" />} 
          />

          <Route 
            path="/" 
            element={token ? <MainLayout /> : <Navigate replace to="/login" />}
          >
            <Route index element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="generator" element={<GeneratorPage />} />
            <Route path="question-bank" element={<QuestionBankPage />} />
            {/* <Route path="settings" element={<Settings />} /> */}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;