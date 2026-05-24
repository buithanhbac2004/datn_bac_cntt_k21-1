import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/api/questionApi';
import type { GenerateQuizRequest, QuizSetFilter } from '@/types/question';
import toast from 'react-hot-toast';

export const useQuiz = (filters?: QuizSetFilter) => {
    const queryClient = useQueryClient();

    // 1. Lấy danh sách bộ câu hỏi
    const { data: response, isLoading } = useQuery({
        queryKey: ['quizSets', filters],
        queryFn: () => quizApi.getQuizSets(filters || {}),
    });

    // 2. Mutation tạo câu hỏi mới bằng AI
    const generateMutation = useMutation({
        mutationFn: (params: GenerateQuizRequest) => {
            // Tạo ID duy nhất cho lượt gọi này
            const toastId = 'generating-quiz'; 
            
            const apiCall = quizApi.generateQuiz(params);

            toast.promise(
            apiCall,
                {
                    loading: '🤖 AI đang soạn câu hỏi... Bạn có thể làm việc khác, thông báo sẽ hiện khi xong!',
                    success: '🎉 Bộ câu hỏi đã tạo xong!',
                    error: (err) => {
                        // Lấy message từ cấu trúc FastAPI của bạn: err.response.data.detail
                        const errorMsg = err.response?.data?.detail || 'Có lỗi xảy ra khi gọi AI';
                        return `❌ ${errorMsg}`;
                    },
                },
            { id: toastId } // QUAN TRỌNG: Dùng chung ID để cập nhật đúng toast cũ
            );

            return apiCall;
        },
        onSuccess: () => {
            // Làm mới cache để các trang khác (như trang danh sách) tự cập nhật dữ liệu mới
            queryClient.invalidateQueries({ queryKey: ['quizSets'] });
        },
    });

    const saveFinalMutation = useMutation({
        mutationFn: (params: import('@/types/question').SaveFinalRequest) => {
            const toastId = 'saving-final-quiz';
            const apiCall = quizApi.saveFinalQuiz(params);
            
            toast.promise(
                apiCall,
                {
                    loading: 'Đang lưu bộ đề chính thức...',
                    success: 'Đã lưu bộ đề thành công!',
                    error: (err) => `❌ ${err.response?.data?.detail || 'Lỗi khi lưu đề'}`,
                },
                { id: toastId }
            );

            return apiCall;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizSets'] });
        },
    });

    // 3. Logic xử lý Export File (Tải file - Hỗ trợ PDF, DOCX, MOODLE)
    const exportMutation = useMutation({
        mutationFn: ({ setId, format }: { setId: number, format: 'pdf' | 'docx' | 'moodle' }) => 
        quizApi.exportQuiz(setId, format),
        onSuccess: (res, variables) => {
        // Tạo URL từ Blob nhận được
        const blob = new Blob([res.data], { type: res.contentType });
        const url = window.URL.createObjectURL(blob);
        
        // Tạo trigger tải file
        const link = document.createElement('a');
        link.href = url;
        
        // Đặt tên file (Xử lý extension tùy theo format)
        const ext = variables.format === 'moodle' ? 'xml' : variables.format;
        const prefix = variables.format === 'moodle' ? 'Moodle_Quiz' : 'Quiz';
        const fileName = `${prefix}_${variables.setId}.${ext}`;
        
        link.setAttribute('download', fileName);
        
        document.body.appendChild(link);
        link.click();
        
        // Dọn dẹp
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Bắt đầu tải file ${variables.format.toUpperCase()}!`);
        },
        onError: () => {
        toast.error('Không thể xuất file lúc này');
        }
    });

    return {
        // Dữ liệu danh sách bộ đề
        quizSets: response?.data || [],
        isLoading,

        // Chức năng tạo Quiz
        generateQuiz: generateMutation.mutate,
        isGenerating: generateMutation.isPending,

        // Chức năng lưu Quiz chính thức
        saveFinalQuiz: saveFinalMutation.mutate,
        isSavingFinal: saveFinalMutation.isPending,

        // Chức năng Export
        exportQuiz: exportMutation.mutate,
        isExporting: exportMutation.isPending
    };
};