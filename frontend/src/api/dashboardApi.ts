import axiosClient from "./axiosClient";
import type { DashboardData } from "@/types/dashboard";

export const dashboardApi = {
    /**
     * Lấy dữ liệu thống kê tổng quan và hoạt động gần đây
     */
    getDashboardData: async (): Promise<{ success: boolean; data: DashboardData }> => {
        const { data } = await axiosClient.get('/dashboard/stats');
        return data;
    }
};
