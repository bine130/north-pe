from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from Docker!"}

@app.get("/health")
def health():
    return {"status": "healthy"}