import { Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  return (
    <div className="lg:col-span-1 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-foreground mb-1">Thao tác nhanh</h3>
      
      <Link 
        to="/documents" 
        className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 hover:shadow-lg hover:border-primary/40 transition-all group flex flex-col justify-center items-center text-center cursor-pointer"
      >
        <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <h4 className="text-lg font-bold text-primary mb-2">Tải lên Tài liệu</h4>
        <p className="text-sm text-primary/70">Kéo thả PDF, Docx để bắt đầu trích xuất</p>
      </Link>

      <Link 
        to="/generator" 
        className="flex-1 bg-surface border border-border rounded-2xl p-6 hover:shadow-md hover:border-border/80 transition-all group flex flex-col justify-center items-center text-center cursor-pointer"
      >
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Sparkles className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h4 className="text-lg font-bold text-foreground mb-2">Tạo Câu hỏi AI</h4>
        <p className="text-sm text-muted-foreground">Sinh bộ câu hỏi trắc nghiệm tự động</p>
      </Link>
    </div>
  );
};