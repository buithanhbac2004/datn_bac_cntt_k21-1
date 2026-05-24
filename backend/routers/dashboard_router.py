from fastapi import APIRouter, Depends, HTTPException
from utils.security import check_token
from models.dashboard_model import get_dashboard_stats
from models.activity_model import get_recent_activities

router = APIRouter()

@router.get(
    "/dashboard/stats",
    summary="Lấy dữ liệu thống kê tổng quan",
    tags=["Dashboard"]
)
async def api_get_dashboard_stats(token: dict = Depends(check_token)):
    user_id = token.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Không có quyền truy cập")
        
    stats = await get_dashboard_stats(user_id)
    activities = await get_recent_activities(user_id, limit=5)
    
    return {
        "success": True,
        "data": {
            "stats": stats,
            "recent_activities": activities
        }
    }
