"""
Supabase database connection module
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to Supabase URL format
    SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
    if SUPABASE_DB_URL:
        DATABASE_URL = SUPABASE_DB_URL
    else:
        raise ValueError("No database URL found. Please set DATABASE_URL or SUPABASE_DB_URL in .env file")

# Create engine for PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,        # Number of connections to maintain in pool
    max_overflow=20,     # Maximum overflow connections
    echo=False           # Set to True for SQL query logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database (create tables if they don't exist)"""
    try:
        # Import all models to ensure they're registered
        from models import (
            Topic, TopicVersion, Keyword, Mnemonic,
            ExamHistory, Assignment, Submission,
            Category, Template, WeeklyExam, ExamQuestion
        )

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database connection successful!")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False