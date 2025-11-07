from __future__ import annotations

import json
import os
from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from sqlalchemy.exc import IntegrityError

from database import SessionLocal, init_db, Quiz, engine
from models import GenerateQuizRequest, QuizOutput, HistoryItem, UrlPreview
from scraper import scrape_wikipedia, preview_wikipedia_title
from llm_quiz_generator import generate_quiz_payload


def _get_allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(title="AI Wiki Quiz Generator", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.post("/preview_url", response_model=UrlPreview)
def preview_url(req: GenerateQuizRequest):
    """Preview endpoint to fetch article title before processing."""
    url_str = str(req.url)
    try:
        title = preview_wikipedia_title(url_str)
        return UrlPreview(title=title, valid=bool(title))
    except Exception:
        return UrlPreview(title="", valid=False)


@app.post("/generate_quiz", response_model=QuizOutput)
def generate_quiz(req: GenerateQuizRequest):
    url_str = str(req.url)
    
    # Check cache - if URL already exists, return cached quiz
    db = SessionLocal()
    try:
        # Use raw SQL to check for existing URL to avoid column issues
        result = db.execute(
            text("SELECT full_quiz_data FROM quizzes WHERE url = :url LIMIT 1"),
            {"url": url_str}
        )
        row = result.fetchone()
        if row:
            # Return cached quiz data with cached flag
            cached_data = json.loads(row[0])
            cached_data["cached"] = True
            return cached_data
    except Exception as e:
        # If column doesn't exist, continue with generation
        # This handles the case where migration hasn't been run yet
        pass
    finally:
        db.close()
    
    # If not cached, scrape and generate
    try:
        title, article_text, raw_html = scrape_wikipedia(url_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {e}")

    try:
        payload = generate_quiz_payload(url_str, title=title, article_text=article_text)
        payload["cached"] = False  # Mark as newly generated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

    # Store in database with raw HTML
    db = SessionLocal()
    try:
        # Check if raw_html column exists
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('quizzes')]
        has_raw_html = 'raw_html' in columns
        
        if has_raw_html:
            record = Quiz(
                url=url_str,
                title=payload.get("title") or title,
                date_generated=datetime.utcnow(),
                scraped_content=article_text,
                raw_html=raw_html,
                full_quiz_data=json.dumps(payload, ensure_ascii=False),
            )
        else:
            # Fallback: create record without raw_html if column doesn't exist
            record = Quiz(
                url=url_str,
                title=payload.get("title") or title,
                date_generated=datetime.utcnow(),
                scraped_content=article_text,
                full_quiz_data=json.dumps(payload, ensure_ascii=False),
            )
        
        db.add(record)
        db.commit()
        db.refresh(record)
    except IntegrityError as e:
        # If URL already exists (unique constraint violation), return existing
        db.rollback()
        result = db.execute(
            text("SELECT full_quiz_data FROM quizzes WHERE url = :url LIMIT 1"),
            {"url": url_str}
        )
        row = result.fetchone()
        if row:
            cached_data = json.loads(row[0])
            cached_data["cached"] = True
            return cached_data
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        db.close()

    return payload


@app.get("/history", response_model=List[HistoryItem])
def history():
    db = SessionLocal()
    try:
        rows = db.query(Quiz).order_by(Quiz.date_generated.desc()).all()
        return [
            HistoryItem(
                id=r.id,
                url=r.url,
                title=r.title,
                date_generated=r.date_generated.isoformat(),
            )
            for r in rows
        ]
    finally:
        db.close()


@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int):
    db = SessionLocal()
    try:
        row = db.get(Quiz, quiz_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quiz not found")
        data = json.loads(row.full_quiz_data)
        return data
    finally:
        db.close()


@app.get("/quiz/{quiz_id}/raw_html")
def get_raw_html(quiz_id: int):
    """Get the raw HTML stored for a quiz."""
    db = SessionLocal()
    try:
        row = db.get(Quiz, quiz_id)
        if not row:
            raise HTTPException(status_code=404, detail="Quiz not found")
        if not row.raw_html:
            raise HTTPException(status_code=404, detail="Raw HTML not available for this quiz")
        return {
            "quiz_id": quiz_id,
            "url": row.url,
            "title": row.title,
            "raw_html": row.raw_html,
            "html_length": len(row.raw_html)
        }
    finally:
        db.close()


@app.get("/quiz/url/{url:path}/raw_html")
def get_raw_html_by_url(url: str):
    """Get the raw HTML stored for a quiz by URL."""
    db = SessionLocal()
    try:
        row = db.query(Quiz).filter(Quiz.url == url).first()
        if not row:
            raise HTTPException(status_code=404, detail="Quiz not found for this URL")
        if not row.raw_html:
            raise HTTPException(status_code=404, detail="Raw HTML not available for this quiz")
        return {
            "quiz_id": row.id,
            "url": row.url,
            "title": row.title,
            "raw_html": row.raw_html,
            "html_length": len(row.raw_html)
        }
    finally:
        db.close()


