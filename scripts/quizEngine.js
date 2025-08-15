/**
 * Quiz Engine for the French Vocabulary Learning App
 * Handles quiz logic, word selection, and answer generation
 */

class QuizEngine {
    constructor() {
        this.vocabulary = [];
        this.currentWord = null;
        this.currentOptions = [];
        this.correctAnswer = '';
        this.answeredWords = new Set();
        this.stats = {
            totalWords: 0,
            masteredWords: 0,
            currentStreak: 0,
            totalAnswered: 0,
            correctAnswers: 0
        };
    }

    /**
     * Initialize the quiz with vocabulary data
     * @param {Array} vocabulary - Array of vocabulary objects
     */
    initialize(vocabulary) {
        if (!Array.isArray(vocabulary) || vocabulary.length === 0) {
            throw new Error('Invalid vocabulary data');
        }

        this.vocabulary = vocabulary.map(item => ({
            ...item,
            mastered: item.mastered || false
        }));

        this.stats.totalWords = this.vocabulary.length;
        this.stats.masteredWords = this.vocabulary.filter(word => word.mastered).length;
        this.updateStats();
    }

    /**
     * Get the next word for the quiz
     * @returns {Object|null} Quiz state object or null if no words left
     */
    getNextWord() {
        // Get all non-mastered words
        const availableWords = this.vocabulary.filter(word => !word.mastered);
        
        if (availableWords.length === 0) {
            return null; // All words mastered
        }

        // Select a random word from available words
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        this.currentWord = availableWords[randomIndex];

        // Generate multiple choice options
        this.currentOptions = this.generateOptions(this.currentWord);
        this.correctAnswer = this.currentWord.english;

        return {
            french: this.currentWord.french,
            options: this.currentOptions,
            correctAnswer: this.correctAnswer
        };
    }

    /**
     * Generate multiple choice options for a word
     * @param {Object} word - Current word object
     * @returns {Array} Array of 4 options with correct answer included
     */
    generateOptions(word) {
        const options = [word.english]; // Start with correct answer
        
        // Get all other English translations for incorrect options
        const otherAnswers = this.vocabulary
            .filter(item => item.english !== word.english)
            .map(item => item.english);

        // Shuffle and take up to 3 incorrect options
        const shuffledOthers = this.shuffleArray([...otherAnswers]);
        const incorrectOptions = shuffledOthers.slice(0, 3);

        // Combine correct and incorrect options
        const allOptions = [...options, ...incorrectOptions];
        
        // Shuffle the final options array
        return this.shuffleArray(allOptions);
    }

    /**
     * Submit an answer and get feedback
     * @param {string} selectedAnswer - User's selected answer
     * @returns {Object} Answer result with feedback and stats
     */
    submitAnswer(selectedAnswer) {
        if (!this.currentWord) {
            throw new Error('No current word selected');
        }

        const isCorrect = selectedAnswer === this.correctAnswer;
        this.stats.totalAnswered++;

        if (isCorrect) {
            // Mark word as mastered
            this.currentWord.mastered = true;
            this.stats.masteredWords++;
            this.stats.currentStreak++;
            this.stats.correctAnswers++;
            
            // Add to answered words set
            this.answeredWords.add(this.currentWord.french);
        } else {
            // Reset streak on incorrect answer
            this.stats.currentStreak = 0;
        }

        this.updateStats();

        return {
            isCorrect,
            correctAnswer: this.correctAnswer,
            selectedAnswer,
            feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is "${this.correctAnswer}".`,
            stats: { ...this.stats },
            wordMastered: isCorrect
        };
    }

    /**
     * Check if all words have been mastered
     * @returns {boolean} True if all words are mastered
     */
    isComplete() {
        return this.stats.masteredWords === this.stats.totalWords;
    }

    /**
     * Get current progress statistics
     * @returns {Object} Current progress stats
     */
    getProgress() {
        const percentage = this.stats.totalWords > 0 
            ? Math.round((this.stats.masteredWords / this.stats.totalWords) * 100)
            : 0;

        return {
            masteredCount: this.stats.masteredWords,
            totalCount: this.stats.totalWords,
            percentage,
            currentStreak: this.stats.currentStreak,
            accuracy: this.stats.totalAnswered > 0 
                ? Math.round((this.stats.correctAnswers / this.stats.totalAnswered) * 100)
                : 0
        };
    }

    /**
     * Reset all mastery status
     */
    resetProgress() {
        this.vocabulary.forEach(word => {
            word.mastered = false;
        });
        
        this.stats.masteredWords = 0;
        this.stats.currentStreak = 0;
        this.stats.totalAnswered = 0;
        this.stats.correctAnswers = 0;
        this.answeredWords.clear();
        
        this.updateStats();
    }

    /**
     * Get vocabulary with current mastery status
     * @returns {Array} Array of vocabulary objects with mastery status
     */
    getVocabulary() {
        return [...this.vocabulary];
    }

    /**
     * Get words that need review (incorrectly answered)
     * @returns {Array} Array of words that need review
     */
    getWordsNeedingReview() {
        return this.vocabulary.filter(word => !word.mastered);
    }

    /**
     * Get mastered words
     * @returns {Array} Array of mastered words
     */
    getMasteredWords() {
        return this.vocabulary.filter(word => word.mastered);
    }

    /**
     * Update internal statistics
     */
    updateStats() {
        this.stats.masteredWords = this.vocabulary.filter(word => word.mastered).length;
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get quiz statistics and analytics
     * @returns {Object} Detailed quiz statistics
     */
    getDetailedStats() {
        const progress = this.getProgress();
        const wordsNeedingReview = this.getWordsNeedingReview();
        const masteredWords = this.getMasteredWords();

        return {
            ...progress,
            wordsNeedingReview: wordsNeedingReview.length,
            masteredWords: masteredWords.length,
            totalAnswered: this.stats.totalAnswered,
            correctAnswers: this.stats.correctAnswers,
            currentStreak: this.stats.currentStreak,
            averageAccuracy: this.stats.totalAnswered > 0 
                ? (this.stats.correctAnswers / this.stats.totalAnswered * 100).toFixed(1)
                : '0.0'
        };
    }

    /**
     * Get a specific word by French text
     * @param {string} french - French word to find
     * @returns {Object|null} Word object or null if not found
     */
    getWordByFrench(french) {
        return this.vocabulary.find(word => word.french === french) || null;
    }

    /**
     * Mark a specific word as mastered
     * @param {string} french - French word to mark as mastered
     * @returns {boolean} True if word was found and marked
     */
    markWordAsMastered(french) {
        const word = this.getWordByFrench(french);
        if (word && !word.mastered) {
            word.mastered = true;
            this.updateStats();
            return true;
        }
        return false;
    }

    /**
     * Get difficulty level based on current progress
     * @returns {string} Difficulty level (easy, medium, hard)
     */
    getDifficultyLevel() {
        const percentage = this.getProgress().percentage;
        
        if (percentage < 25) return 'easy';
        if (percentage < 75) return 'medium';
        return 'hard';
    }

    /**
     * Get words for review based on difficulty
     * @param {number} count - Number of words to get
     * @returns {Array} Array of words for review
     */
    getReviewWords(count = 10) {
        const wordsNeedingReview = this.getWordsNeedingReview();
        const shuffled = this.shuffleArray(wordsNeedingReview);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Export quiz state for persistence
     * @returns {Object} Quiz state object
     */
    exportState() {
        return {
            vocabulary: this.getVocabulary(),
            stats: { ...this.stats },
            answeredWords: Array.from(this.answeredWords),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import quiz state from persistence
     * @param {Object} state - Quiz state object
     */
    importState(state) {
        if (state.vocabulary) {
            this.vocabulary = state.vocabulary;
        }
        
        if (state.stats) {
            this.stats = { ...state.stats };
        }
        
        if (state.answeredWords) {
            this.answeredWords = new Set(state.answeredWords);
        }
        
        this.updateStats();
    }
}

// Create global instance
const quizEngine = new QuizEngine();

// Ensure it's available globally
window.quizEngine = quizEngine;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
} 