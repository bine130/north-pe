import os
from fastapi import FastAPI

app = FastAPI(title="North PE API", version="1.0.0")

# CORS origins from environment variable
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:4000").split(",")

@app.get("/")
def root():
    return {"message": "North PE API is running", "cors_origins": CORS_ORIGINS}

@app.get("/health")
def health():
    return {"status": "healthy"}