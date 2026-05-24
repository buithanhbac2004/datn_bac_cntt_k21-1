import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ActivityLog } from '@/types/dashboard';

interface Props {
  activities: ActivityLog[];
  isLoading?: boolean;
}

export const RecentActivities = ({ activities, isLoading }: Props) => {
  // Hàm format thời gian (ví dụ: '2026-04-24T04:40:00' -> '10 phút trước' hoặc chuỗi locale)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const getActionTypeInfo = (type: string) => {
    switch (type) {
      case 'UPLOAD': return { bg: 'bg-blue-500', actionPrefix: 'Tải lên' };
      case 'GENERATE': return { bg: 'bg-emerald-500', actionPrefix: 'AI trích xuất' };
      case 'SAVE': return { bg: 'bg-purple-500', actionPrefix: 'Lưu bộ đề' };
      case 'EXPORT': return { bg: 'bg-orange-500', actionPrefix: 'Xuất file' };
      default: return { bg: 'bg-gray-500', actionPrefix: 'Thao tác' };
    }
  };

  return (
    <div className="lg:col-span-2 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-foreground">Hoạt động gần đây</h3>
        {/* <button className="text-sm font-medium text-primary hover:underline">Xem tất cả</button> */}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-muted-foreground animate-pulse">Đang tải...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
            Chưa có hoạt động nào.
          </div>
        ) : (
          <div className="relative border-l-2 border-muted ml-3 space-y-8">
            {activities.map((activity) => {
              const { bg, actionPrefix } = getActionTypeInfo(activity.action_type);

              return (
                <div key={activity.id} className="relative pl-6 group">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-surface ${bg}`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground mr-1">[{actionPrefix}]</span>
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {formatTime(activity.created_at)}
                        </span>
                        {activity.status === 'SUCCESS' ? (
                          <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                          </span>
                        ) : activity.status === 'ERROR' ? (
                          <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Thất bại
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-pulse" /> Đang xử lý
                          </span>
                        )}
                      </div>
                    </div>

                    {/* <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg text-sm font-medium flex items-center gap-1">
                      <FileText className="w-4 h-4" /> Chi tiết
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};