from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import models
import schemas
from database_config import get_db

router = APIRouter(prefix="/api/topics", tags=["topics"])

@router.post("/", response_model=schemas.Topic)
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = models.Topic(
        title=topic.title,
        category=topic.category,
        content=topic.content
    )
    db.add(db_topic)
    db.flush()
    
    # Add keywords
    for keyword in topic.keywords:
        db_keyword = models.Keyword(topic_id=db_topic.id, keyword=keyword)
        db.add(db_keyword)
    
    # Add mnemonics
    for mnemonic in topic.mnemonics:
        db_mnemonic = models.Mnemonic(
            topic_id=db_topic.id,
            mnemonic=mnemonic.mnemonic,
            full_text=mnemonic.full_text
        )
        db.add(db_mnemonic)
    
    # Create initial version
    db_version = models.TopicVersion(
        topic_id=db_topic.id,
        content=topic.content,
        version=1,
        changed_by="system",
        change_reason="Initial creation"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(db_topic)
    return db_topic

@router.get("/", response_model=List[schemas.Topic])
def get_topics(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Topic)
    if category:
        query = query.filter(models.Topic.category == category)
    topics = query.offset(skip).limit(limit).all()
    return topics

@router.get("/search", response_model=List[schemas.Topic])
def search_topics(
    q: str = Query(..., description="Search query"),
    search_type: str = Query("all", description="Search type: all, title, keyword, mnemonic"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Topic)
    
    if search_type == "title":
        query = query.filter(models.Topic.title.contains(q))
    elif search_type == "keyword":
        query = query.join(models.Keyword).filter(models.Keyword.keyword.contains(q))
    elif search_type == "mnemonic":
        query = query.join(models.Mnemonic).filter(models.Mnemonic.mnemonic.contains(q))
    else:  # all
        query = query.outerjoin(models.Keyword).outerjoin(models.Mnemonic).filter(
            or_(
                models.Topic.title.contains(q),
                models.Keyword.keyword.contains(q),
                models.Mnemonic.mnemonic.contains(q)
            )
        )
    
    topics = query.distinct().all()
    return topics

@router.get("/{topic_id}", response_model=schemas.Topic)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@router.put("/{topic_id}", response_model=schemas.Topic)
def update_topic(
    topic_id: int,
    topic_update: schemas.TopicUpdate,
    db: Session = Depends(get_db)
):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get current version number
    last_version = db.query(models.TopicVersion).filter(
        models.TopicVersion.topic_id == topic_id
    ).order_by(models.TopicVersion.version.desc()).first()
    
    new_version_num = (last_version.version + 1) if last_version else 1
    
    # Create new version before updating
    db_version = models.TopicVersion(
        topic_id=topic_id,
        content=topic.content,  # Save current content as version
        version=new_version_num,
        changed_by="admin",
        change_reason=topic_update.change_reason or "Content update"
    )
    db.add(db_version)
    
    # Update topic
    if topic_update.title:
        topic.title = topic_update.title
    if topic_update.category:
        topic.category = topic_update.category
    if topic_update.content:
        topic.content = topic_update.content
    
    # Update keywords
    if topic_update.keywords:
        # Delete existing keywords
        db.query(models.Keyword).filter(models.Keyword.topic_id == topic_id).delete()
        # Add new keywords
        for keyword in topic_update.keywords:
            db_keyword = models.Keyword(topic_id=topic_id, keyword=keyword)
            db.add(db_keyword)
    
    # Update mnemonics
    if topic_update.mnemonics:
        # Delete existing mnemonics
        db.query(models.Mnemonic).filter(models.Mnemonic.topic_id == topic_id).delete()
        # Add new mnemonics
        for mnemonic in topic_update.mnemonics:
            db_mnemonic = models.Mnemonic(
                topic_id=topic_id,
                mnemonic=mnemonic.mnemonic,
                full_text=mnemonic.full_text
            )
            db.add(db_mnemonic)
    
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted successfully"}

@router.get("/{topic_id}/versions", response_model=List[schemas.TopicVersion])
def get_topic_versions(topic_id: int, db: Session = Depends(get_db)):
    versions = db.query(models.TopicVersion).filter(
        models.TopicVersion.topic_id == topic_id
    ).order_by(models.TopicVersion.version.desc()).all()
    return versions