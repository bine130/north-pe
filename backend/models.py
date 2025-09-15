from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class AssignmentType(enum.Enum):
    OUTLINE = "outline"
    SELF_TEST = "self_test"

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    versions = relationship("TopicVersion", back_populates="topic")
    keywords = relationship("Keyword", back_populates="topic")
    mnemonics = relationship("Mnemonic", back_populates="topic")
    exam_histories = relationship("ExamHistory", back_populates="topic")

class TopicVersion(Base):
    __tablename__ = "topic_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    content = Column(Text)
    version = Column(Integer)
    changed_by = Column(String(100))
    change_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    topic = relationship("Topic", back_populates="versions")

class Keyword(Base):
    __tablename__ = "keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    keyword = Column(String(100))
    
    topic = relationship("Topic", back_populates="keywords")

class Mnemonic(Base):
    __tablename__ = "mnemonics"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    mnemonic = Column(String(100))
    full_text = Column(Text)
    
    topic = relationship("Topic", back_populates="mnemonics")

class ExamHistory(Base):
    __tablename__ = "exam_history"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    exam_round = Column(String(50))
    question_number = Column(String(50))
    score = Column(Float)
    
    topic = relationship("Topic", back_populates="exam_histories")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AssignmentType))
    title = Column(String(200))
    description = Column(Text)
    due_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    user_id = Column(String(100))
    file_path = Column(String(500))
    submitted_at = Column(DateTime, default=datetime.utcnow)
    score = Column(Float)
    feedback = Column(Text)
    
    assignment = relationship("Assignment", back_populates="submissions")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    parent = relationship("Category", remote_side=[id])
    children = relationship("Category")

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    category = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuestionType(enum.Enum):
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"

class WeeklyExam(Base):
    __tablename__ = "weekly_exams"
    
    id = Column(Integer, primary_key=True, index=True)
    week_number = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category")
    questions = relationship("ExamQuestion", back_populates="weekly_exam")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    weekly_exam_id = Column(Integer, ForeignKey("weekly_exams.id"))
    session = Column(Integer, nullable=False)  # 1 or 2 (1교시/2교시)
    question_number = Column(Integer, nullable=False)  # 1~13 (1교시), 1~6 (2교시)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    weekly_exam = relationship("WeeklyExam", back_populates="questions")