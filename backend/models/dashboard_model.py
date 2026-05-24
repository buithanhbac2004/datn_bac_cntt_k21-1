import database
import traceback

async def get_dashboard_stats(user_id: int):
    try:
        async with database.data_pool.acquire() as conn:
            # 1. Tổng số tài liệu
            doc_count = await conn.fetchval(
                "SELECT COUNT(id) FROM documents WHERE user_id = $1", 
                user_id
            )
            
            # 2. Tổng số bộ đề
            set_count = await conn.fetchval(
                "SELECT COUNT(id) FROM question_sets WHERE user_id = $1", 
                user_id
            )
            
            # 3. Tổng số câu hỏi
            question_count = await conn.fetchval(
                """
                SELECT COUNT(q.id) 
                FROM questions q
                JOIN question_sets qs ON q.set_id = qs.id
                WHERE qs.user_id = $1
                """, 
                user_id
            )
            
            # 4. Tính toán tốc độ AI thực tế (giây/câu)
            # Lấy trung bình của (thời gian xử lý / tổng số câu) từ các bộ đề đã tạo
            # 4. Tính toán tốc độ và độ chính xác AI thực tế
            ai_stats = await conn.fetchrow(
                """
                SELECT 
                    AVG(generation_time / NULLIF(total_questions, 0)) as avg_speed,
                    AVG(accuracy_score) as avg_accuracy
                FROM question_sets 
                WHERE user_id = $1 AND generation_time > 0
                """,
                user_id
            )
            
            avg_speed = ai_stats['avg_speed'] if ai_stats and ai_stats['avg_speed'] else 0
            avg_accuracy = ai_stats['avg_accuracy'] if ai_stats and ai_stats['avg_accuracy'] else 100
            
            return {
                "total_documents": doc_count or 0,
                "total_question_sets": set_count or 0,
                "total_questions": question_count or 0,
                "ai_speed_seconds": round(avg_speed, 2), 
                "ai_accuracy": round(avg_accuracy, 1)
            }
            
    except Exception as e:
        print(f"❌ Lỗi lấy thống kê dashboard: {str(e)}")
        traceback.print_exc()
        return {
            "total_documents": 0,
            "total_question_sets": 0,
            "total_questions": 0,
            "ai_speed_seconds": 0,
            "ai_accuracy": 0
        }
