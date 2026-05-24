from pydantic import BaseModel
from datetime import datetime

class DocumentRequest(BaseModel):
    user_id: int
    file_name: str
    file_path: str
    file_ext: str # đuôi định dạng tệp
    file_size: int
    processing_status: str # trạng thái xử lí tài liệu đang chờ, đang xử lý, hoàn thành


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_path: str
    file_ext: str # đuôi định dạng tệp
    file_size: int
    processing_status: str # trạng thái xử lí tài liệu đang chờ, đang xử lý, hoàn thành 
    created_at: datetime

