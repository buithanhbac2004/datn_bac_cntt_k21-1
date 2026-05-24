from datetime import datetime, date
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    password: str | None = None
    full_name: str
    created_at: datetime

class LoginResponse(BaseModel):
    access_token: str
    data_user: User