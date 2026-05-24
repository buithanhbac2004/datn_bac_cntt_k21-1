import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Files, BrainCircuit, Database, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const MENU_ITEMS = [
  { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
  { name: 'Quản lý tài liệu', path: '/documents', icon: Files },
  { name: 'Tạo câu hỏi AI', path: '/generator', icon: BrainCircuit },
  { name: 'Ngân hàng đề', path: '/question-bank', icon: Database },
  // { name: 'Cài đặt', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi hệ thống!');
  };

  return (
    <aside 
      className={`border-r border-border bg-surface hidden md:flex flex-col h-full transition-all duration-300 ease-in-out relative z-20 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Nút Toggle ghim ở mép phải */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-all z-30 shadow-sm"
      >
        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border shrink-0 px-4">
        <BrainCircuit className="w-8 h-8 text-primary shrink-0" />
        {!isSidebarCollapsed && (
          <span className="font-bold text-xl text-foreground tracking-tight ml-3 whitespace-nowrap overflow-hidden transition-all animate-in fade-in duration-300">
            AI Quiz
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isSidebarCollapsed ? item.name : ''}
              className={`flex items-center rounded-xl transition-all duration-200 group ${
                isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
              } ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-foreground'} ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap animate-in fade-in duration-300">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
      

      {/* User Info */}
      <div className="p-4 border-t border-border shrink-0">
        <div className={`flex items-center rounded-xl bg-muted/50 border border-border transition-all ${
          isSidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2'
        }`}>
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-hidden ml-3 animate-in fade-in duration-300">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.full_name || "Người dùng"} 
              </p>
              {/* <p className="text-xs text-muted-foreground truncate">Admin</p> */}
            </div>
          )}
        </div>
      </div>

      {/* Nút Đăng xuất */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <button 
          onClick={handleLogout}
          className={`
            flex items-center gap-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group
            ${isSidebarCollapsed ? 'justify-center px-0 w-full' : 'px-4 w-full'}
          `}
        >
          <LogOut className={`w-5 h-5 shrink-0 ${!isSidebarCollapsed && 'group-hover:-translate-x-1 transition-transform'}`} />
          {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap text-sm">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;