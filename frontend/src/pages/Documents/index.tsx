import { useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentTable } from './components/DocumentTable'; // Xóa DocumentItem nếu bác dùng chung type DocumentResponse
import { useDocuments } from '@/hooks/useDocuments'; // Hook bác vừa viết

const DocumentsPage = () => {
  usePageTitle('Quản lý Tài liệu', 'Tải lên, quản lý và trích xuất dữ liệu từ các tệp PDF, DOCX, TXT');

  // 1. Quản lý filters (để tìm kiếm/phân trang)
  const [filters] = useState({
    file_name: '',
    limit: 30,
    offset: 0
  });

  // 2. Sử dụng Hook thật thay cho Mock Data
  const { documents, uploadDocument, isUploading, getViewUrl } = useDocuments(filters);

  // 3. Hàm xử lý upload khi nhận file từ DocumentUpload
  const handleFilesAccepted = (files: File[]) => {
    // Vì uploadDocument của bác nhận 1 file, nếu user chọn nhiều file thì ta loop qua
    files.forEach(file => {
      uploadDocument({ file }); 
  
    });
  };


  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Truyền thêm isUploading để UI biết đường mà hiện loading */}
      <DocumentUpload 
        onFilesAccepted={handleFilesAccepted} 
        disabled={isUploading} 
      />
      
      {/* Truyền documents từ Hook vào đây */}
      <DocumentTable 
        documents={documents} 
        getViewUrl={getViewUrl}
      />
    </div>
  );
};

export default DocumentsPage;