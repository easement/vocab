/**
 * Main Application Module for French Vocabulary Learning App
 * Coordinates all modules and handles application lifecycle
 */

class VocabularyApp {
    constructor() {
        this.isInitialized = false;
        this.settings = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing French Vocabulary Learning App...');
            
            // Check if storage module is available
            if (typeof storage === 'undefined') {
                console.error('Storage module not available');
                this.showStorageError();
                return;
            }
            
            // Check if localStorage is available
            if (!storage.isAvailable()) {
                this.showStorageError();
                return;
            }

            // Load settings
            this.settings = storage.loadSettings();
            
            // All modules should be available now since we waited for them
            this.continueInitialization();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Continue initialization after UI is ready
     */
    continueInitialization() {
        try {
            // Ensure UI is available
            if (typeof ui === 'undefined') {
                console.error('UI module not available');
                return;
            }
            
            // Check for existing data and restore state
            const hasExistingData = ui.checkExistingData();
            
            if (!hasExistingData) {
                // Show upload screen for new users
                ui.showUploadScreen();
            }

            // Apply theme if needed
            this.applyTheme();
            
            // Setup additional event listeners
            this.setupGlobalEvents();
            
            this.isInitialized = true;
            console.log('App initialized successfully');
            
            // Log app info
            this.logAppInfo();
            
        } catch (error) {
            console.error('Failed to continue initialization:', error);
            this.showError('Failed to complete initialization. Please refresh the page.');
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });

        // Handle beforeunload to save state
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('App is back online');
        });

        window.addEventListener('offline', () => {
            console.log('App is offline');
        });

        // Handle resize events for responsive design
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Handle page becoming visible
     */
    handlePageVisible() {
        // Refresh progress display when page becomes visible
        if (typeof ui !== 'undefined' && ui.currentScreen === 'quiz') {
            ui.updateProgress();
        }
    }

    /**
     * Save current application state
     */
    saveCurrentState() {
        try {
            if (typeof quizEngine !== 'undefined' && quizEngine.vocabulary.length > 0) {
                storage.saveVocabulary(quizEngine.getVocabulary());
                storage.saveProgress(quizEngine.getProgress());
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update any responsive elements if needed
        // For now, just log the resize
        console.log('Window resized:', window.innerWidth, 'x', window.innerHeight);
    }

    /**
     * Apply theme settings
     */
    applyTheme() {
        if (this.settings && this.settings.theme) {
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
    }

    /**
     * Show storage error message
     */
    showStorageError() {
        const errorMessage = 'localStorage is not available. Please enable cookies and try again.';
        console.error(errorMessage);
        
        // Create a simple error display
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h1>Storage Error</h1>
                    <p>${errorMessage}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('App Error:', message);
        ui.showError(message);
    }

    /**
     * Log application information
     */
    logAppInfo() {
        const storageInfo = storage.getStorageInfo();
        const appInfo = {
            version: '1.0.0',
            storage: storageInfo,
            settings: this.settings,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };
        
        console.log('App Info:', appInfo);
    }

    /**
     * Get application statistics
     * @returns {Object} App statistics
     */
    getAppStats() {
        const progress = quizEngine.getProgress();
        const storageInfo = storage.getStorageInfo();
        
        return {
            progress,
            storage: storageInfo,
            settings: this.settings,
            isInitialized: this.isInitialized,
            currentScreen: ui.currentScreen,
            vocabularyCount: quizEngine.vocabulary.length,
            masteredCount: progress.masteredCount,
            completionPercentage: progress.percentage
        };
    }

    /**
     * Export application data
     * @returns {string} JSON string of app data
     */
    exportAppData() {
        return storage.exportData();
    }

    /**
     * Import application data
     * @param {string} jsonData - JSON string of app data
     * @returns {boolean} True if import was successful
     */
    importAppData(jsonData) {
        const success = storage.importData(jsonData);
        
        if (success) {
            // Reload the app with imported data
            location.reload();
        }
        
        return success;
    }

    /**
     * Reset application completely
     */
    resetApp() {
        try {
            storage.clearAll();
            quizEngine.resetProgress();
            ui.showUploadScreen();
            console.log('App reset successfully');
        } catch (error) {
            console.error('Error resetting app:', error);
            this.showError('Failed to reset application');
        }
    }

    /**
     * Utility function for debouncing
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get application version
     * @returns {string} App version
     */
    getVersion() {
        return '1.0.0';
    }

    /**
     * Check if app is running in development mode
     * @returns {boolean} True if in development
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    /**
     * Log debug information in development mode
     * @param {string} message - Debug message
     * @param {*} data - Debug data
     */
    debug(message, data = null) {
        if (this.isDevelopment()) {
            console.log(`[DEBUG] ${message}`, data);
        }
    }
}

// Initialize the app when DOM is loaded and all modules are ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all modules to be available
    const waitForModules = () => {
        const requiredModules = ['storage', 'csvParser', 'quizEngine', 'ui'];
        const missingModules = requiredModules.filter(m => typeof window[m] === 'undefined');
        
        if (missingModules.length > 0) {
            console.log('Waiting for modules:', missingModules);
            setTimeout(waitForModules, 50);
            return;
        }
        
        console.log('All modules available, initializing app...');
        
        // Create global app instance
        window.vocabApp = new VocabularyApp();
        
        // Add some global utility functions
        window.getAppStats = () => window.vocabApp.getAppStats();
        window.exportAppData = () => window.vocabApp.exportAppData();
        window.resetApp = () => window.vocabApp.resetApp();
        
        console.log('French Vocabulary Learning App loaded successfully!');
    };
    
    // Start waiting for modules
    waitForModules();
});

// Handle any unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    if (window.vocabApp) {
        window.vocabApp.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.vocabApp) {
        window.vocabApp.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyApp;
} 