"""
Simple script to view raw HTML stored in the database.
Usage:
    python view_raw_html.py <quiz_id>
    python view_raw_html.py <url>
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH, override=False)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def view_raw_html(quiz_id=None, url=None):
    with engine.connect() as conn:
        if quiz_id:
            result = conn.execute(
                text("SELECT id, url, title, raw_html FROM quizzes WHERE id = :id"),
                {"id": quiz_id}
            )
        elif url:
            result = conn.execute(
                text("SELECT id, url, title, raw_html FROM quizzes WHERE url = :url"),
                {"url": url}
            )
        else:
            print("Please provide either quiz_id or url")
            return
        
        row = result.fetchone()
        if not row:
            print("Quiz not found")
            return
        
        quiz_id_val, url_val, title_val, raw_html_val = row
        
        print("="*60)
        print(f"Quiz ID: {quiz_id_val}")
        print(f"URL: {url_val}")
        print(f"Title: {title_val}")
        print(f"HTML Length: {len(raw_html_val) if raw_html_val else 0:,} characters")
        print("="*60)
        
        if not raw_html_val:
            print("\n⚠️  No raw HTML stored for this quiz.")
            print("   (This might be an older quiz created before the migration)")
            return
        
        print("\n📄 Raw HTML Preview (first 500 characters):")
        print("-"*60)
        print(raw_html_val[:500] if raw_html_val else "No HTML")
        print("-"*60)
        
        # Option to save to file
        save = input("\n💾 Save full HTML to file? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"raw_html_quiz_{quiz_id_val}.html"
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(raw_html_val)
                print(f"✅ Saved to: {filename}")
                print(f"   File size: {len(raw_html_val):,} bytes")
            except Exception as e:
                print(f"❌ Error saving file: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python view_raw_html.py <quiz_id>")
        print("  python view_raw_html.py <url>")
        print("\nExample:")
        print("  python view_raw_html.py 1")
        print('  python view_raw_html.py "https://en.wikipedia.org/wiki/Python"')
        sys.exit(1)
    
    arg = sys.argv[1]
    if arg.startswith('http'):
        view_raw_html(url=arg)
    else:
        try:
            view_raw_html(quiz_id=int(arg))
        except ValueError:
            print(f"Invalid argument: {arg}")
            print("Please provide either a quiz ID (number) or a URL (starting with http)")


