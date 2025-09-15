from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Template
from schemas import TemplateCreate, TemplateUpdate, Template as TemplateSchema

router = APIRouter(prefix="/api/templates", tags=["templates"])

@router.get("/", response_model=List[TemplateSchema])
def get_templates(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Template)
    if category:
        query = query.filter(Template.category == category)
    return query.order_by(Template.name).all()

@router.get("/{template_id}", response_model=TemplateSchema)
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.post("/", response_model=TemplateSchema)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/{template_id}", response_model=TemplateSchema)
def update_template(template_id: int, template: TemplateUpdate, db: Session = Depends(get_db)):
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_data = template.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(db_template)
    db.commit()
    return {"message": "Template deleted successfully"}