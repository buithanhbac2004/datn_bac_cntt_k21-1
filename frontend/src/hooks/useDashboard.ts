import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';

export const useDashboard = () => {
    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => dashboardApi.getDashboardData(),
        refetchOnWindowFocus: true, // Tự động cập nhật khi user quay lại tab
    });

    return {
        data: response?.data || {
            stats: {
                total_documents: 0,
                total_question_sets: 0,
                total_questions: 0,
                ai_speed_seconds: 0,
                ai_accuracy: 0
            },
            recent_activities: []
        },
        isLoading,
        error,
        refetch
    };
};
