import subprocess
from datetime import datetime
import os
from pathlib import Path
import traceback
from fastapi import UploadFile
import aiofiles
from models.document_model import add_document, get_document_by_id, get_documents_list
from schemas.document_schema import DocumentRequest
from models.activity_model import log_activity
import uuid
import shutil
import platform
# Thư mục gốc để lưu trữ tài liệu
BASE_DIR = Path(__file__).resolve().parent.parent # Trỏ về gốc dự án
UPLOAD_DIR = BASE_DIR / "storage" / "documents"
MAX_FILE_SIZE = 6 * 1024 * 1024  #  6MB tính bằng bytes

# Đảm bảo thư mục tồn tại khi khởi chạy code
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".doc"}

def get_libreoffice_bin():
    # 1. Thử tìm lệnh trong hệ thống (PATH) - Cách này chạy tốt trên Linux
    bin_path = shutil.which("libreoffice") or shutil.which("soffice")
    if bin_path:
        return bin_path
    
    # 2. Nếu là Windows và không thấy trong PATH, trỏ thủ công
    if platform.system() == "Windows":
        standard_path = r"C:\Program Files\LibreOffice\program\soffice.exe"
        if os.path.exists(standard_path):
            return standard_path
            
    return "soffice" # Giá trị mặc định cuối cùng

LIBREOFFICE_BIN = get_libreoffice_bin()

async def add_document_handler(user_id: int, file: UploadFile):
    try:
        # 1. Kiểm tra dung lượng
        if file.size > MAX_FILE_SIZE:
            return {"success": False, "message": "File quá lớn. Giới hạn 20MB."}

        # 2. Xử lý tên và đường dẫn
        file_name = file.filename
        file_ext = os.path.splitext(file_name)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return {
                "success": False, 
                "message": f"Định dạng {file_ext} không hợp lệ. Chỉ chấp nhận: {', '.join(ALLOWED_EXTENSIONS)}"
            }
        random_id = uuid.uuid4().hex
        unique_file_name = f"{user_id}_{random_id}{file_ext}"

        # full_path để thao tác với hệ điều hành (giữ nguyên gốc)
        full_path = Path(UPLOAD_DIR) / unique_file_name
        # file_path_db để lưu vào database (chuẩn hóa /)
        # file_path_db = full_path.as_posix()

        # 3. Đọc dữ liệu và Lưu file vật lý
        # Dùng full_path ở đây để aiofiles tự xử lý dấu gạch phù hợp với OS
        content = await file.read()
        async with aiofiles.open(full_path, mode='wb') as f:
            await f.write(content)

        # 4. LOGIC CHUYỂN ĐỔI PDF
        final_path = full_path
        if file_ext in [".docx", ".doc"]:
            try:
                # Chạy lệnh convert
                # --headless: Không mở giao diện
                # --convert-to pdf: Chuyển sang pdf
                # --outdir: Xuất ra cùng thư mục lưu trữ
                import subprocess
                subprocess.run([
                    LIBREOFFICE_BIN,
                    '--headless',
                    '--convert-to', 'pdf',
                    '--outdir', str(UPLOAD_DIR),
                    str(full_path)
                ], check=True, capture_output=True)

                # Sau khi convert, file mới sẽ có đuôi .pdf
                final_path = full_path.with_suffix(".pdf")

                # Xóa file gốc (.docx) để tiết kiệm bộ nhớ, chỉ giữ lại PDF
                if os.path.exists(full_path):
                    os.remove(full_path)
            except Exception as e:
                print(f"Lỗi convert LibreOffice: {e}")
                # Nếu lỗi convert, vẫn giữ file gốc để xử lý dự phòng nếu cần

        doc_data = DocumentRequest(
            user_id=user_id,
            file_name=file_name,
            file_path=final_path.as_posix(),  # Lưu đường dẫn chuẩn hóa vào DB
            file_ext=file_ext,
            file_size=file.size,  # Lưu giá trị số nguyên (bytes)
            processing_status="Đang chờ"
        )
        
        doc_id = await add_document(doc_data)
        
        if doc_id:
            import asyncio
            # Ghi log hoạt động
            asyncio.create_task(log_activity(
                user_id, 
                "UPLOAD", 
                f"Bạn đã tải lên tài liệu: {file_name}"
            ))
            return {"success": True, "message": f"Thêm thành công file với id {doc_id}"}
        return {"success": False, "message": "Lưu database thất bại"}

    except Exception as e:
        traceback.print_exc()
        return {"success": False, "message": f"Lỗi hệ thống: {str(e)}"}
    

async def get_documents_list_handler(
    user_id: int | None = None,
    file_name: str | None = None,
    status: str | None = None,
    limit: int = 30,
    offset: int = 0
):
    try:
        # Đóng gói các điều kiện tìm kiếm
        conditions = {
            "user_id": user_id,
            "file_name": file_name,
            "processing_status": status
        }
        
        docs = await get_documents_list(conditions, limit, offset)
        
        return {
            "success": True,
            "data": docs,
            "total": len(docs), # Lưu ý: Nếu muốn lấy tổng số thực tế trong DB cần viết thêm 1 query COUNT
            "message": "Lấy danh sách tài liệu thành công"
        }
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "message": f"Lỗi hệ thống: {str(e)}"}
    

async def get_document_by_id_handler(id: int):
    try:
        data = await get_document_by_id(id)
        if data: 
            return {
                "success": True,
                "data": data,
                "message": "Lấy danh sách tài liệu thành công"
            }
        else:
            return {
                "success": False,
                "data": data,
                "message": "Lấy danh sách tài liệu thất bại"
            }

    except Exception as e:
        traceback.print_exc()
        return {"success": False, "message": f"Lỗi hệ thống: {str(e)}"}