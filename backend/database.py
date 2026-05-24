import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

data_pool = None

async def init_db():
    global data_pool
    data_pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=5,
        max_size=20,
        max_inactive_connection_lifetime=300
    )
    print("✅ Kết nối đang cơ sở dữ liệu thành công.")

async def close_db():
    global data_pool
    if data_pool:
        await data_pool.close()
        print("🔴 Đã đóng kết nối database.")