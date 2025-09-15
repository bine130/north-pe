from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).order_by(models.Category.name).all()
    return categories

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(
        name=category.name,
        parent_id=category.parent_id,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category_update.name:
        category.name = category_update.name
    if category_update.description is not None:
        category.description = category_update.description
    if category_update.parent_id is not None:
        category.parent_id = category_update.parent_id
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 자식 카테고리가 있는지 확인
    children = db.query(models.Category).filter(models.Category.parent_id == category_id).first()
    if children:
        raise HTTPException(status_code=400, detail="Cannot delete category with children")
    
    # 이 카테고리를 사용하는 토픽이 있는지 확인
    topics_using_category = db.query(models.Topic).filter(models.Topic.category == category.name).first()
    if topics_using_category:
        raise HTTPException(status_code=400, detail="Cannot delete category in use by topics")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

@router.get("/tree")
def get_category_tree(db: Session = Depends(get_db)):
    """카테고리를 트리 구조로 반환"""
    categories = db.query(models.Category).all()
    
    def build_tree(parent_id=None):
        tree = []
        for cat in categories:
            if cat.parent_id == parent_id:
                children = build_tree(cat.id)
                tree.append({
                    "id": cat.id,
                    "name": cat.name,
                    "description": cat.description,
                    "parent_id": cat.parent_id,
                    "children": children
                })
        return tree
    
    return build_tree()