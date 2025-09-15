"""
Database configuration module that automatically selects between Supabase and SQLite
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if Supabase is configured
if os.getenv("DATABASE_URL"):
    from database_supabase import get_db, engine, SessionLocal, Base, init_db, test_connection
    print("Database: Using Supabase PostgreSQL")
else:
    from database import get_db, engine, SessionLocal, Base, init_db
    print("Database: Using local SQLite")

    def test_connection():
        """Dummy test connection for SQLite"""
        return True

__all__ = ['get_db', 'engine', 'SessionLocal', 'Base', 'init_db', 'test_connection']