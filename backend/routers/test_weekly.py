from fastapi import APIRouter

router = APIRouter(prefix="/test-weekly", tags=["test-weekly"])

@router.get("/")
def test_endpoint():
    return {"message": "Test weekly endpoint is working"}

@router.get("/hello")  
def hello():
    return {"message": "Hello from test weekly"}