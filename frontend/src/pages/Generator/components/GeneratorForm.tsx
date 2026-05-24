import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { BrainCircuit, FileText, Settings2, Sparkles, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import type { GenerateQuizRequest } from '@/types/question';

interface GeneratorFormProps {
  onSubmit: (data: GenerateQuizRequest) => void;
  isLoading: boolean;
}

export const GeneratorForm = ({ onSubmit, isLoading }: GeneratorFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GenerateQuizRequest>({
    defaultValues: {
      document_id: 0,
      total_questions: 5,
      num_recall: 2,
      num_understand: 2,
      num_apply: 1,
      difficulty: 'medium',
      question_type: 'multiple_choice',
      user_note: '',
    },
  });

  const [filters] = useState({ limit: 30, offset: 0 });
  const { documents } = useDocuments(filters);
  const numRecall = useWatch({ control, name: 'num_recall', defaultValue: 2 });
  const numUnderstand = useWatch({ control, name: 'num_understand', defaultValue: 2 });
  const numApply = useWatch({ control, name: 'num_apply', defaultValue: 1 });
  
  const questionCount = (numRecall || 0) + (numUnderstand || 0) + (numApply || 0);

  // Cập nhật lại total_questions ẩn để đúng chuẩn API
  const handleFormSubmit = (data: GenerateQuizRequest) => {
    data.total_questions = questionCount;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        
        {/* CỘT TRÁI: Nguồn dữ liệu & Thông số cơ bản */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chọn tài liệu */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-foreground font-semibold text-lg">
              <FileText className="text-primary w-5 h-5" />
              Nguồn dữ liệu
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Chọn tài liệu đã trích xuất <span className="text-red-500">*</span></label>
              <select 
                {...register('document_id', { 
                  required: 'Vui lòng chọn tài liệu',
                  valueAsNumber: true // Tự động ép kiểu string từ HTML Select sang number cho API
                })}
                defaultValue=""
                className={`w-full bg-background border ${errors.document_id ? 'border-red-500' : 'border-border focus:border-primary'} rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-colors cursor-pointer`}
              >
                <option value="">-- Click để chọn tài liệu --</option>
                {documents?.map((doc: any) => (
                  <option key={doc.id} value={doc.id}>{doc.file_name}</option>
                ))}
              </select>
              {errors.document_id && <p className="text-red-500 text-xs mt-1">{errors.document_id.message}</p>}
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4 text-foreground font-semibold text-lg">
              <BrainCircuit className="text-primary w-5 h-5" />
              Hướng dẫn AI (Prompt)
            </div>
            <div className="space-y-2">
              <textarea 
                {...register('user_note')}
                placeholder="VD: Tập trung vào các định nghĩa cốt lõi..."
                className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3 min-h-[120px] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Cấu hình chi tiết */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm sticky top-0">
            <div className="flex items-center gap-2 mb-6 text-foreground font-semibold text-lg">
              <Settings2 className="text-primary w-5 h-5" />
              Thông số bộ đề
            </div>

            {/* Phân bổ cấp độ nhận thức (Thay cho Số lượng tổng) */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-muted-foreground flex justify-between">
                <span>Phân bổ câu hỏi (Bloom)</span>
                <span className="text-primary font-bold">Tổng: {questionCount} câu</span>
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Nhận biết */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nhận biết</label>
                  <input 
                    type="number" 
                    {...register('num_recall', { min: 0, valueAsNumber: true })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                
                {/* Thông hiểu */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Thông hiểu</label>
                  <input 
                    type="number" 
                    {...register('num_understand', { min: 0, valueAsNumber: true })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                
                {/* Vận dụng */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Vận dụng</label>
                  <input 
                    type="number" 
                    {...register('num_apply', { min: 0, valueAsNumber: true })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              {questionCount === 0 && <p className="text-red-500 text-xs">Vui lòng nhập ít nhất 1 câu hỏi</p>}
            </div>

            {/* Độ khó */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-muted-foreground">Độ khó phân bổ</label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => field.onChange(level)}
                        className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${
                          field.value === level ? 'bg-primary/10 border-primary text-primary' : 'bg-background text-muted-foreground'
                        }`}
                      >
                        {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Định dạng câu hỏi (Đổi thành Radio) */}
            <div className="space-y-3 mb-8">
              <label className="text-sm font-medium text-muted-foreground">Định dạng câu hỏi</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted group">
                  <input 
                    type="radio" 
                    value="multiple_choice" 
                    {...register('question_type')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium">Trắc nghiệm</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted group">
                  <input 
                    type="radio" 
                    value="true_false" 
                    {...register('question_type')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium">Đúng / Sai</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-border shrink-0 flex justify-end">
        {/* <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang sinh câu hỏi...</> : <><Sparkles className="w-5 h-5" /> Khởi tạo Bộ câu hỏi</>}
        </button> */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
            ${isLoading 
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' 
              : 'bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/20'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI đang xử lý... ({questionCount} câu)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Khởi tạo Bộ câu hỏi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};