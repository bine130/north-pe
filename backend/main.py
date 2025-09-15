import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import topics, categories, templates, weekly_exams, weekly_exams_new, test_weekly
from database_config import init_db, test_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (cleanup if needed)

app = FastAPI(title="North PE API", version="1.0.0", lifespan=lifespan)

# CORS origins from environment variable
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:4000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(topics.router)
app.include_router(categories.router)
app.include_router(templates.router)
app.include_router(weekly_exams.router)
app.include_router(weekly_exams_new.router)
app.include_router(test_weekly.router)

@app.get("/")
async def root():
    return {"message": "North PE API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 직접 추가된 주간모의고사 엔드포인트
@app.get("/weekly-exams-direct")
async def get_weekly_exams_direct():
    return [{
        "id": 1,
        "week_number": 1,
        "category_id": 1,
        "category": {"id": 1, "name": "네트워크", "description": "네트워킹 관련"},
        "questions": [
            {
                "id": 1,
                "session": 1,
                "question_number": 1,
                "question_text": "SCTP",
                "question_type": "short_answer",
                "weekly_exam_id": 1,
                "created_at": "2024-09-01T00:00:00"
            }
        ],
        "created_at": "2024-09-01T00:00:00"
    }]

@app.post("/weekly-exams-direct")  
async def create_weekly_exam_direct():
    return {
        "id": 2,
        "week_number": 2,
        "category_id": 1,
        "category": {"id": 1, "name": "네트워크", "description": "네트워킹 관련"},
        "questions": [],
        "created_at": "2024-09-01T00:00:00"
    }

@app.get("/test")
async def test():
    return {"message": "test endpoint"}