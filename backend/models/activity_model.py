import database
import traceback
from datetime import datetime

async def init_activity_table():
    try:
        async with database.data_pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS activities (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    action_type VARCHAR(50) NOT NULL,
                    description TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'SUCCESS',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✅ Đã kiểm tra/khởi tạo bảng activities")
    except Exception as e:
        print(f"❌ Lỗi khởi tạo bảng activities: {str(e)}")
        traceback.print_exc()

async def log_activity(user_id: int, action_type: str, description: str, status: str = 'SUCCESS'):
    """
    Ghi lại hoạt động của người dùng
    action_type: UPLOAD, GENERATE, EXPORT, SAVE, etc.
    """
    try:
        async with database.data_pool.acquire() as conn:
            sql = """
                INSERT INTO activities (user_id, action_type, description, status, created_at)
                VALUES ($1, $2, $3, $4, $5)
            """
            await conn.execute(sql, user_id, action_type, description, status, datetime.now())
    except Exception as e:
        print(f"Lỗi khi ghi log activity: {str(e)}")
        # Không throw error để không làm gián đoạn luồng chính
        
async def get_recent_activities(user_id: int, limit: int = 5):
    """
    Lấy danh sách các hoạt động gần đây
    """
    try:
        async with database.data_pool.acquire() as conn:
            sql = """
                SELECT id, action_type, description, status, created_at
                FROM activities
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            """
            rows = await conn.fetch(sql, user_id, limit)
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"Lỗi khi lấy activities: {str(e)}")
        return []
