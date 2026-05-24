import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { GeneratorForm } from './components/GeneratorForm';
import { useQuiz } from '@/hooks/useQuestion';
import type { GenerateQuizRequest, AIQuizResponse } from '@/types/question';
import { QuizPreview } from './components/QuizPreview';
import { useState } from 'react';

const GeneratorPage = () => {
  usePageTitle('Tạo câu hỏi AI', 'Cấu hình tham số, độ khó và tự động sinh bộ câu hỏi từ tài liệu');

  const navigate = useNavigate();
  const { generateQuiz, isGenerating, saveFinalQuiz, isSavingFinal } = useQuiz();

  const [previewData, setPreviewData] = useState<AIQuizResponse | null>(null);
  const [currentConfig, setCurrentConfig] = useState<GenerateQuizRequest | null>(null);
  const [genTime, setGenTime] = useState<number>(0);

  // Nhận trực tiếp GenerateQuizRequest từ Form
  const handleGenerate = (payload: GenerateQuizRequest) => {
    console.log("🚀 Payload chuẩn gửi lên AI API:", payload);

    generateQuiz(payload, {
      onSuccess: (response: any) => {
        // AI trả về data draft (preview) thay vì ID
        setPreviewData(response.data);
        setCurrentConfig(payload);
        setGenTime(response.generation_time || 0); // Lưu thời gian AI xử lý
      }
    });
  };

  const handleSaveFinal = (finalData: AIQuizResponse) => {
    if (!currentConfig || !previewData) return;

    // Tính toán độ chính xác (Accuracy Score)
    // So sánh xem có bao nhiêu câu hỏi bị thay đổi nội dung so với bản nháp ban đầu của AI
    let editedCount = 0;
    finalData.questions.forEach((q, index) => {
      const originalQ = previewData.questions[index];
      if (originalQ) {
        const isTextSame = q.question_text === originalQ.question_text;
        const isOptionsSame = JSON.stringify(q.options) === JSON.stringify(originalQ.options);
        
        if (!isTextSame || !isOptionsSame) {
          editedCount++;
        }
      }
    });

    const totalQ = finalData.questions.length;
    const accuracy = totalQ > 0 ? ((totalQ - editedCount) / totalQ) * 100 : 100;

    saveFinalQuiz({ 
      config: currentConfig, 
      quiz_data: finalData,
      generation_time: genTime,
      accuracy_score: accuracy
    }, {
      onSuccess: () => {
        setPreviewData(null);
        setCurrentConfig(null);
        setGenTime(0);
        // Chuyển tới trang ngân hàng câu hỏi hoặc xem trước
        navigate('/question-bank');
      }
    });
  };

  if (previewData && currentConfig) {
    return (
      <QuizPreview
        data={previewData}
        config={currentConfig}
        onCancel={() => {
          setPreviewData(null);
          setCurrentConfig(null);
        }}
        onSave={handleSaveFinal}
        isSaving={isSavingFinal}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-surface border border-border rounded-2xl p-6">
        <GeneratorForm onSubmit={handleGenerate} isLoading={isGenerating} />
      </div>
    </div>
  );
};

export default GeneratorPage;