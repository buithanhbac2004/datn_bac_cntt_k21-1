import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { AIQuizResponse, GenerateQuizRequest, Question } from '@/types/question';

interface QuizPreviewProps {
  data: AIQuizResponse;
  config: GenerateQuizRequest;
  onCancel: () => void;
  onSave: (finalData: AIQuizResponse) => void;
  isSaving: boolean;
}

export const QuizPreview = ({ data, onCancel, onSave, isSaving }: QuizPreviewProps) => {
  const [editedData, setEditedData] = useState<AIQuizResponse>(data);

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...editedData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setEditedData({ ...editedData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...editedData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = { ...newOptions[optIndex], option_text: value };
    newQuestions[qIndex].options = newOptions;
    setEditedData({ ...editedData, questions: newQuestions });
  };

  const handleCorrectChange = (qIndex: number, optIndex: number) => {
    const newQuestions = [...editedData.questions];
    const newOptions = newQuestions[qIndex].options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIndex
    }));
    newQuestions[qIndex].options = newOptions;
    setEditedData({ ...editedData, questions: newQuestions });
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-foreground">Kiểm duyệt: {editedData.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{editedData.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            onClick={() => onSave(editedData)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu chính thức'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
        {editedData.questions.map((q, qIndex) => (
          <div key={qIndex} className="p-5 border border-border rounded-xl bg-background space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">Câu {qIndex + 1}:</span>
                  <select
                    value={q.cognitive_level || 'RECALL'}
                    onChange={(e) => handleQuestionChange(qIndex, 'cognitive_level', e.target.value)}
                    className="text-xs border border-border rounded bg-surface px-2 py-1 outline-none"
                  >
                    <option value="RECALL">Nhận biết</option>
                    <option value="UNDERSTAND">Thông hiểu</option>
                    <option value="APPLY">Vận dụng</option>
                  </select>
                </div>
                <textarea
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 outline-none focus:border-primary resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${opt.is_correct ? 'border-green-500 bg-green-500/10' : 'border-border bg-surface'}`}
                >
                  <input
                    type="radio"
                    name={`correct_${qIndex}`}
                    checked={opt.is_correct}
                    onChange={() => handleCorrectChange(qIndex, optIndex)}
                    className="w-4 h-4 text-green-500 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={opt.option_text}
                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs text-muted-foreground block mb-1">Giải thích đáp án:</label>
              <textarea
                value={q.explanation || ''}
                onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm resize-none"
                rows={1}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
