from pydantic import BaseModel
from datetime import datetime





# Model hứng 1 Đáp án từ AI
class Option(BaseModel):
    option_text: str
    is_correct: bool
    distractor_logic: str | None = None # Giải thích tại sao sai

# Model hứng 1 Câu hỏi từ AI (bao gồm danh sách đáp án bên trong)
class Question(BaseModel):
    question_text: str
    question_type: str
    difficulty: str | None = None # độ khó 
    cognitive_level: str | None = "RECALL" # RECALL, UNDERSTAND, APPLY
    explanation: str | None = None # Diễn giải đáp án đúng
    options: list[Option] # Chứa danh sách đáp án

class QuizExportData(BaseModel):
    title: str
    description: str | None
    total_questions: int
    questions: list[Question]

# Model hứng toàn bộ kết quả từ AI
class AIQuizResonse(BaseModel):
    title: str
    description: str
    questions: list[Question]

class GenerateQuizRequest(BaseModel):
    document_id: int
    total_questions: int = 5
    # Cấu hình phân bổ cấp độ (Bloom's Taxonomy)
    num_recall: int = 2
    num_understand: int = 2
    num_apply: int = 1
    difficulty: str = "medium" # easy, medium, hard
    question_type: str = "multiple_choice" # or true_false
    user_note: str = ""

# Model dùng cho việc lưu chính thức sau khi sửa (Preview & Save)
class SaveFinalRequest(BaseModel):
    config: GenerateQuizRequest
    quiz_data: AIQuizResonse
    generation_time: float = 0.0
    accuracy_score: float = 100.0 # Thêm tỉ lệ % độ chính xác AI