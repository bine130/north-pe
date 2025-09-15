from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="North PE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "North PE API is running"}

@app.get("/test")
async def test():
    return {"message": "test working"}

@app.get("/weekly-exams-direct")
async def get_weekly_exams_direct():
    # 1교시 문제들 (13문제 - 단답형)
    session1_questions = [
        {"id": 1, "session": 1, "question_number": 1, "question_text": "SCTP", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 2, "session": 1, "question_number": 2, "question_text": "UDP와 TCP를 비교하시오", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 3, "session": 1, "question_number": 3, "question_text": "HTTP/2", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 4, "session": 1, "question_number": 4, "question_text": "SSL/TLS 핸드셰이크 과정", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 5, "session": 1, "question_number": 5, "question_text": "NAT", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 6, "session": 1, "question_number": 6, "question_text": "DNS", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 7, "session": 1, "question_number": 7, "question_text": "DHCP", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 8, "session": 1, "question_number": 8, "question_text": "VLAN", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 9, "session": 1, "question_number": 9, "question_text": "라우팅 프로토콜", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 10, "session": 1, "question_number": 10, "question_text": "스위치와 허브의 차이점", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 11, "session": 1, "question_number": 11, "question_text": "ARP", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 12, "session": 1, "question_number": 12, "question_text": "ICMP", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 13, "session": 1, "question_number": 13, "question_text": "서브넷 마스크", "question_type": "short_answer", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"}
    ]
    
    # 2교시 문제들 (6문제 - 서술형)
    session2_questions = [
        {"id": 14, "session": 2, "question_number": 1, "question_text": "OSI 7계층에 대해 설명하시오.\n가. 각 계층의 역할\n나. 계층별 주요 프로토콜\n다. 캡슐화와 역캡슐화", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 15, "session": 2, "question_number": 2, "question_text": "TCP/IP 프로토콜에 대해 설명하시오.\n가. TCP의 특징과 동작원리\n나. IP 주소 체계\n다. TCP와 UDP의 비교", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 16, "session": 2, "question_number": 3, "question_text": "네트워크 보안에 대해 설명하시오.\n가. 방화벽의 종류와 특징\n나. VPN의 개념과 구현방식\n다. 암호화 기술", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 17, "session": 2, "question_number": 4, "question_text": "무선 네트워크에 대해 설명하시오.\n가. WiFi 표준과 특징\n나. 무선 보안 프로토콜\n다. 모바일 통신 기술", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 18, "session": 2, "question_number": 5, "question_text": "클라우드 네트워킹에 대해 설명하시오.\n가. 가상화 기술\n나. SDN(Software Defined Network)\n다. 클라우드 서비스 모델", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"},
        {"id": 19, "session": 2, "question_number": 6, "question_text": "네트워크 성능 최적화에 대해 설명하시오.\n가. 대역폭 관리\n나. QoS(Quality of Service)\n다. 로드 밸런싱", "question_type": "essay", "weekly_exam_id": 1, "created_at": "2024-09-01T00:00:00"}
    ]
    
    return [{
        "id": 1,
        "week_number": 1,
        "category_id": 1,
        "category": {"id": 1, "name": "네트워크", "description": "네트워킹 관련"},
        "questions": session1_questions + session2_questions,
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

@app.get("/api/categories")
async def get_categories():
    return [
        {"id": 1, "name": "네트워크", "description": "네트워킹 관련", "created_at": "2024-09-01T00:00:00"},
        {"id": 2, "name": "데이터베이스", "description": "DB 관련", "created_at": "2024-09-01T00:00:00"}
    ]