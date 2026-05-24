
import asyncio
from datetime import datetime
from decimal import Decimal
import json
import database
import traceback
from schemas.auth_schema import LoginRequest




async def get_data_user(data_login: LoginRequest) -> dict | None:
    try:
        async with database.data_pool.acquire() as conn:
            # Câu lệnh SQL JOIN để lấy toàn bộ thông tin
            sql = """
            SELECT * FROM users
            WHERE username = $1 AND password = $2
            """
            
            user_record = await conn.fetchrow(
                sql,
                data_login.username,
                data_login.password
            )

            user_data = dict(user_record)
            # 1️⃣ Xử lý ép kiểu cho các trường đặc biệt (Date, Decimal)
            for key, value in user_data.items():
                # Xử lý Decimal (Lỗi bạn vừa gặp)
                if isinstance(value, Decimal):
                    user_data[key] = float(value)
                
                # Xử lý Ngày tháng (Đã có sẵn nhưng viết gọn lại)
                elif hasattr(value, 'isoformat'): 
                    user_data[key] = value.isoformat()
            print(user_data)
            return user_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Lỗi khi lấy dữ liệu user: {str(e)}")
        return None
    

async def get_user(id_acc: int) -> dict | None:
    try:
        async with database.data_pool.acquire() as conn:
            # Câu lệnh SQL JOIN để lấy toàn bộ thông tin
            sql = """
            SELECT * FROM users
            WHERE id = $1
            """
            
            user_record = await conn.fetchrow(
                sql,
                id_acc
            )

            user_data = dict(user_record)
            # 1️⃣ Xử lý ép kiểu cho các trường đặc biệt (Date, Decimal)
            for key, value in user_data.items():
                # Xử lý Decimal (Lỗi bạn vừa gặp)
                if isinstance(value, Decimal):
                    user_data[key] = float(value)
                
                # Xử lý Ngày tháng (Đã có sẵn nhưng viết gọn lại)
                elif hasattr(value, 'isoformat'): 
                    user_data[key] = value.isoformat()
            # print(user_data)
            return user_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Lỗi khi lấy dữ liệu user: {str(e)}")
        return None