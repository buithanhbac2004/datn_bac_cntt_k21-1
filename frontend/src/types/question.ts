

export interface QuizSet {
  id: number;
  document_id: number;
  document_name: string;   // Tên file gốc (VD: "Bài Giảng TTNT...")
  user_id: number;
  title: string;           // Tiêu đề bộ câu hỏi
  description: string;     // Mô tả bộ đề
  total_questions: number; // Tổng số câu hỏi
  created_at: string;      // Định dạng: "2026-04-15T06:50:49..."
  ai_config: string;       // Lưu ý: API đang trả về chuỗi JSON stringified
}

export interface Option {
  option_text: string;
  is_correct: boolean;
  distractor_logic?: string | null; // Giải thích tại sao sai (Optional)
}

/**
 * Cấu trúc một câu hỏi hoàn chỉnh
 */
export interface Question {
  question_text: string;
  question_type: string;
  difficulty?: string | null;       // Độ khó (Optional)
  cognitive_level?: string | null;  // Cấp độ nhận thức
  explanation?: string | null;      // Diễn giải đáp án đúng (Optional)
  options: Option[];                // Danh sách các lựa chọn
}

/**
 * Cấu trúc trả về từ AI
 */
export interface AIQuizResponse {
  title: string;
  description: string;
  questions: Question[];
}

/**
 * Yêu cầu gửi lên để tạo Quiz
 */
export interface GenerateQuizRequest {
  document_id: number;
  total_questions: number;
  num_recall: number;
  num_understand: number;
  num_apply: number;
  difficulty: "easy" | "medium" | "hard"; // Sử dụng Literal Type để giới hạn giá trị
  question_type: "multiple_choice" | "true_false";
  user_note: string;
}

export interface SaveFinalRequest {
  config: GenerateQuizRequest;
  quiz_data: AIQuizResponse;
  generation_time: number;
  accuracy_score: number;
}

export interface QuizSetFilter {
    search?: string;
    document_id?: number;
    limit?: number;
    offset?: number;
}