# Bonus Features Testing Guide

All bonus features have been implemented! Here's how to test each one:

## 🎯 Features Implemented

### 1. ✅ "Take Quiz" Mode with User Scoring
- **Location**: Click "Take Quiz" button on any generated quiz
- **How to Test**:
  1. Generate a quiz from any Wikipedia URL
  2. Click the "Take Quiz" button at the top of the quiz section
  3. Answer all questions by selecting radio buttons
  4. Click "Submit Quiz" to see your score
  5. Review results with correct/incorrect answers highlighted
  6. Click "Retake Quiz" to try again

### 2. ✅ URL Validation and Preview
- **Location**: URL input field in Generate Quiz tab
- **How to Test**:
  1. Go to "Generate Quiz" tab
  2. Paste a Wikipedia URL (e.g., `https://en.wikipedia.org/wiki/Prabhas`)
  3. Wait 500ms after typing - you'll see a preview box showing the article title
  4. The preview appears automatically as you type a valid URL
  5. Invalid URLs won't show a preview

### 3. ✅ Store Raw HTML in Database
- **Location**: Backend database
- **How to Test**:
  1. Generate a quiz from any URL
  2. Check your database - the `quizzes` table now has a `raw_html` column
  3. Query: `SELECT raw_html FROM quizzes WHERE url = 'your_url'`
  4. The raw HTML is stored for reference

### 4. ✅ Caching to Prevent Duplicate Scraping
- **Location**: Backend API endpoint
- **How to Test**:
  1. Generate a quiz from a URL (e.g., `https://en.wikipedia.org/wiki/Prabhas`)
  2. Note the time it takes (first time will scrape and generate)
  3. Generate the same quiz again with the same URL
  4. It should return instantly (cached from database)
  5. Check backend logs - second request won't scrape or call LLM

### 5. ✅ Section-wise Question Grouping in UI
- **Location**: Quiz display in view mode
- **How to Test**:
  1. Generate a quiz from any Wikipedia article
  2. Scroll to the Quiz section
  3. Questions are now grouped by sections (e.g., "Early Life", "Career", etc.)
  4. Each section has a header with the section name
  5. Questions are displayed under their respective sections

## 🚀 Quick Test Steps

1. **Start Backend**:
   ```bash
   cd ai-quiz-generator/backend
   python -m uvicorn main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd ai-quiz-generator/frontend
   npm run dev
   ```

3. **Database Migration Note**:
   - The database schema has been updated with:
     - `raw_html` column (Text, nullable)
     - Unique constraint on `url` column
   - If you have existing data, you may need to:
     - Drop and recreate the table, OR
     - Run a migration script to add the new column

4. **Test All Features**:
   - Open `http://localhost:5173`
   - Paste a Wikipedia URL
   - Watch for preview (appears after 500ms)
   - Generate quiz
   - See section grouping
   - Click "Take Quiz"
   - Answer questions and see scoring
   - Generate same URL again to test caching

## 📝 Notes

- **Caching**: URLs are cached based on exact URL match. Same article with different URL parameters will be treated as different.
- **Section Grouping**: Questions without a section are grouped under "General"
- **Take Quiz**: All questions must be answered before submission
- **Preview**: Only works for valid Wikipedia URLs

## 🐛 Troubleshooting

- **Database errors**: Make sure to run migrations or recreate the table
- **Preview not showing**: Check browser console for errors, ensure backend is running
- **Caching not working**: Check database connection and ensure URL is exactly the same







