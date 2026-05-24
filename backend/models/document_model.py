import asyncio
from datetime import datetime
import json
import database
import traceback
from schemas.document_schema import DocumentRequest, DocumentResponse

# Giả định bạn đã có các lớp Pydantic DocumentRequest và database object

# 1. Hàm Thêm tài liệu mới
async def add_document(doc: DocumentRequest):
    try:
        # Sử dụng pool kết nối từ database module của bạn
        async with database.data_pool.acquire() as conn:
            # Câu lệnh SQL thêm dữ liệu và trả về ID vừa tạo (RETURNING id)
            # Lưu ý: created_at thường được DB tự tạo bằng DEFAULT NOW()
            sql = """
                INSERT INTO documents (
                    user_id, 
                    file_name, 
                    file_path, 
                    file_ext, 
                    file_size, 
                    processing_status,
                    created_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id
            """
            
            # Thực thi câu lệnh với các giá trị từ Pydantic model
            new_id = await conn.fetchval(
                sql, 
                doc.user_id, 
                doc.file_name, 
                doc.file_path, 
                doc.file_ext, 
                doc.file_size, 
                doc.processing_status,
                datetime.now()
            )
            
            print(f"Đã thêm tài liệu mới với ID: {new_id}")
            return new_id
            
    except Exception as e:
        # In chi tiết lỗi để phục vụ việc debug
        traceback.print_exc()
        print(f"Lỗi khi thêm tài liệu: {str(e)}")
        return None
    
# Hàm lấy danh sách tài liệu theo user_id
async def get_documents_list(search_conditions: dict = None, limit: int = 30, offset: int = 0):
    try:
        async with database.data_pool.acquire() as conn:
            # 1️⃣ Khởi tạo tham số và bộ lọc cơ bản
            params = []
            filter_sql = "WHERE 1=1"

            # 2️⃣ Xây dựng bộ lọc động (Dynamic Filter)
            if search_conditions:
                for key, value in search_conditions.items():
                    # Bỏ qua các giá trị rỗng hoặc mặc định
                    if value in [None, "", "all", []]:
                        continue
                    
                    current_idx = len(params) + 1
                    
                    # Tìm kiếm theo tên file (dùng ILIKE để tìm kiếm gần đúng)
                    if key == "file_name":
                        filter_sql += f" AND file_name ILIKE ${current_idx}"
                        params.append(f"%{value}%")
                    
                    # Tìm kiếm theo nội dung thô (nếu cần)
                    elif key == "file_size":
                        filter_sql += f" AND file_size ILIKE ${current_idx}"
                        params.append(f"%{value}%")
                    
                    # Lọc chính xác theo định dạng tệp, trạng thái hoặc user_id
                    elif key in ["file_ext", "processing_status", "user_id"]:
                        filter_sql += f" AND {key} = ${current_idx}"
                        params.append(value)

            # 3️⃣ Thêm phân trang (Limit & Offset)
            limit_idx = len(params) + 1
            offset_idx = len(params) + 2
            params.extend([limit, offset])

            # 4️⃣ Query dữ liệu
            # Lưu ý: Sắp xếp theo ID hoặc created_at giảm dần để thấy file mới nhất
            sql_query = f"""
                SELECT 
                    id, user_id, file_name, file_path, file_ext, 
                    file_size, processing_status, created_at
                FROM documents
                {filter_sql}
                ORDER BY created_at DESC
                LIMIT ${limit_idx} OFFSET ${offset_idx}
            """

            rows = await conn.fetch(sql_query, *params)

            # 5️⃣ Parse kết quả về Pydantic Model (DocumentResponse)
            results = []
            for row in rows:
                row_dict = dict(row)
                # Đảm bảo dữ liệu trả về khớp với DocumentResponse
                results.append(DocumentResponse(**row_dict))

            return results

    except Exception as e:
        traceback.print_exc()
        print(f"❌ Lỗi khi lấy danh sách tài liệu: {str(e)}")
        return []

async def get_document_by_id(doc_id: int):
    try:
        async with database.data_pool.acquire() as conn:
            sql = "SELECT * FROM documents WHERE id = $1"
            row = await conn.fetchrow(sql, doc_id)
            return dict(row) if row else None
    except Exception as e:
        traceback.print_exc()
        return None