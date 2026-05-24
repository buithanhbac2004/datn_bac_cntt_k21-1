import axiosClient from "./axiosClient";
import type {
    GenerateQuizRequest,
    QuizSetFilter,
    SaveFinalRequest
} from "@/types/question";

export const quizApi = {
    /**
     * 1. Tạo bộ câu hỏi mới từ tài liệu bằng AI (Bản draft)
     */
    generateQuiz: async (payload: GenerateQuizRequest): Promise<any> => {
        const { data } = await axiosClient.post('/quiz/generate', payload);
        return data;
    },

    /**
     * LƯU FINAL CHÍNH THỨC SAU KHI EDIT
     */
    saveFinalQuiz: async (payload: SaveFinalRequest): Promise<any> => {
        const { data } = await axiosClient.post('/quiz/save-final', payload);
        return data;
    },

    /**
     * 2. Lấy danh sách các bộ câu hỏi đã tạo
     */
    getQuizSets: async (filters: QuizSetFilter): Promise<any> => {
        const { data } = await axiosClient.get('/quiz/sets', {
            params: filters
        });
        return data;
    },

    /**
     * 3. Xuất và tải file bộ đề thi (PDF/DOCX/MOODLE)
     */
    exportQuiz: async (setId: number, format: 'pdf' | 'docx' | 'moodle' = 'moodle') => {
        const response = await axiosClient.get(`/quiz/export/${setId}`, {
            params: { format },
            responseType: 'blob', // Nhận stream nhị phân
        });

        return {
            data: response.data,
            contentType: response.headers['content-type'],
            contentDisposition: response.headers['content-disposition']
        };
    }
};