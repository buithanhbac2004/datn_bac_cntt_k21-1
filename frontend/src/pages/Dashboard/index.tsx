import { usePageTitle } from '../../hooks/usePageTitle';
import { OverviewCards } from './components/OverviewCards';
import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';
import { useDashboard } from '@/hooks/useDashboard';

const DashboardPage = () => {
  usePageTitle('Tổng quan hệ thống', 'Theo dõi thống kê tài liệu, số lượng câu hỏi và hoạt động gần đây');

  const { data, isLoading } = useDashboard();

  return (
    <div className="flex flex-col gap-6 h-full pb-6">
      <OverviewCards stats={data.stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <QuickActions />
        <RecentActivities activities={data.recent_activities} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardPage;