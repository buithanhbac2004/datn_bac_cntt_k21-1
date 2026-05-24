import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import init_db, close_db
from routers import auth_router, document_router, question_router, dashboard_router
from models.activity_model import init_activity_table
from models.question_model import init_question_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await init_db()
    await init_activity_table()
    await init_question_tables()
    # await get_list_products_handler()
    yield
    # shutdown (nếu cần)
    await close_db()



app = FastAPI(
    lifespan=lifespan,
    # docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # khi production nên set domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# ===== API ROUTERS =====
app.include_router(auth_router.router, prefix="/api")
app.include_router(document_router.router, prefix="/api")
app.include_router(question_router.router, prefix="/api")
app.include_router(dashboard_router.router, prefix="/api")
# app.include_router(invoices_router.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)


