import { Files, BrainCircuit, Database, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

interface Props {
  stats: DashboardStats;
  isLoading?: boolean;
}

export const OverviewCards = ({ stats, isLoading }: Props) => {
  const STATS_DATA = [
    { title: 'Tổng tài liệu', value: stats.total_documents, change: 'Tổng cộng', icon: Files, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Câu hỏi đã tạo', value: stats.total_questions, change: 'Trong các bộ đề', icon: BrainCircuit, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Ngân hàng đề', value: stats.total_question_sets, change: 'Đã lưu', icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Hiệu suất AI', value: `${stats.ai_accuracy}%`, change: `Tốc độ ~${stats.ai_speed_seconds}s/câu`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      {STATS_DATA.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`bg-surface border border-border rounded-2xl p-5 transition-all duration-300 group ${isLoading ? 'animate-pulse' : 'hover:shadow-md hover:-translate-y-1'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} transition-colors group-hover:scale-110 duration-300`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-foreground mb-1">
                {isLoading ? <div className="h-9 w-16 bg-muted rounded"></div> : stat.value}
              </h4>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="mt-3 text-xs font-medium text-emerald-500 bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
                {stat.change}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};