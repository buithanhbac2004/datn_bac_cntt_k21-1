import json
import os
import re
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from jose import ExpiredSignatureError, jwt, JWTError
from fastapi import HTTPException, Security, Depends
from fastapi.security import OAuth2PasswordBearer
from models.auth_model import get_data_user, get_user
from schemas.auth_schema import LoginResponse
# Load biến môi trường
load_dotenv()


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
SECRET_KEY = os.getenv("SECRET_KEY")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Tạo JWT token
async def create_access_token(data):
    print("🔐 Tạo access token cho user:", data.username)
    data_user = await get_data_user(data)
    print(f"🔍 Dữ liệu user lấy được: {data_user}")
    if "error" in data_user:
        return data_user
    
    to_encode = data_user.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # print(SECRET_KEY)
    print(f"✅ Token sẽ hết hạn vào: {expire.isoformat()}")
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    data_user.pop("password", None)
    data_response = LoginResponse(
        access_token=token,
        data_user=data_user
    )
    return data_response

# Middleware kiểm tra token
async def check_token(token: str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(json.dumps(payload, indent=4, ensure_ascii=False))
        exp = payload.get("exp")
        current_ts = datetime.now(timezone.utc).timestamp()  # ✅ Cùng UTC

        # print(f"Token exp: {exp}, Current time: {current_ts}")

        # So sánh hết hạn
        if exp is None or current_ts > exp:
            raise HTTPException(status_code=401, detail="Token đã hết hạn")
        id_acc = payload.get("id")
        password: str = payload.get("password")
        # status = payload.get("status")

        user = await get_user(id_acc)
        # print('payload:', payload)
        # print('user: ', user)
        if not user or user['password'] != password:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        if password is None:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        payload.pop("password", None)
        return payload

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")


    

# async def decode_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         return None

