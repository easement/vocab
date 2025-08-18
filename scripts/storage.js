/**
 * Storage utilities for the French Vocabulary Learning App
 * Handles localStorage operations for vocabulary data and progress
 */

class StorageManager {
    constructor() {
        this.VOCAB_KEY = 'vocabData';
        this.PROGRESS_KEY = 'progress';
        this.SETTINGS_KEY = 'settings';
    }

    /**
     * Save vocabulary data to localStorage
     * @param {Array} vocabulary - Array of vocabulary objects
     */
    saveVocabulary(vocabulary) {
        try {
            const data = vocabulary.map(item => ({
                french: item.french,
                english: item.english,
                mastered: item.mastered || false
            }));
            localStorage.setItem(this.VOCAB_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving vocabulary:', error);
            return false;
        }
    }

    /**
     * Load vocabulary data from localStorage
     * @returns {Array|null} Array of vocabulary objects or null if not found
     */
    loadVocabulary() {
        try {
            const data = localStorage.getItem(this.VOCAB_KEY);
            if (!data) return null;
            
            const vocabulary = JSON.parse(data);
            
            // Validate the data structure
            if (!Array.isArray(vocabulary)) {
                console.warn('Invalid vocabulary data structure');
                return null;
            }
            
            // Ensure all items have required properties
            const validVocabulary = vocabulary.filter(item => 
                item && 
                typeof item.french === 'string' && 
                typeof item.english === 'string' &&
                typeof item.mastered === 'boolean'
            );
            
            if (validVocabulary.length !== vocabulary.length) {
                console.warn('Some vocabulary items were invalid and removed');
            }
            
            return validVocabulary;
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            return null;
        }
    }

    /**
     * Save progress data to localStorage
     * @param {Object} progress - Progress object with counters and state
     */
    saveProgress(progress) {
        try {
            const data = {
                masteredCount: progress.masteredCount || 0,
                totalCount: progress.totalCount || 0,
                percentage: progress.percentage || 0,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    }

    /**
     * Load progress data from localStorage
     * @returns {Object|null} Progress object or null if not found
     */
    loadProgress() {
        try {
            const data = localStorage.getItem(this.PROGRESS_KEY);
            if (!data) return null;
            
            const progress = JSON.parse(data);
            
            // Validate the data structure
            if (!progress || typeof progress !== 'object') {
                console.warn('Invalid progress data structure');
                return null;
            }
            
            return {
                masteredCount: progress.masteredCount || 0,
                totalCount: progress.totalCount || 0,
                percentage: progress.percentage || 0,
                lastUpdated: progress.lastUpdated || null
            };
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    }

    /**
     * Save app settings to localStorage
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            const data = {
                theme: settings.theme || 'light',
                soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
                keyboardShortcuts: settings.keyboardShortcuts !== undefined ? settings.keyboardShortcuts : true,
                flipMode: settings.flipMode !== undefined ? settings.flipMode : false,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    /**
     * Load app settings from localStorage
     * @returns {Object} Settings object with defaults
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            if (!data) {
                // Return default settings
                return {
                    theme: 'light',
                    soundEnabled: true,
                    keyboardShortcuts: true,
                    flipMode: false,
                    lastUpdated: null
                };
            }
            
            const settings = JSON.parse(data);
            
            return {
                theme: settings.theme || 'light',
                soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
                keyboardShortcuts: settings.keyboardShortcuts !== undefined ? settings.keyboardShortcuts : true,
                flipMode: settings.flipMode !== undefined ? settings.flipMode : false,
                lastUpdated: settings.lastUpdated || null
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            // Return default settings on error
            return {
                theme: 'light',
                soundEnabled: true,
                keyboardShortcuts: true,
                flipMode: false,
                lastUpdated: null
            };
        }
    }

    /**
     * Clear all app data from localStorage
     */
    clearAll() {
        try {
            localStorage.removeItem(this.VOCAB_KEY);
            localStorage.removeItem(this.PROGRESS_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available and working
     * @returns {boolean} True if localStorage is available
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            const vocabSize = localStorage.getItem(this.VOCAB_KEY)?.length || 0;
            const progressSize = localStorage.getItem(this.PROGRESS_KEY)?.length || 0;
            const settingsSize = localStorage.getItem(this.SETTINGS_KEY)?.length || 0;
            
            return {
                totalSize: vocabSize + progressSize + settingsSize,
                vocabSize,
                progressSize,
                settingsSize,
                available: this.isAvailable()
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                totalSize: 0,
                vocabSize: 0,
                progressSize: 0,
                settingsSize: 0,
                available: false
            };
        }
    }

    /**
     * Export all data as a JSON string
     * @returns {string} JSON string of all app data
     */
    exportData() {
        try {
            const data = {
                vocabulary: this.loadVocabulary(),
                progress: this.loadProgress(),
                settings: this.loadSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Import data from a JSON string
     * @param {string} jsonData - JSON string of app data
     * @returns {boolean} True if import was successful
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.vocabulary) {
                this.saveVocabulary(data.vocabulary);
            }
            
            if (data.progress) {
                this.saveProgress(data.progress);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create global instance
const storage = new StorageManager();

// Ensure it's available globally
window.storage = storage;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} 