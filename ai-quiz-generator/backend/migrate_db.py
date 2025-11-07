"""
Database migration script to add raw_html column and unique constraint on url.
Run this script once to update your existing database schema.
"""
import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH, override=False)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    sys.exit(1)

from sqlalchemy import create_engine

engine = create_engine(DATABASE_URL)

def migrate():
    """Add raw_html column and unique constraint if they don't exist."""
    with engine.connect() as conn:
        # Check if raw_html column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='quizzes' AND column_name='raw_html'
        """))
        
        if result.fetchone() is None:
            print("Adding raw_html column...")
            conn.execute(text("ALTER TABLE quizzes ADD COLUMN raw_html TEXT"))
            conn.commit()
            print("✓ raw_html column added successfully")
        else:
            print("✓ raw_html column already exists")
        
        # Check if unique constraint exists
        result = conn.execute(text("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='quizzes' 
            AND constraint_type='UNIQUE' 
            AND constraint_name LIKE '%url%'
        """))
        
        if result.fetchone() is None:
            print("Adding unique constraint on url column...")
            try:
                conn.execute(text("ALTER TABLE quizzes ADD CONSTRAINT unique_url UNIQUE (url)"))
                conn.commit()
                print("✓ Unique constraint on url added successfully")
            except Exception as e:
                if "already exists" in str(e) or "duplicate" in str(e).lower():
                    print("⚠ Unique constraint may already exist (check manually)")
                else:
                    print(f"⚠ Could not add unique constraint: {e}")
                    print("  You may need to remove duplicate URLs first")
        else:
            print("✓ Unique constraint on url already exists")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    print("Starting database migration...")
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)



