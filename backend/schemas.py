from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class KeywordBase(BaseModel):
    keyword: str

class KeywordCreate(KeywordBase):
    pass

class Keyword(KeywordBase):
    id: int
    topic_id: int
    
    class Config:
        from_attributes = True

class MnemonicBase(BaseModel):
    mnemonic: str
    full_text: str

class MnemonicCreate(MnemonicBase):
    pass

class Mnemonic(MnemonicBase):
    id: int
    topic_id: int
    
    class Config:
        from_attributes = True

class ExamHistoryBase(BaseModel):
    exam_round: str
    question_number: str
    score: Optional[float] = None

class ExamHistoryCreate(ExamHistoryBase):
    pass

class ExamHistory(ExamHistoryBase):
    id: int
    topic_id: int
    
    class Config:
        from_attributes = True

class TopicBase(BaseModel):
    title: str
    category: Optional[str] = None
    content: Optional[str] = None

class TopicCreate(TopicBase):
    keywords: List[str] = []
    mnemonics: List[MnemonicCreate] = []

class TopicUpdate(TopicBase):
    title: Optional[str] = None
    keywords: List[str] = []
    mnemonics: List[MnemonicCreate] = []
    change_reason: Optional[str] = None

class Topic(TopicBase):
    id: int
    created_at: datetime
    updated_at: datetime
    keywords: List[Keyword] = []
    mnemonics: List[Mnemonic] = []
    exam_histories: List[ExamHistory] = []
    
    class Config:
        from_attributes = True

class TopicVersionBase(BaseModel):
    content: str
    version: int
    changed_by: str
    change_reason: str

class TopicVersion(TopicVersionBase):
    id: int
    topic_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TopicSearch(BaseModel):
    query: str
    search_type: Optional[str] = "all"  # all, title, keyword, mnemonic

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    category: Optional[str] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class Template(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Weekly Exam Schemas
class ExamQuestionBase(BaseModel):
    session: int
    question_number: int
    question_text: str
    question_type: str

class ExamQuestionCreate(ExamQuestionBase):
    pass

class ExamQuestion(ExamQuestionBase):
    id: int
    weekly_exam_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class WeeklyExamBase(BaseModel):
    week_number: int
    category_id: int

class WeeklyExamCreate(WeeklyExamBase):
    questions: List[ExamQuestionCreate] = []

class WeeklyExamResponse(WeeklyExamBase):
    id: int
    created_at: datetime
    category: Optional[Category] = None
    questions: List[ExamQuestion] = []
    
    class Config:
        from_attributes = True