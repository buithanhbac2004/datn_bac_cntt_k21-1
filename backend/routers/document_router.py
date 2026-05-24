import mimetypes
import os

from fastapi import APIRouter, Depends, HTTPException, File, Query, UploadFile, Form
from typing import Any

from fastapi.responses import FileResponse
from handlers.document_handler import add_document_handler, get_document_by_id_handler, get_documents_list_handler
from utils.security import check_token
router = APIRouter()

@router.post(
    "/documents/upload",
    summary="Tải lên tài liệu mới",
    tags=["Quản lý Tài liệu"],
    description="Tải lên tệp tin PDF, TXT, DOCX, DOC (tối đa 20MB). Yêu cầu token hợp lệ."
)
async def upload_document_api(
    file: UploadFile = File(...),
    token: str = Depends(check_token)
):
    try:
        user_id = token.get("id")
        
        # 1. Gọi handler để xử lý toàn bộ logic (định dạng, dung lượng, lưu trữ)
        result = await add_document_handler(user_id, file)
        
        # 2. Kiểm tra kết quả từ handler
        if result is None:
            raise HTTPException(
                status_code=500, 
                detail="Xảy ra lỗi không xác định trong quá trình xử lý tài liệu."
            )
            
        # Nếu handler báo thất bại (sai định dạng, quá dung lượng, lỗi DB...)
        if not result.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=result.get("message")
            )
            
        # 3. Trả về kết quả thành công
        return result

    except HTTPException as http_exc:
        # Chuyển tiếp các HTTPException (bao gồm cả cái vừa raise ở trên)
        raise http_exc
    except Exception as e:
        # Lỗi không lường trước được
        raise HTTPException(
            status_code=500, 
            detail=f"Lỗi hệ thống: {str(e)}"
        )
    

@router.get(
    "/documents/list",
    summary="Lấy danh sách tài liệu có phân trang và tìm kiếm",
    tags=["Quản lý Tài liệu"],
    description="Hỗ trợ lọc theo user_id, tên file, trạng thái và phân trang (limit/offset)."
)
async def get_documents_api(
    # Sử dụng cú pháp | None thay cho Optional
    file_name: str | None = Query(None, description="Tìm kiếm theo tên tài liệu"),
    status: str | None = Query(None, description="Lọc theo trạng thái"),
    limit: int = Query(30, ge=1, le=100, description="Số lượng bản ghi mỗi trang"),
    offset: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    token: str = Depends(check_token)
):
    try:
        # Gọi handler xử lý logic
        user_id = token.get('id')
        result = await get_documents_list_handler(
            user_id=user_id,
            file_name=file_name,
            status=status,
            limit=limit,
            offset=offset
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        return result

    except HTTPException as http_e:
        raise http_e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    

@router.get(
    "/documents/view/{doc_id}", 
    summary="Xem tài liệu",
    tags=["Quản lý Tài liệu"],
)
async def view_document_api(doc_id: int, token: str = Depends(check_token)):
    # 1. Lấy thông tin từ DB
    data = await get_document_by_id_handler(doc_id)
    doc = data.get('data')
    if not doc:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")

    # 2. Kiểm tra file vật lý
    if not os.path.exists(doc['file_path']):
        raise HTTPException(status_code=404, detail="File vật lý đã bị xóa hoặc thất lạc")

    # 3. Tự động xác định MIME type (VD: text/plain cho .txt, application/pdf cho .pdf)
    mime_type, _ = mimetypes.guess_type(doc['file_path'])

    # 4. Trả file về với chế độ inline
    return FileResponse(
        path=doc['file_path'], 
        filename=doc['file_name'],
        media_type=mime_type or "application/octet-stream",
        content_disposition_type="inline" # QUAN TRỌNG: Đổi từ attachment sang inline
    )