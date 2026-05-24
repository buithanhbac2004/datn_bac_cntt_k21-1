import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAppStore } from '@/stores/appStore';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { pageTitle, pageSubtitle } = useAppStore();

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0 transition-colors">

      {/* Khối Tiêu đề động */}
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-lg text-foreground leading-tight animate-in slide-in-from-bottom-2 fade-in duration-300">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <span className="text-xs text-muted-foreground font-medium animate-in fade-in duration-500">
            {pageSubtitle}
          </span>
        )}
      </div>

      {/* Các nút công cụ */}
      <div className="flex items-center gap-3">
        {/* <button className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
        </button> */}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;