# PRD – French Vocabulary Learning Web App

## 1. Overview
The French Vocabulary Learning Web App helps learners practice and retain French vocabulary through multiple-choice quizzes. Words are drawn from a user-uploaded CSV file, allowing flexible and updatable word lists. Incorrectly answered words are reintroduced into the quiz pool until the learner masters them all. Progress is saved in the browser via `localStorage` so learners can continue across sessions.

## 2. Goals
- Provide an engaging, repeatable way to learn French vocabulary.
- Support flexible vocabulary lists via CSV upload.
- Reinforce learning by repeating missed words until mastery.
- Persist progress between sessions using `localStorage`.
- Provide visual progress feedback (number correct, percentage correct).
- Allow resetting progress to start fresh.

## 3. Features

### 3.1 CSV Upload & Vocabulary Setup
- User uploads a **two-column CSV** file with headers.
- CSV parsing occurs in-browser using JavaScript (no backend).
- On successful load, vocabulary entries are stored in memory with a `mastered` flag (default: `false`).
- Validation:
  - Minimum of **4 words** (required for multiple-choice).
  - No missing `french` or `english` fields.

**CSV format (two columns, with headers):**
```csv
french,english
chat,cat
chien,dog
3.2 Vocabulary Presentation
Display one French word at a time.

Present four English definition choices:

One correct definition from the word’s row.

Three incorrect options randomly chosen from any other entry in the CSV.

Answer order randomized each time the word is shown.

3.3 Quiz Flow
Learner selects an answer.

Immediate feedback:

Correct: Show confirmation (“Correct!”) and mark as mastered.

Incorrect: Show correct definition and mark the word as needs review.

Incorrectly answered words are folded back into the active pool until answered correctly.

The quiz ends when all words are mastered.

3.4 Progress Tracking
Always-visible stats:

Number mastered (integer).

Percentage mastered (mastered / total * 100).

Progress bar visualizes percentage mastered.

localStorage persists:

Vocabulary with mastery status.

Remaining word pool / queue state.

Progress counters.

3.5 Reset Functionality
Reset clears all data from localStorage and returns to the CSV upload screen.

Includes a confirmation prompt before proceeding.

4. Technical Requirements
4.1 Data Format in Memory
json
Copy
Edit
[
  { "french": "chat",  "english": "cat", "mastered": false },
  { "french": "chien", "english": "dog", "mastered": true }
]
4.2 Local Storage Keys
vocabData – JSON array of vocabulary with mastery status.

progress – Object storing counters and remaining pool/queue state.

4.3 Randomization
Shuffle word order at session start (or after CSV upload).

Shuffle multiple-choice answer order for each presentation.

4.4 Accessibility & Design
Mobile-friendly, touch-first layout.

Large, high-contrast text and generously spaced answer buttons.

Keyboard shortcuts (1–4) for answer selection; Enter/Space for Next.

5. Non-Functional Requirements
Performance: Instant load after CSV upload; no network calls after initial page load.

Reliability: State persists across reloads and browser restarts via localStorage.

Usability: Simple, child-friendly interface with clear feedback.

6. Future Enhancements
Save & switch between multiple vocabulary sets.

Audio pronunciation for each French word.

Session statistics (time taken, per-word accuracy).

Streak tracking, badges, simple gamification.
