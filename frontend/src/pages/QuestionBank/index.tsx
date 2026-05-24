import { useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { BankFilters } from './components/BankFilters';
import { BankTable } from './components/BankTable';
import { useQuiz } from '@/hooks/useQuestion'; // Đường dẫn tới file hook của bạn

const QuestionBankPage = () => {
  usePageTitle('Ngân hàng Đề thi', 'Lưu trữ, phân loại và xuất bản các bộ câu hỏi đã hoàn thiện');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sử dụng Hook với filter tìm kiếm
  const { quizSets, isLoading, exportQuiz } = useQuiz({ 
    search: searchTerm 
  });

  const handleSearch = (keyword: string) => {
    setSearchTerm(keyword);
  };

  const handleBulkExport = (format: 'pdf' | 'docx' | 'moodle') => {
    selectedIds.forEach(id => {
        exportQuiz({ setId: Number(id), format });
    });
  };

  const handleExport = (id: number, format: 'pdf' | 'docx' | 'moodle') => {
    exportQuiz({ setId: id, format });
  };

  return (
    <div className="flex flex-col h-full">
      <BankFilters 
        onSearch={handleSearch} 
        selectedCount={selectedIds.length}
        onExportClick={handleBulkExport}
      />
      
      <div className="flex-1 bg-surface border border-border rounded-2xl overflow-visible shadow-sm relative">
        {/* Hiệu ứng loading khi đang tải dữ liệu */}
        {isLoading && (
          <div className="absolute inset-0 bg-surface/50 flex items-center justify-center z-10">
            <span className="loading-spinner" /> {/* Thay bằng spinner của bạn */}
          </div>
        )}

        <BankTable 
          data={quizSets} 
          onSelectionChange={(ids) => setSelectedIds(ids.map(String))}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default QuestionBankPage;