"""
Test Supabase connection
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not found in .env file")
        return False

    # Check if password is set
    if "[YOUR-PASSWORD]" in db_url:
        print("[ERROR] Please replace [YOUR-PASSWORD] with your actual Supabase password in .env file")
        return False

    print(f"[OK] DATABASE_URL found")
    print(f"     Project ID: bxfqjnokvzdvomuzsupz")

    # Try to connect
    try:
        from database_config import test_connection as db_test
        if db_test():
            print("[SUCCESS] Successfully connected to Supabase!")
            return True
        else:
            print("[ERROR] Failed to connect to Supabase")
            return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Supabase Connection")
    print("=" * 50)

    if test_connection():
        print("\n[READY] Supabase is ready to use!")
        print("\nNext steps:")
        print("1. Install packages: pip install -r requirements.txt")
        print("2. Run the backend: python main.py or uvicorn main:app --reload")
    else:
        print("\n[WARNING] Please check your .env configuration")
        print("\n1. Get your database password from Supabase dashboard")
        print("2. Replace [YOUR-PASSWORD] in .env file")
        print("3. Get your anon key from Supabase dashboard > Settings > API")
        print("4. Replace 'your-anon-key-here' in .env file")