# Sample Data for AI Wiki Quiz Generator

This folder contains example Wikipedia URLs and their corresponding API responses.

## Structure

- `json/` - Contains JSON API response files
- `Screenshots/` - UI screenshots showing the application in action
- `README.md` - This documentation file

## Example URLs Tested

1. **Diwali** - `https://en.wikipedia.org/wiki/Diwali`
   - Cultural/Religious topic
   - Multiple sections and entities
   - 10 quiz questions

2. **Python (programming language)** - `https://en.wikipedia.org/wiki/Python_(programming_language)`
   - Technical topic
   - Programming concepts
   - 8 quiz questions

3. **हनुमान चालीसा** - `https://awa.wikipedia.org/wiki/हनुमान_चालीसा`
   - Non-English Wikipedia article
   - Devotional content
   - 6 quiz questions

## JSON File Format

Each JSON file contains:
- `url` - Original Wikipedia URL
- `title` - Article title
- `summary` - Article summary
- `key_entities` - Extracted people, organizations, locations
- `sections` - Article sections
- `quiz` - Array of quiz questions with options, answers, difficulty, explanations
- `related_topics` - Related Wikipedia topics
- `cached` - Whether the result was cached

## History Data

See `history.json` for example history entries showing quiz generation history.

## UI Screenshots

The following screenshots demonstrate the application's user interface and functionality in both light and dark modes:

### Light Mode Screenshots

#### 1. Main Application Interface
![Main Application Interface - Light Mode](Screenshots/Screenshot%202025-11-08%20103952.png)

#### 2. Quiz Generation Interface
![Quiz Generation Interface - Light Mode](Screenshots/Screenshot%202025-11-08%20104033.png)

#### 3. Quiz Display with Questions
![Quiz Display with Questions - Light Mode](Screenshots/Screenshot%202025-11-08%20104053.png)

#### 4. Interactive Quiz Taking Interface
![Interactive Quiz Taking Interface - Light Mode](Screenshots/Screenshot%202025-11-08%20104119.png)

#### 5. Quiz Results and Score Breakdown
![Quiz Results and Score Breakdown - Light Mode](Screenshots/Screenshot%202025-11-08%20104200.png)

#### 6. History Tab Showing Generated Quizzes
![History Tab - Light Mode](Screenshots/Screenshot%202025-11-08%20104233.png)

#### 7. Quiz Details View
![Quiz Details View - Light Mode](Screenshots/Screenshot%202025-11-08%20104254.png)

#### 8. Question Card with Options
![Question Card with Options - Light Mode](Screenshots/Screenshot%202025-11-08%20104319.png)

#### 9. Results Screen with Explanations
![Results Screen with Explanations - Light Mode](Screenshots/Screenshot%202025-11-08%20104341.png)

#### 10. Additional UI View
![Additional UI View - Light Mode](Screenshots/Screenshot%20(1439).png)

#### 11. Additional UI View
![Additional UI View - Light Mode](Screenshots/Screenshot%20(1440).png)

### Dark Mode Screenshots

#### 1. Main Application Interface - Dark Mode
![Main Application Interface - Dark Mode](Screenshots/Screenshot%202025-11-08%20104504.png)

#### 2. Quiz Generation Interface - Dark Mode
![Quiz Generation Interface - Dark Mode](Screenshots/Screenshot%202025-11-08%20104517.png)

#### 3. Quiz Display with Questions - Dark Mode
![Quiz Display with Questions - Dark Mode](Screenshots/Screenshot%202025-11-08%20104537.png)

#### 4. Interactive Quiz Taking Interface - Dark Mode
![Interactive Quiz Taking Interface - Dark Mode](Screenshots/Screenshot%202025-11-08%20104554.png)

#### 5. Quiz Results and Score Breakdown - Dark Mode
![Quiz Results and Score Breakdown - Dark Mode](Screenshots/Screenshot%202025-11-08%20104607.png)

#### 6. History Tab - Dark Mode
![History Tab - Dark Mode](Screenshots/Screenshot%202025-11-08%20104624.png)

#### 7. Quiz Details View - Dark Mode
![Quiz Details View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104713.png)

#### 8. Question Card with Options - Dark Mode
![Question Card with Options - Dark Mode](Screenshots/Screenshot%202025-11-08%20104725.png)

#### 9. Results Screen with Explanations - Dark Mode
![Results Screen with Explanations - Dark Mode](Screenshots/Screenshot%202025-11-08%20104743.png)

#### 10. Interactive Quiz - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104809.png)

#### 11. Quiz Questions - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104832.png)

#### 12. Quiz Questions - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104911.png)

#### 13. Score Card - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104927.png)

#### 14. Additional UI View - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20104948.png)

#### 15. API POST request - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20105103.png)

#### 16. Payload sent - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%202025-11-08%20105115.png)

#### 17. API Response - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%20(1441).png)

#### 18. API Response based on ID - Dark Mode
![Additional UI View - Dark Mode](Screenshots/Screenshot%20(1442).png)

## Usage

1. Review the JSON files in `json/` folder to understand the API response structure
2. Check the screenshots in `Screenshots/` folder to see the UI in action
3. Use the sample data for testing and development purposes
4. Reference these examples when demonstrating the application's capabilities


