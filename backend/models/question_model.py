import json
import database
import traceback
from schemas.question_schema import AIQuizResonse, GenerateQuizRequest, Option, Question, QuizExportData

async def init_question_tables():
    try:
        async with database.data_pool.acquire() as conn:
            # Kiểm tra và thêm các cột thống kê nếu chưa có
            await conn.execute("""
                ALTER TABLE question_sets 
                ADD COLUMN IF NOT EXISTS generation_time DOUBLE PRECISION DEFAULT 0,
                ADD COLUMN IF NOT EXISTS accuracy_score DOUBLE PRECISION DEFAULT 100
            """)
            print("✅ Đã kiểm tra/cập nhật bảng question_sets (stats columns)")
    except Exception as e:
        print(f"❌ Lỗi cập nhật bảng question_sets: {str(e)}")


async def get_question_sets(
    user_id: int, 
    search_term: str = None, 
    document_id: int = None,
    limit: int = 20, 
    offset: int = 0
):
    try:
        async with database.data_pool.acquire() as conn:
            # 1️⃣ Khởi tạo tham số và bộ lọc gốc
            # Sử dụng alias 'qs' cho question_sets để câu lệnh gọn hơn
            params = [user_id]
            filter_sql = "WHERE qs.user_id = $1"

            # 2️⃣ Thêm bộ lọc tìm kiếm theo tiêu đề bộ đề
            if search_term:
                params.append(f"%{search_term}%")
                filter_sql += f" AND qs.title ILIKE ${len(params)}"

            # 3️⃣ Thêm bộ lọc theo tài liệu cụ thể
            if document_id:
                params.append(document_id)
                filter_sql += f" AND qs.document_id = ${len(params)}"

            # 4️⃣ Thiết lập phân trang
            params.append(limit)
            limit_idx = len(params)
            params.append(offset)
            offset_idx = len(params)

            # 5️⃣ Xây dựng Query với LEFT JOIN
            # Lấy thêm trường file_name từ bảng documents
            sql = f"""
                SELECT 
                    qs.id, 
                    qs.document_id, 
                    d.file_name as document_name, -- Lấy tên file từ bảng documents
                    qs.user_id, 
                    qs.title, 
                    qs.description, 
                    qs.total_questions, 
                    qs.ai_config, 
                    qs.created_at 
                FROM question_sets qs
                LEFT JOIN documents d ON qs.document_id = d.id
                {filter_sql}
                ORDER BY qs.created_at DESC
                LIMIT ${limit_idx} OFFSET ${offset_idx}
            """

            # 6️⃣ Thực thi truy vấn
            rows = await conn.fetch(sql, *params)
            results = [dict(row) for row in rows]

            return {
                "success": True,
                "data": results,
                "metadata": {
                    "limit": limit,
                    "offset": offset,
                    "total_on_page": len(results)
                }
            }

    except Exception as e:
        traceback.print_exc()
        return {
            "success": False, 
            "message": f"Lỗi lấy danh sách đề thi: {str(e)}",
            "data": []
        }

async def get_quiz_detail_for_export(set_id: int, user_id: int) -> QuizExportData | None:
    try:
        async with database.data_pool.acquire() as conn:
            # 1. Lấy thông tin bộ đề
            set_row = await conn.fetchrow(
                "SELECT title, description, total_questions FROM question_sets WHERE id = $1 AND user_id = $2",
                set_id, user_id
            )
            if not set_row: return None

            # 2. Lấy danh sách câu hỏi
            q_rows = await conn.fetch(
                "SELECT id, question_text, question_type, cognitive_level, difficulty, explanation FROM questions WHERE set_id = $1 ORDER BY order_index",
                set_id
            )

            questions = []
            for q in q_rows:
                # 3. Lấy options cho từng câu hỏi
                opt_rows = await conn.fetch(
                    "SELECT option_text, is_correct, distractor_logic FROM options WHERE question_id = $1",
                    q['id']
                )
                options = [Option(**dict(opt)) for opt in opt_rows]
                questions.append(Question(
                    question_text=q['question_text'],
                    question_type=q['question_type'],
                    cognitive_level=q.get('cognitive_level'),
                    difficulty=q.get('difficulty'),
                    explanation=q.get('explanation'),
                    options=options
                ))

            return QuizExportData(
                title=set_row['title'],
                description=set_row['description'],
                total_questions=set_row['total_questions'],
                questions=questions
            )
    except Exception as e:
        traceback.print_exc()
        return None

async def save_quiz_to_db(user_id: int, ai_data: AIQuizResonse, config: GenerateQuizRequest, generation_time: float = 0, accuracy_score: float = 100):
    try:
        async with database.data_pool.acquire() as conn:
            async with conn.transaction():
                
                # 1. Chuyển đổi config AI thành chuỗi JSON (hoặc dict tương thích với JSONB)
                # Dùng json.dumps để tương thích chuẩn với kiểu dữ liệu TEXT/JSONB của asyncpg
                ai_config_data = json.dumps(config.model_dump(), ensure_ascii=False)
                
                # 2. Lưu vào bảng question_sets
                set_sql = """
                    INSERT INTO question_sets (document_id, user_id, title, description, total_questions, ai_config, generation_time, accuracy_score, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    RETURNING id
                """
                set_id = await conn.fetchval(
                    set_sql, 
                    config.document_id, 
                    user_id, 
                    ai_data.title, 
                    ai_data.description, 
                    len(ai_data.questions), 
                    ai_config_data,
                    generation_time,
                    accuracy_score
                )

                # 3. Duyệt qua từng câu hỏi để lưu vào bảng questions
                for q_idx, q_data in enumerate(ai_data.questions):
                    q_sql = """
                        INSERT INTO questions (set_id, question_text, question_type, difficulty, cognitive_level, explanation, order_index)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id
                    """
                    question_id = await conn.fetchval(
                        q_sql, 
                        set_id, 
                        q_data.question_text, 
                        q_data.question_type, 
                        q_data.difficulty, 
                        q_data.cognitive_level,
                        q_data.explanation, 
                        q_idx + 1 # Gán số thứ tự tự động
                    )

                    # 4. Duyệt qua từng đáp án của câu hỏi đó để lưu vào bảng options
                    for opt_data in q_data.options:
                        opt_sql = """
                            INSERT INTO options (question_id, option_text, is_correct, distractor_logic)
                            VALUES ($1, $2, $3, $4)
                        """
                        await conn.execute(
                            opt_sql, 
                            question_id, 
                            opt_data.option_text, 
                            opt_data.is_correct, 
                            opt_data.distractor_logic
                        )

                # Nếu chạy đến đây không có lỗi, Transaction tự động Commit
                return {"success": True, "set_id": set_id}
                
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "message": f"Lỗi lưu Database: {str(e)}"}