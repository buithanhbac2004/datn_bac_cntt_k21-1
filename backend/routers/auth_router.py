import asyncio
import json
import time
from fastapi import APIRouter, HTTPException, Depends, Query
from handlers.auth_handler import login_handler
from utils.security import check_token
import httpx 
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
router = APIRouter()


@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        
        print(f"🔐 Đang xử lý login cho user: {form_data}")
        return await login_handler(form_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

@router.get("/me")
async def get_me(token: str = Depends(check_token)):
    try:
        # print(token)
        return token
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")
    