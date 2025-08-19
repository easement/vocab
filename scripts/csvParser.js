/**
 * CSV Parser for the French Vocabulary Learning App
 * Handles CSV file parsing and validation
 */

class CSVParser {
    constructor() {
        this.requiredHeaders = ['french', 'english'];
        this.minWords = 4;
    }

    /**
     * Parse CSV content and validate format
     * @param {string} csvContent - Raw CSV content
     * @returns {Object} Parsed result with vocabulary array and validation info
     */
    parseCSV(csvContent) {
        try {
            // Normalize line endings and trim whitespace
            const normalizedContent = csvContent
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .trim();

            if (!normalizedContent) {
                return {
                    success: false,
                    error: 'CSV file is empty',
                    vocabulary: []
                };
            }

            // Split into lines and filter out empty lines
            const lines = normalizedContent
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length < 2) {
                return {
                    success: false,
                    error: 'CSV file must have at least a header row and one data row',
                    vocabulary: []
                };
            }

            // Parse header row
            const headerRow = this.parseCSVRow(lines[0]);
            const headerValidation = this.validateHeaders(headerRow);
            
            if (!headerValidation.valid) {
                return {
                    success: false,
                    error: headerValidation.error,
                    vocabulary: []
                };
            }

            // Parse data rows
            const dataRows = lines.slice(1);
            const vocabulary = [];
            const errors = [];

            for (let i = 0; i < dataRows.length; i++) {
                const rowNumber = i + 2; // +2 because we start from line 2 (after header)
                const row = this.parseCSVRow(dataRows[i]);
                
                const rowValidation = this.validateDataRow(row, rowNumber);
                if (rowValidation.valid) {
                    vocabulary.push({
                        french: row.french.trim(),
                        english: row.english.trim(),
                        mastered: false
                    });
                } else {
                    errors.push(rowValidation.error);
                }
            }

            // Check minimum word requirement
            if (vocabulary.length < this.minWords) {
                return {
                    success: false,
                    error: `CSV must contain at least ${this.minWords} valid vocabulary words. Found ${vocabulary.length}.`,
                    vocabulary: []
                };
            }

            // Remove duplicates based on French word
            const uniqueVocabulary = this.removeDuplicates(vocabulary);

            if (uniqueVocabulary.length !== vocabulary.length) {
                console.warn(`Removed ${vocabulary.length - uniqueVocabulary.length} duplicate entries`);
            }

            return {
                success: true,
                vocabulary: uniqueVocabulary,
                stats: {
                    totalRows: dataRows.length,
                    validRows: uniqueVocabulary.length,
                    invalidRows: errors.length,
                    duplicatesRemoved: vocabulary.length - uniqueVocabulary.length
                },
                errors: errors.length > 0 ? errors : null
            };

        } catch (error) {
            console.error('Error parsing CSV:', error);
            return {
                success: false,
                error: 'Failed to parse CSV file. Please check the format.',
                vocabulary: []
            };
        }
    }

    /**
     * Parse a single CSV row
     * @param {string} row - CSV row string
     * @returns {Object} Parsed row object
     */
    parseCSVRow(row) {
        const result = {};
        let current = '';
        let inQuotes = false;
        let fieldIndex = 0;
        const fields = [];

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                fields.push(current.trim());
                current = '';
                fieldIndex++;
            } else {
                current += char;
            }
        }

        // Add the last field
        fields.push(current.trim());

        // Map to expected headers
        if (fields.length >= 2) {
            result.french = fields[0];
            result.english = fields[1];
        }

        return result;
    }

    /**
     * Validate CSV headers
     * @param {Object} headers - Parsed header row
     * @returns {Object} Validation result
     */
    validateHeaders(headers) {
        for (const required of this.requiredHeaders) {
            if (!headers[required] || headers[required].toLowerCase() !== required) {
                return {
                    valid: false,
                    error: `CSV must have headers: ${this.requiredHeaders.join(', ')}. Found: ${Object.keys(headers).join(', ')}`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validate a data row
     * @param {Object} row - Parsed data row
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Validation result
     */
    validateDataRow(row, rowNumber) {
        // Check if both french and english fields exist and are not empty
        if (!row.french || !row.english) {
            return {
                valid: false,
                error: `Row ${rowNumber}: Missing french or english field`
            };
        }

        if (row.french.trim() === '' || row.english.trim() === '') {
            return {
                valid: false,
                error: `Row ${rowNumber}: French or English field is empty`
            };
        }

        // Check for reasonable length limits
        if (row.french.length > 100 || row.english.length > 100) {
            return {
                valid: false,
                error: `Row ${rowNumber}: French or English text is too long (max 100 characters)`
            };
        }

        return { valid: true };
    }

    /**
     * Remove duplicate vocabulary entries based on French word
     * @param {Array} vocabulary - Array of vocabulary objects
     * @returns {Array} Array with duplicates removed
     */
    removeDuplicates(vocabulary) {
        const seen = new Set();
        return vocabulary.filter(item => {
            const key = item.french.toLowerCase().trim();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Handle file upload and parsing
     * @param {File} file - File object from input
     * @returns {Promise} Promise that resolves with parse result
     */
    async parseFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.name.toLowerCase().endsWith('.csv')) {
                reject(new Error('Please select a CSV file'));
                return;
            }

            // Check file size (max 1MB)
            if (file.size > 1024 * 1024) {
                reject(new Error('File size must be less than 1MB'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const csvContent = event.target.result;
                    const result = this.parseCSV(csvContent);
                    resolve(result);
                } catch (error) {
                    reject(new Error('Failed to read file: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Generate example CSV content
     * @returns {string} Example CSV string
     */
    generateExample() {
        const exampleData = [
            { french: 'chat', english: 'cat' },
            { french: 'chien', english: 'dog' },
            { french: 'maison', english: 'house' },
            { french: 'voiture', english: 'car' },
            { french: 'livre', english: 'book' },
            { french: 'table', english: 'table' }
        ];

        const header = this.requiredHeaders.join(',');
        const rows = exampleData.map(item => `${item.french},${item.english}`);
        
        return [header, ...rows].join('\n');
    }

    /**
     * Get sample vocabulary data
     * @returns {Array} Array of sample vocabulary objects
     */
    getSampleVocabulary() {
        return [
            { french: 'bonjour', english: 'hello' },
            { french: 'au revoir', english: 'goodbye' },
            { french: 'merci', english: 'thank you' },
            { french: 's\'il vous plaît', english: 'please' },
            { french: 'oui', english: 'yes' },
            { french: 'non', english: 'no' },
            { french: 'chat', english: 'cat' },
            { french: 'chien', english: 'dog' },
            { french: 'maison', english: 'house' },
            { french: 'voiture', english: 'car' },
            { french: 'livre', english: 'book' },
            { french: 'table', english: 'table' },
            { french: 'pain', english: 'bread' },
            { french: 'eau', english: 'water' },
            { french: 'café', english: 'coffee' },
            { french: 'temps', english: 'time' },
            { french: 'jour', english: 'day' },
            { french: 'nuit', english: 'night' },
            { french: 'famille', english: 'family' },
            { french: 'ami', english: 'friend' }
        ];
    }

    /**
     * Export vocabulary to CSV format
     * @param {Array} vocabulary - Array of vocabulary objects
     * @returns {string} CSV formatted string
     */
    exportToCSV(vocabulary) {
        if (!Array.isArray(vocabulary) || vocabulary.length === 0) {
            return '';
        }

        const header = this.requiredHeaders.join(',');
        const rows = vocabulary.map(item => `${item.french},${item.english}`);
        
        return [header, ...rows].join('\n');
    }

    /**
     * Validate vocabulary array structure
     * @param {Array} vocabulary - Array to validate
     * @returns {Object} Validation result
     */
    validateVocabularyArray(vocabulary) {
        if (!Array.isArray(vocabulary)) {
            return {
                valid: false,
                error: 'Vocabulary must be an array'
            };
        }

        if (vocabulary.length < this.minWords) {
            return {
                valid: false,
                error: `Vocabulary must contain at least ${this.minWords} words`
            };
        }

        for (let i = 0; i < vocabulary.length; i++) {
            const item = vocabulary[i];
            if (!item || typeof item !== 'object') {
                return {
                    valid: false,
                    error: `Invalid vocabulary item at index ${i}`
                };
            }

            if (!item.french || !item.english) {
                return {
                    valid: false,
                    error: `Vocabulary item at index ${i} is missing french or english field`
                };
            }
        }

        return { valid: true };
    }
}

// Create global instance
const csvParser = new CSVParser();

// Ensure it's available globally
window.csvParser = csvParser;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVParser;
} 