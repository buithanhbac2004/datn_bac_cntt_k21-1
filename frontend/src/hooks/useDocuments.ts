import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/api/documentApi';
import type { DocumentFilter } from '@/types/document';
import toast from 'react-hot-toast';

export const useDocuments = (filters: DocumentFilter) => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách tài liệu
  const { data: response = [], isLoading } = useQuery({
    queryKey: ['documents', filters], // Khi filter thay đổi, query tự động chạy lại
    queryFn: () => documentApi.getDocuments(filters),
  });

  // 2. Mutation Upload tài liệu (Thêm mới)
  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File}) => 
      documentApi.uploadDocument(file),
    onSuccess: () => {
      // Làm mới danh sách tài liệu sau khi upload thành công
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Tải tài liệu lên thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Lỗi khi tải tài liệu');
    }
  });

  const handleGetViewUrl = (docId: number) => {
    return documentApi.getViewUrl(docId);
  };

  return {
    // Trỏ đúng vào mảng data từ response BE { success: true, data: [...] }
    documents: response?.data || [], 
    isLoading,
    
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    
    // Xuất hàm này ra để dùng ở Component
    getViewUrl: handleGetViewUrl,
  };
  
};


