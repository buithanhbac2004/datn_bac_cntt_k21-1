export interface DashboardStats {
  total_documents: number;
  total_question_sets: number;
  total_questions: number;
  ai_speed_seconds: number;
  ai_accuracy: number;
}

export interface ActivityLog {
  id: number;
  action_type: 'UPLOAD' | 'GENERATE' | 'SAVE' | 'EXPORT' | string;
  description: string;
  status: 'SUCCESS' | 'PENDING' | 'ERROR' | string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_activities: ActivityLog[];
}
