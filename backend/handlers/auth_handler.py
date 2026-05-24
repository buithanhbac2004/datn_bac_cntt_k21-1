import traceback
from schemas.auth_schema import LoginRequest
from utils.security import  create_access_token



async def login_handler(request: LoginRequest):
    try:
        data = await create_access_token(request)
        if "error" in data:
            return data
        return data
    except Exception as e:
        traceback.print_exc()
        print(f"Lỗi hàm login - handler: {str(e)}")
        return None

