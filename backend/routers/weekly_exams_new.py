from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database_config import get_db
from models import WeeklyExam, ExamQuestion, QuestionType, Category
from schemas import WeeklyExamCreate, WeeklyExamResponse, ExamQuestionCreate

router = APIRouter(prefix="/api/weekly-exams-new", tags=["weekly-exams-new"])

@router.get("/")
def test_get():
    return {"message": "Weekly exams API is working"}

@router.get("/list", response_model=List[WeeklyExamResponse])
def get_weekly_exams(db: Session = Depends(get_db)):
    exams = db.query(WeeklyExam).all()
    return exams

@router.post("/create", response_model=WeeklyExamResponse)
def create_weekly_exam(exam_data: WeeklyExamCreate, db: Session = Depends(get_db)):
    # 카테고리 존재 확인
    category = db.query(Category).filter(Category.id == exam_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 주간모의고사 생성
    db_exam = WeeklyExam(
        week_number=exam_data.week_number,
        category_id=exam_data.category_id
    )
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    # 문제들 생성
    for question_data in exam_data.questions:
        db_question = ExamQuestion(
            weekly_exam_id=db_exam.id,
            session=question_data.session,
            question_number=question_data.question_number,
            question_text=question_data.question_text,
            question_type=QuestionType(question_data.question_type)
        )
        db.add(db_question)
    
    db.commit()
    
    # 생성된 시험 정보 반환
    db.refresh(db_exam)
    return db_exam