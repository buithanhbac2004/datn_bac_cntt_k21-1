import json
import os
from google import genai # Import kiểu mới
from schemas.question_schema import AIQuizResonse, GenerateQuizRequest
api_key = os.getenv("GEMINI_API_KEY") 
client = genai.Client(api_key=api_key)





def build_ai_prompt(document_content: str, total_questions: int, difficulty: str, question_type: str):
    prompt = f"""
    Bạn là một chuyên gia giáo dục. Hãy đọc nội dung tài liệu sau và tạo ra một bộ câu hỏi kiểm tra.
    
    YÊU CẦU:
    1. Số lượng câu hỏi: {total_questions}
    2. Độ khó: {difficulty}
    3. Loại câu hỏi: {question_type}
    4. Mỗi câu hỏi phải có đúng 4 đáp án (1 đúng, 3 sai).
    5. Cung cấp giải thích chi tiết cho đáp án đúng và logic gây nhiễu cho đáp án sai.

    TÀI LIỆU:
    "{document_content}"

    ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
    Bạn CHỈ ĐƯỢC PHÉP trả về một chuỗi JSON hợp lệ, tuyệt đối không có markdown (như ```json), không có text giải thích thừa. Cấu trúc JSON phải tuân thủ chính xác định dạng sau:
    {{
        "title": "Tiêu đề bộ câu hỏi (ngắn gọn)",
        "description": "Mô tả mục đích bộ câu hỏi",
        "questions": [
            {{
                "question_text": "Nội dung câu hỏi",
                "question_type": "{question_type}",
                "difficulty": "{difficulty}",
                "explanation": "Giải thích tại sao đáp án lại đúng",
                "options": [
                    {{
                        "option_text": "Nội dung đáp án A",
                        "is_correct": true,
                        "distractor_logic": "Để rỗng nếu là đáp án đúng"
                    }},
                    {{
                        "option_text": "Nội dung đáp án B",
                        "is_correct": false,
                        "distractor_logic": "Giải thích tại sao học sinh có thể chọn nhầm đáp án này"
                    }}
                ]
            }}
        ]
    }}
    """
    return prompt

async def list_available_models():
    print("--- CÁC MODEL BẠN CÓ THỂ DÙNG ---")
    try:
        # Lấy danh sách model
        models = await client.aio.models.list()
        
        for m in models:
            # In ra tất cả các tên model để bạn chọn
            print(f"Tên chuẩn: {m.name}")
            
    except Exception as e:
        print(f"Lỗi khi liệt kê: {e}")

async def generate_quiz_from_ai(document_content: str, config: dict) -> AIQuizResonse:
    # 1. Chuẩn bị Prompt (Dùng lại hàm build_ai_prompt cũ của bạn)
    prompt = build_ai_prompt(
        document_content=document_content,
        total_questions=config['total_questions'],
        difficulty=config['difficulty'],
        question_type=config['question_type']
    )
    # await list_available_models()
    
    try:
        # 2. Gọi API bằng SDK mới (Sử dụng await cho tác vụ bất đồng bộ)
        # Lưu ý: SDK mới dùng client.models.generate_content
        response = await client.aio.models.generate_content(
            model='gemma-4-31b-it', # Dùng flash cho nhanh và rẻ
            contents=prompt,
            config={
                'response_mime_type': 'application/json' # Ép AI trả về JSON
            }
        )
        
        # 3. Lấy dữ liệu văn bản từ response
        # Với SDK mới, response.text sẽ chứa chuỗi JSON
        raw_json = json.loads(response.text)
        
        # 4. Validate và chuyển đổi sang Pydantic Object
        ai_result = AIQuizResonse(**raw_json)
        return ai_result

    except Exception as e:
        print(f"Lỗi khi xử lý dữ liệu từ AI: {e}")
        # Bạn có thể cân nhắc raise lỗi để phía Router xử lý hoặc trả về None
        return None
    

def build_ai_prompt_for_file(config: GenerateQuizRequest):
    additional_guidelines = f"\nLƯU Ý RIÊNG TỪ NGƯỜI DÙNG:\n- {config.user_note}" if config.user_note else ""

    if config.question_type == "multiple_choice":
        option_requirement = "Mỗi câu hỏi PHẢI CÓ ĐÚNG 4 đáp án."
        num_options_hint = "4"
        sample_options = """
                    {"option_text": "A", "is_correct": true, "distractor_logic": ""},
                    {"option_text": "B", "is_correct": false, "distractor_logic": "..."},
                    {"option_text": "C", "is_correct": false, "distractor_logic": "..."},
                    {"option_text": "D", "is_correct": false, "distractor_logic": "..."}
        """
    else:
        option_requirement = "Mỗi câu hỏi PHẢI CÓ ĐÚNG 2 đáp án (Đúng/Sai)."
        num_options_hint = "2"
        sample_options = """
                    {"option_text": "Đúng", "is_correct": true, "distractor_logic": ""},
                    {"option_text": "Sai", "is_correct": false, "distractor_logic": "..."}
        """

    prompt = f"""
    BẠN LÀ MÁY TẠO CÂU HỎI TRẮC NGHIỆM CHUYÊN NGHIỆP. 
    Dựa trên tài liệu đính kèm, hãy tạo chính xác {config.total_questions} câu hỏi với sự phân bổ cấp độ nhận thức (Bloom's Taxonomy) như sau:
    - NHẬN BIẾT (RECALL): {config.num_recall} câu.
    - THÔNG HIỂU (UNDERSTAND): {config.num_understand} câu.
    - VẬN DỤNG (APPLY): {config.num_apply} câu.
    
    QUY TẮC NGHIÊM NGẶT:
    1. TỔNG SỐ LƯỢNG: Phải tạo ĐÚNG {config.total_questions} câu. (Tổng của 3 cấp độ trên phải bằng {config.total_questions}).
    2. LOẠI CÂU HỎI: {config.question_type}.
    3. ĐỘ KHÓ CHUNG: {config.difficulty}.
    4. CẤU TRÚC ĐÁP ÁN: {option_requirement}
    5. PHÂN LOẠI: Mỗi câu hỏi PHẢI có trường "cognitive_level" chứa một trong các giá trị: "RECALL", "UNDERSTAND", "APPLY".
    {additional_guidelines} 

    YÊU CẦU ĐẦU RA:
    - CHỈ TRẢ VỀ JSON. Không giải thích thêm.
    - Đảm bảo tính chính xác về kiến thức dựa trên tài liệu.

    CẤU TRÚC MẪU CHO MỖI CÂU HỎI:
    {{
        "title": "Tiêu đề bộ đề",
        "description": "Mô tả mục đích",
        "questions": [
            {{
                "question_text": "Nội dung câu hỏi",
                "question_type": "{config.question_type}",
                "cognitive_level": "RECALL",
                "difficulty": "{config.difficulty}",
                "explanation": "Tại sao đúng",
                "options": [{sample_options}]
            }}
        ]
    }}
    """
    return prompt

async def generate_quiz_from_ai_for_file(file_path: str, config: GenerateQuizRequest) -> AIQuizResonse:
    # 1. Tạo prompt dựa trên cấu trúc chuẩn của bạn
    prompt_text = build_ai_prompt_for_file(config)
    
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        print(f"Đang gửi tài liệu {file_path} với định dạng {file_ext} đến AI...")
        # 2. Upload file (theo đúng tài liệu Gemini 2.0)
        my_file = client.files.upload(file=file_path)

        # --- BƯỚC ĐẾM TOKEN ĐẦU VÀO ---
        # Đếm tổng token của cả Prompt văn bản và File đính kèm
        input_tokens_info = await client.aio.models.count_tokens(
            model='gemini-3.1-flash-lite-preview',
            contents=[prompt_text, my_file]
        )
        total_input_tokens = input_tokens_info.total_tokens
        print(f">>> Tổng token đầu vào: {total_input_tokens}")

        # 3. Gửi cho AI: Prompt chi tiết + File tham chiếu
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=[prompt_text, my_file], # Kết hợp tại đây
            config={
                'response_mime_type': 'application/json',
                'response_schema': AIQuizResonse,
                # 'max_output_tokens': 10000
                # 'mime_type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
        )
        # Cách 1: Lấy trực tiếp từ metadata của response (nếu SDK hỗ trợ)
        usage_metadata = response.usage_metadata
        output_tokens = usage_metadata.candidates_token_count
        print(f">>> Token đầu ra (AI vừa viết): {output_tokens}")
        print(f">>> Tổng token tiêu tốn cho phiên này: {usage_metadata.total_token_count}")
        
       # 1. Lấy text và làm sạch sơ bộ
        raw_text = response.text.strip()
        
        # 2. Xử lý cắt chuỗi nếu AI nói thừa ở đầu/cuối
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            raw_text = raw_text[start_idx:end_idx + 1]

        # 3. Parse JSON
        try:
            data = json.loads(raw_text)
            # 4. Kiểm tra qua Pydantic để đảm bảo khớp dữ liệu
            return AIQuizResonse(**data)
        except json.JSONDecodeError as jde:
            # Ghi lại tệp lỗi để bạn mở lên soi dòng 467 xem nó viết cái gì
            with open("dump_error_content.json", "w", encoding="utf-8") as f:
                f.write(raw_text)
            print(f"Lỗi cú pháp tại: {jde}")
            return {"error": {"message": str(e)}}

    except Exception as e:
        print(f"Lỗi AI: {e}")
        return {"error": {"message": str(e)}}