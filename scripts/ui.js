/**
 * UI Manager for the French Vocabulary Learning App
 * Handles all user interface interactions and screen management
 */

class UIManager {
    constructor() {
        this.currentScreen = 'upload';
        this.screens = {};
        this.modals = {};
        this.isInitialized = false;
        this.isUploading = false; // Flag to prevent multiple uploads
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize UI after DOM is loaded
     */
    initialize() {
        try {
            this.screens = {
                upload: document.getElementById('upload-screen'),
                quiz: document.getElementById('quiz-screen'),
                completion: document.getElementById('completion-screen')
            };
            this.modals = {
                reset: document.getElementById('reset-modal'),
                error: document.getElementById('error-modal')
            };
            
            // Validate that all required elements exist
            const requiredElements = [
                'upload-screen', 'quiz-screen', 'completion-screen',
                'reset-modal', 'error-modal', 'upload-area', 'file-input'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
            }
            
            this.initializeEventListeners();
            this.isInitialized = true;
            console.log('UI Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize UI Manager:', error);
            // Don't call showError during initialization as it might not be available yet
            console.error('UI initialization error:', error.message);
        }
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // File upload events
        this.setupFileUpload();
        
        // Quiz events
        this.setupQuizEvents();
        
        // Modal events
        this.setupModalEvents();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Reset functionality
        this.setupResetEvents();
    }

    /**
     * Setup file upload functionality
     */
    setupFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const chooseFileBtn = document.getElementById('choose-file-btn');

        // Check if elements exist before setting up event listeners
        if (!uploadArea || !fileInput) {
            console.error('Upload elements not found:', { uploadArea: !!uploadArea, fileInput: !!fileInput });
            return;
        }

        // Click to upload (upload area)
        uploadArea.addEventListener('click', (event) => {
            // Don't trigger if clicking on the button
            if (event.target.closest('#choose-file-btn')) {
                return;
            }
            fileInput.click();
        });

        // Choose file button
        if (chooseFileBtn) {
            chooseFileBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent upload area click
                fileInput.click();
            });
        }

        // Use sample vocabulary button
        const useSampleBtn = document.getElementById('use-sample-btn');
        if (useSampleBtn) {
            useSampleBtn.addEventListener('click', () => {
                this.handleSampleVocabulary();
            });
        }

        // File input change
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && !this.isUploading) {
                this.isUploading = true;
                this.handleFileUpload(file);
                // Clear the file input to allow re-uploading the same file
                event.target.value = '';
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (event) => {
            event.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = event.dataTransfer.files;
            if (files.length > 0 && !this.isUploading) {
                this.isUploading = true;
                this.handleFileUpload(files[0]);
            }
        });
    }

    /**
     * Setup quiz-related events
     */
    setupQuizEvents() {
        // Answer button clicks
        const answerButtons = document.querySelectorAll('.answer-btn');
        if (answerButtons.length > 0) {
            answerButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const selectedAnswer = event.currentTarget.querySelector('.answer-text').textContent;
                    this.handleAnswerSelection(selectedAnswer);
                });
            });
        }

        // Next button
        const nextButton = document.getElementById('next-btn');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.handleNextWord();
            });
        }

        // Flip mode button
        const flipModeBtn = document.getElementById('flip-mode-btn');
        if (flipModeBtn) {
            flipModeBtn.addEventListener('click', () => {
                this.handleFlipModeToggle();
            });
        }

        // Completion screen buttons
        const restartButton = document.getElementById('restart-btn');
        const newVocabButton = document.getElementById('new-vocab-btn');
        
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.handleRestart();
            });
        }
        
        if (newVocabButton) {
            newVocabButton.addEventListener('click', () => {
                this.showUploadScreen();
            });
        }
    }

    /**
     * Setup modal events
     */
    setupModalEvents() {
        // Reset modal
        const cancelReset = document.getElementById('cancel-reset');
        const confirmReset = document.getElementById('confirm-reset');
        
        if (cancelReset) {
            cancelReset.addEventListener('click', () => {
                this.hideModal('reset');
            });
        }
        
        if (confirmReset) {
            confirmReset.addEventListener('click', () => {
                this.handleConfirmReset();
            });
        }

        // Error modal
        const closeError = document.getElementById('close-error');
        if (closeError) {
            closeError.addEventListener('click', () => {
                this.hideModal('error');
            });
        }

        // Close modals when clicking outside
        Object.values(this.modals).forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        this.hideModal(modal.id.replace('-modal', ''));
                    }
                });
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only handle shortcuts if we're on the quiz screen
            if (this.currentScreen !== 'quiz') return;

            const key = event.key.toLowerCase();
            
            // Number keys 1-4 for answer selection
            if (['1', '2', '3', '4'].includes(key)) {
                event.preventDefault();
                const answerIndex = parseInt(key) - 1;
                const answerButton = document.querySelector(`[data-index="${answerIndex}"]`);
                if (answerButton && !answerButton.disabled) {
                    const selectedAnswer = answerButton.querySelector('.answer-text').textContent;
                    this.handleAnswerSelection(selectedAnswer);
                }
            }
            
            // Enter or Space for next word
            if (['enter', ' '].includes(key)) {
                event.preventDefault();
                const nextButton = document.getElementById('next-btn');
                if (nextButton && !nextButton.hidden) {
                    this.handleNextWord();
                }
            }
        });
    }

    /**
     * Setup reset events
     */
    setupResetEvents() {
        const resetButton = document.getElementById('reset-btn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.showModal('reset');
            });
        }
    }

    /**
     * Handle file upload
     * @param {File} file - Uploaded file
     */
    async handleFileUpload(file) {
        try {
            this.showLoadingState();
            
            const result = await csvParser.parseFile(file);
            
            if (result.success) {
                this.initializeQuizWithVocabulary(result.vocabulary);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoadingState();
            this.isUploading = false; // Reset upload flag
        }
    }

    /**
     * Handle sample vocabulary selection
     */
    handleSampleVocabulary() {
        try {
            this.showLoadingState();
            
            const sampleVocabulary = csvParser.getSampleVocabulary();
            this.initializeQuizWithVocabulary(sampleVocabulary);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Initialize quiz with vocabulary data
     * @param {Array} vocabulary - Vocabulary array
     */
    initializeQuizWithVocabulary(vocabulary) {
        // Initialize quiz engine
        quizEngine.initialize(vocabulary);
        
        // Save to storage
        storage.saveVocabulary(vocabulary);
        storage.saveProgress({
            masteredCount: 0,
            totalCount: vocabulary.length,
            percentage: 0
        });
        
        // Show quiz screen
        this.showQuizScreen();
        this.loadNextWord();
        this.updateFlipModeButton(quizEngine.getFlipMode());
        
        // Show success message
        this.showSuccessMessage(`Successfully loaded ${vocabulary.length} words!`);
    }

    /**
     * Handle answer selection
     * @param {string} selectedAnswer - User's selected answer
     */
    handleAnswerSelection(selectedAnswer) {
        try {
            const result = quizEngine.submitAnswer(selectedAnswer);
            
            // Disable all answer buttons
            this.disableAnswerButtons();
            
            // Show feedback
            this.showAnswerFeedback(result);
            
            // Update progress
            this.updateProgress();
            
            // Save progress to storage
            storage.saveVocabulary(quizEngine.getVocabulary());
            storage.saveProgress(quizEngine.getProgress());
            
            // Auto-advance to next word with timing based on answer correctness
            this.startAutoAdvance(result.isCorrect);
            
        } catch (error) {
            this.showError('Error processing answer: ' + error.message);
        }
    }

    /**
     * Handle next word selection
     */
    handleNextWord() {
        // Cancel any pending auto-advance
        this.cancelAutoAdvance();
        
        if (quizEngine.isComplete()) {
            this.showCompletionScreen();
        } else {
            this.loadNextWord();
        }
    }

    /**
     * Handle restart quiz
     */
    handleRestart() {
        quizEngine.resetProgress();
        storage.saveVocabulary(quizEngine.getVocabulary());
        storage.saveProgress(quizEngine.getProgress());
        this.showQuizScreen();
        this.loadNextWord();
    }

    /**
     * Handle flip mode toggle
     */
    handleFlipModeToggle() {
        const newMode = quizEngine.toggleFlipMode();
        this.updateFlipModeButton(newMode);
        
        // Save the current state including flip mode
        storage.saveVocabulary(quizEngine.getVocabulary());
        storage.saveProgress(quizEngine.getProgress());
        
        // Save flip mode to settings
        const settings = storage.loadSettings();
        settings.flipMode = newMode;
        storage.saveSettings(settings);
        
        // Reload the current word with new mode
        this.loadNextWord();
    }

    /**
     * Update flip mode button appearance
     * @param {boolean} isFlipped - Whether the mode is flipped
     */
    updateFlipModeButton(isFlipped) {
        const flipModeBtn = document.getElementById('flip-mode-btn');
        const flipModeText = document.getElementById('flip-mode-text');
        
        if (flipModeBtn && flipModeText) {
            if (isFlipped) {
                flipModeBtn.classList.add('active');
                flipModeText.textContent = '🇬🇧 → 🇫🇷';
            } else {
                flipModeBtn.classList.remove('active');
                flipModeText.textContent = '🇫🇷 → 🇬🇧';
            }
        }
    }

    /**
     * Handle confirm reset
     */
    handleConfirmReset() {
        storage.clearAll();
        quizEngine.resetProgress();
        this.hideModal('reset');
        this.showUploadScreen();
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.classList.add('loading');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.classList.remove('loading');
        }
    }

    /**
     * Show upload screen
     */
    showUploadScreen() {
        this.switchScreen('upload');
        this.hideLoadingState();
    }

    /**
     * Show quiz screen
     */
    showQuizScreen() {
        this.switchScreen('quiz');
        this.updateProgress();
        this.updateFlipModeButton(quizEngine.getFlipMode());
    }

    /**
     * Show completion screen
     */
    showCompletionScreen() {
        this.switchScreen('completion');
        const finalCount = document.getElementById('final-count');
        if (finalCount) {
            finalCount.textContent = quizEngine.getProgress().totalCount;
        }
    }

    /**
     * Switch between screens
     * @param {string} screenName - Name of screen to show
     */
    switchScreen(screenName) {
        try {
            // Hide all screens
            Object.values(this.screens).forEach(screen => {
                if (screen) {
                    screen.classList.remove('active');
                }
            });

            // Show target screen
            if (this.screens[screenName]) {
                this.screens[screenName].classList.add('active');
                this.currentScreen = screenName;
            } else {
                console.error(`Screen '${screenName}' not found in screens object:`, this.screens);
            }
        } catch (error) {
            console.error('Error switching screens:', error);
            throw error;
        }
    }

    /**
     * Load next word in quiz
     */
    loadNextWord() {
        // Cancel any pending auto-advance
        this.cancelAutoAdvance();
        
        const wordData = quizEngine.getNextWord();
        
        if (!wordData) {
            this.showCompletionScreen();
            return;
        }

        // Update question word
        const questionWord = document.getElementById('question-word');
        if (questionWord) {
            questionWord.textContent = wordData.question;
        }

        // Update instruction text based on mode
        const instructionText = document.getElementById('instruction-text');
        if (instructionText) {
            if (wordData.mode === 'english-to-french') {
                instructionText.textContent = 'Choose the correct French translation:';
            } else {
                instructionText.textContent = 'Choose the correct English translation:';
            }
        }

        // Update answer options
        wordData.options.forEach((option, index) => {
            const answerText = document.getElementById(`answer-${index}`);
            if (answerText) {
                answerText.textContent = option;
            }
        });

        // Reset answer buttons
        this.resetAnswerButtons();
        
        // Hide feedback section
        this.hideFeedbackSection();
    }

    /**
     * Show answer feedback
     * @param {Object} result - Answer result object
     */
    showAnswerFeedback(result) {
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');

        if (feedbackSection && feedbackIcon && feedbackText) {
            // Hide feedback content
            feedbackIcon.textContent = '';
            feedbackText.textContent = '';

            // Show feedback section (for next button)
            feedbackSection.hidden = false;

            // Highlight correct/incorrect answers
            this.highlightAnswers(result);
        }
    }

    /**
     * Highlight correct and incorrect answers
     * @param {Object} result - Answer result object
     */
    highlightAnswers(result) {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(button => {
            const answerText = button.querySelector('.answer-text').textContent;
            
            if (answerText === result.correctAnswer) {
                button.classList.add('correct');
            } else if (answerText === result.selectedAnswer && !result.isCorrect) {
                button.classList.add('incorrect');
            }
        });
    }

    /**
     * Reset answer buttons to initial state
     */
    resetAnswerButtons() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(button => {
            button.classList.remove('correct', 'incorrect', 'disabled');
            button.disabled = false;
        });
    }

    /**
     * Disable all answer buttons
     */
    disableAnswerButtons() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(button => {
            button.classList.add('disabled');
            button.disabled = true;
        });
    }

    /**
     * Hide feedback section
     */
    hideFeedbackSection() {
        const feedbackSection = document.getElementById('feedback-section');
        if (feedbackSection) {
            feedbackSection.hidden = true;
        }
    }

    /**
     * Update progress display
     */
    updateProgress() {
        const progress = quizEngine.getProgress();
        
        // Update counters
        const masteredCount = document.getElementById('mastered-count');
        const totalCount = document.getElementById('total-count');
        const percentage = document.getElementById('percentage');
        
        if (masteredCount) masteredCount.textContent = progress.masteredCount;
        if (totalCount) totalCount.textContent = progress.totalCount;
        if (percentage) percentage.textContent = progress.percentage;

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress.percentage}%`;
        }
    }

    /**
     * Show modal
     * @param {string} modalName - Name of modal to show
     */
    showModal(modalName) {
        if (!this.isInitialized) {
            console.error('UI not initialized, cannot show modal');
            return;
        }
        
        const modal = this.modals[modalName];
        if (modal) {
            modal.hidden = false;
            modal.focus();
        } else {
            console.error(`Modal '${modalName}' not found`);
        }
    }

    /**
     * Hide modal
     * @param {string} modalName - Name of modal to hide
     */
    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.hidden = true;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.error('UI Error:', message);
        
        // If UI isn't initialized yet, just log the error
        if (!this.isInitialized) {
            console.error('UI not initialized, cannot show error modal');
            return;
        }
        
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        this.showModal('error');
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    showSuccessMessage(message) {
        // For now, just log success messages
        // Could be enhanced with toast notifications
        console.log('Success:', message);
    }

    /**
     * Check if app has existing data and restore state
     */
    checkExistingData() {
        const vocabulary = storage.loadVocabulary();
        const progress = storage.loadProgress();
        
        if (vocabulary && progress) {
            try {
                quizEngine.initialize(vocabulary);
                quizEngine.importState({ vocabulary, stats: progress });
                this.showQuizScreen();
                this.loadNextWord();
                return true;
            } catch (error) {
                console.error('Error restoring state:', error);
                storage.clearAll();
            }
        }
        
        return false;
    }

    /**
     * Start auto-advance timer
     * @param {boolean} isCorrect - Whether the answer was correct
     */
    startAutoAdvance(isCorrect = false) {
        // Cancel any existing timer
        this.cancelAutoAdvance();
        
        // Set timer based on answer correctness
        const delay = isCorrect ? 1000 : 2000; // 1 second for correct, 2 seconds for incorrect
        
        this.autoAdvanceTimer = setTimeout(() => {
            this.handleNextWord();
        }, delay);
        
        // Update the next button to show countdown
        this.updateNextButtonCountdown(delay / 1000);
    }

    /**
     * Cancel auto-advance timer
     */
    cancelAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset next button text
        const nextButton = document.getElementById('next-btn');
        if (nextButton) {
            nextButton.textContent = 'Next Word';
        }
    }

    /**
     * Update next button with countdown
     * @param {number} duration - Duration in seconds for the countdown
     */
    updateNextButtonCountdown(duration = 2) {
        const nextButton = document.getElementById('next-btn');
        if (!nextButton) return;
        
        let timeLeft = duration;
        const countdownInterval = setInterval(() => {
            if (timeLeft > 0) {
                nextButton.textContent = `Next Word (${timeLeft})`;
                timeLeft--;
            } else {
                clearInterval(countdownInterval);
                nextButton.textContent = 'Next Word';
            }
        }, 1000);
        
        // Store the interval so we can clear it if needed
        this.countdownInterval = countdownInterval;
    }
}

// Create global instance
const ui = new UIManager();

// Ensure it's available globally
window.ui = ui;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} 