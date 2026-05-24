// import { useAuthStore } from "@/stores/authStore";
import axiosClient from "./axiosClient";
import type { DocumentFilter } from "@/types/document";

export const documentApi = {

    uploadDocument: async (file: File): Promise<any> => {
        // 1. Khởi tạo FormData để gửi tệp tin
        const formData = new FormData();
        formData.append('file', file);

        // 2. Gọi API với header multipart/form-data
        const { data } = await axiosClient.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });

        return data;
    },


    getDocuments: async (filters: DocumentFilter): Promise<any> => {
        // Axios sẽ tự bóc tách DocumentFilter thành Query String
        const { data } = await axiosClient.get('/documents/list', { 
            params: filters 
        });
        return data;
    },

    getViewUrl: async (docId: number) => {
        const response = await axiosClient.get(`/documents/view/${docId}`, {
            responseType: 'blob', // Bắt buộc để nhận dữ liệu nhị phân
        });
        
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        return {
            url: URL.createObjectURL(blob),
            type: response.headers['content-type']
        };
    }
};