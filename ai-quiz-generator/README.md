# AI Wiki Quiz Generator

Backend: FastAPI (Python). Frontend: React. Database: PostgreSQL.

## Prerequisites
- Python 3.10+
- PostgreSQL running locally (or connection string for a server)
- Node.js 18+ (for frontend only)

## Backend Setup
```
cd ai-quiz-generator/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create environment variables (PowerShell example):
```
$env:GEMINI_API_KEY="YOUR_API_KEY"
$env:DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/ai_quiz"
$env:ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

Initialize DB and run server:
```
uvicorn main:app --reload
```

## Frontend Setup
```
cd ../frontend
npm install
npm run dev
```
Set `VITE_API_URL` if your API is not `http://localhost:8000`.

## API Endpoints
- POST `/generate_quiz` { url }
- GET `/history`
- GET `/quiz/{id}`

## Notes
- Scraping uses BeautifulSoup and avoids Wikipedia API per requirements.
- LLM: Gemini via LangChain with a strict Pydantic schema to enforce JSON.
- Full quiz JSON is stored in `quizzes.full_quiz_data`.

## Sample Data
Place outputs and tested URLs in `sample_data/`.






