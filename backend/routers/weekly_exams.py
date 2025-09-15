from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database_config import get_db
import models
import schemas

router = APIRouter(prefix="/weekly-exams", tags=["weekly-exams"])

@router.post("/", response_model=schemas.WeeklyExamResponse)
def create_weekly_exam(exam_data: schemas.WeeklyExamCreate, db: Session = Depends(get_db)):
    # 카테고리 존재 확인
    category = db.query(models.Category).filter(models.Category.id == exam_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 주간모의고사 생성
    db_exam = models.WeeklyExam(
        week_number=exam_data.week_number,
        category_id=exam_data.category_id
    )
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    # 문제들 생성
    for question_data in exam_data.questions:
        db_question = models.ExamQuestion(
            weekly_exam_id=db_exam.id,
            session=question_data.session,
            question_number=question_data.question_number,
            question_text=question_data.question_text,
            question_type=models.QuestionType(question_data.question_type)
        )
        db.add(db_question)
    
    db.commit()
    
    # 생성된 시험 정보 반환
    db.refresh(db_exam)
    return db_exam

@router.get("/", response_model=List[schemas.WeeklyExamResponse])
def get_weekly_exams(db: Session = Depends(get_db)):
    exams = db.query(models.WeeklyExam).all()
    return exams

@router.get("/{exam_id}", response_model=schemas.WeeklyExamResponse)
def get_weekly_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.WeeklyExam).filter(models.WeeklyExam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Weekly exam not found")
    return exam

@router.delete("/{exam_id}")
def delete_weekly_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.WeeklyExam).filter(models.WeeklyExam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Weekly exam not found")
    
    # 연관된 문제들도 삭제
    db.query(models.ExamQuestion).filter(models.ExamQuestion.weekly_exam_id == exam_id).delete()
    db.delete(exam)
    db.commit()
    
    return {"message": "Weekly exam deleted successfully"}