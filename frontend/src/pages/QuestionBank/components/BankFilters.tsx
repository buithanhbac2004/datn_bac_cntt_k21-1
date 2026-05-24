import { useState } from 'react';
import { Search, Filter, Download, FileText, FileType, Database, ChevronDown } from 'lucide-react';

interface BankFiltersProps {
  onSearch: (keyword: string) => void;
  selectedCount: number;
  onExportClick: (format: 'pdf' | 'docx' | 'moodle') => void;
}

export const BankFilters = ({ onSearch, selectedCount, onExportClick }: BankFiltersProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const formats = [
    { id: 'pdf', label: 'Xuất PDF', icon: FileText, color: 'text-red-500' },
    { id: 'docx', label: 'Xuất Word', icon: FileType, color: 'text-blue-500' },
    { id: 'moodle', label: 'Moodle XML', icon: Database, color: 'text-orange-500' },
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 shrink-0">
      <div className="relative w-full sm:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên bộ đề, môn học..."
          onChange={(e) => onSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl leading-5 bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors sm:text-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Lọc nâng cao</span>
        </button>
        
        {selectedCount > 0 && (
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity animate-in fade-in slide-in-from-right-2"
            >
              <Download className="w-4 h-4" />
              <span>Xuất {selectedCount} bộ đề</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  {formats.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onExportClick(f.id);
                        setShowExportMenu(false);
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
        )}
      </div>
    </div>
  );
};