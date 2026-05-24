import { useMemo, useState } from 'react';
import { BookOpen, Edit, Download, CalendarDays, FileText, Database, ChevronDown, FileType } from 'lucide-react';
import type { ColumnDef } from '@/components/common/DataTable';
import DataTable from '@/components/common/DataTable';
import type { QuizSet } from '@/types/question';

interface BankTableProps {
  data: QuizSet[];
  onSelectionChange: (ids: (string | number)[]) => void;
  onExport: (id: number, format: 'pdf' | 'docx' | 'moodle') => void;
}

export const BankTable = ({ data, onSelectionChange, onExport }: BankTableProps) => {
  // Dùng state để lưu ID của hàng đang mở menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const formats = [
    { id: 'pdf', label: 'Xuất PDF', icon: FileText, color: 'text-red-500' },
    { id: 'docx', label: 'Xuất Word', icon: FileType, color: 'text-blue-500' },
    { id: 'moodle', label: 'Moodle XML', icon: Database, color: 'text-orange-500' },
  ] as const;

  const columns = useMemo<ColumnDef<QuizSet>[]>(() => [
    {
      id: 'title',
      header: 'Tên bộ đề',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm line-clamp-1">
              {item.title}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Nguồn: {item.document_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'total_questions',
      header: 'Số câu hỏi',
      cell: (item) => (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-muted text-foreground text-xs font-medium border border-border">
          {item.total_questions} câu
        </span>
      ),
    },
    {
      id: 'difficulty',
      header: 'Mức độ',
      cell: (item) => {
        // --- LOGIC XỬ LÝ AI_CONFIG ---
        let difficultyValue = 'medium'; // Mặc định
        try {
          // Parse chuỗi JSON từ API
          const config = JSON.parse(item.ai_config);
          difficultyValue = config.difficulty || 'medium';
        } catch (e) {
          console.error("Lỗi parse ai_config:", e);
        }

        const configMap = {
          easy: { text: 'Dễ', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          medium: { text: 'Trung bình', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
          hard: { text: 'Khó', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
        };

        const style = configMap[difficultyValue as keyof typeof configMap] || configMap.medium;

        return (
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${style.color}`}>
            {style.text}
          </span>
        );
      },
    },
    {
      id: 'created_at',
      header: 'Ngày tạo',
      cell: (item) => {
        const date = new Date(item.created_at);
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {date.toLocaleDateString('vi-VN')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: (item) => (
        <div className="flex items-center gap-2 relative">
          <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa">
            <Edit className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${openMenuId === item.id
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-surface text-foreground border-border hover:bg-muted'
                }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất bản</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openMenuId === item.id ? 'rotate-180' : ''}`} />
            </button>

            {openMenuId === item.id && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  {formats.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onExport(item.id, f.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-all text-left group/item"
                    >
                      <f.icon className={`w-4 h-4 ${f.color} group-hover/item:scale-110 transition-transform`} />
                      <span className="font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ),
    },
  ], [onExport, openMenuId]);

  return (
    <div className="flex-1 flex flex-col min-h-[400px]">
      <DataTable<QuizSet>
        title="Danh sách Bộ đề"
        columns={columns}
        data={data}
        enableSelection={true}
        onSelectionChange={onSelectionChange}
        getRowId={(item) => String(item.id)}
      />
    </div>
  );
};