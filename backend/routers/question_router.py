from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from handlers.question_handler import export_quiz_handler, generate_quiz_handler, get_question_sets_handler
from utils.security import check_token
from schemas.question_schema import GenerateQuizRequest
# Import handler bạn đã viết ở bước trước
# from handlers.quiz_handler import generate_quiz_handler

router = APIRouter()

@router.post(
    "/quiz/generate", 
    summary="Tạo bộ câu hỏi từ tài liệu bằng AI",
    tags=["Quản lý Câu hỏi"]
)
async def api_generate_quiz(
    request: GenerateQuizRequest,
    token: str = Depends(check_token) # Giả định bạn đã có hàm check_token
):
    user_id = token.get("id") 

    # Gọi handler xử lý tổng thể
    result = await generate_quiz_handler(user_id, request)
    
    if not result["success"]:
        # Trả về lỗi 400 hoặc 500 kèm thông báo từ handler
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result

@router.post(
    "/quiz/save-final", 
    summary="Lưu bộ câu hỏi chính thức sau khi Preview & Edit",
    tags=["Quản lý Câu hỏi"]
)
async def api_save_final_quiz(
    request: dict,
    token: dict = Depends(check_token)
):
    user_id = token.get("id") 
    
    from handlers.question_handler import save_quiz_final_handler
    result = await save_quiz_final_handler(user_id, request)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result


@router.get(
    "/quiz/sets", 
    summary="Lấy danh sách các bộ câu hỏi đã tạo",
    tags=["Quản lý Câu hỏi"]
)
async def api_get_question_sets(
    search: str | None = Query(None, description="Tìm kiếm theo tiêu đề bộ đề"),
    document_id: int | None = Query(None, description="Lọc bộ đề theo ID tài liệu gốc"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    
    # Lấy thông tin user từ token (giống mẫu của bạn)
    token: dict = Depends(check_token)
):
    """
    API này thực hiện:
    1. Lấy user_id từ token xác thực.
    2. Gọi handler để truy vấn danh sách bộ đề từ database (có join bảng documents).
    3. Trả về danh sách kèm metadata phân trang.
    """
    
    # 1️⃣ Lấy user_id từ payload của token
    user_id = token.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Không tìm thấy ID người dùng trong token")

    # 2️⃣ Gọi handler xử lý logic lấy dữ liệu
    # (Hàm get_question_sets_handler chúng ta đã viết ở lượt trước)
    result = await get_question_sets_handler(
        user_id=user_id,
        search=search,
        document_id=document_id,
        limit=limit,
        offset=offset
    )
    
    # 3️⃣ Kiểm tra kết quả và trả về cho người dùng
    if not result["success"]:
        # Trả về lỗi 400 nếu có vấn đề từ phía handler hoặc database
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result


@router.get(
    "/quiz/export/{set_id}",
    summary="Xuất bộ đề thi (PDF, DOCX, Moodle XML)",
    tags=["Quản lý Câu hỏi"]
)
async def api_export_quiz(
    set_id: int,
    format: str = Query("docx", regex="^(pdf|docx|moodle)$"),
    token: dict = Depends(check_token)
):
    user_id = token.get("id")
    
    # Gọi handler (Hàm này giờ đã xử lý cả 3 định dạng)
    result = await export_quiz_handler(set_id, user_id, format)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return StreamingResponse(
        result["file_stream"], 
        media_type=result["media_type"],
        headers={"Content-Disposition": f"attachment; filename={result['file_name']}"}
    )