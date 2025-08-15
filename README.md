# French Vocabulary Learning Web App

A modern, responsive web application for learning French vocabulary through interactive multiple-choice quizzes. Built with vanilla JavaScript, HTML, and CSS, this app runs entirely in the browser with no backend required.

## Features

- 📁 **CSV Upload**: Upload custom vocabulary lists via CSV files
- 🎯 **Multiple Choice Quizzes**: Interactive 4-option multiple choice questions
- 📊 **Progress Tracking**: Real-time progress with visual progress bar
- 💾 **Local Storage**: Progress persists across browser sessions
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- ⌨️ **Keyboard Shortcuts**: Use number keys 1-4 for answers, Enter/Space for next
- 📱 **Mobile-Friendly**: Touch-optimized interface for all devices
- 🔄 **Reset Functionality**: Start fresh with confirmation dialog
- 🎉 **Completion Screen**: Celebrate when all words are mastered

## Quick Start

1. **Download the files** to your computer
2. **Open `index.html`** in your web browser
3. **Upload a CSV file** with your French vocabulary
4. **Start learning!**

## CSV Format

Your CSV file must have exactly two columns with headers:

```csv
french,english
chat,cat
chien,dog
maison,house
voiture,car
```

**Requirements:**
- Minimum 4 words (required for multiple choice)
- Headers must be exactly "french" and "english"
- No empty fields
- Maximum 100 characters per word

## Usage

### Uploading Vocabulary
1. Click the upload area or drag and drop a CSV file
2. The app will validate your file and show any errors
3. Once uploaded, you'll see the quiz interface

### Taking Quizzes
1. **Read the French word** displayed at the top
2. **Choose the correct English translation** from 4 options
3. **Get immediate feedback** on your answer
4. **Click "Next Word"** to continue
5. **Master all words** to complete the quiz!

### Keyboard Shortcuts
- **1-4**: Select answer options
- **Enter/Space**: Go to next word (when available)

### Progress Tracking
- **Progress bar** shows completion percentage
- **Counter** displays mastered/total words
- **Progress saves automatically** to your browser

### Reset Progress
- Click the **"Reset"** button in the top-right
- Confirm in the dialog to start over
- All progress will be cleared

## File Structure

```
vocab/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Main stylesheet
│   └── components.css     # Component-specific styles
├── scripts/
│   ├── storage.js         # Local storage utilities
│   ├── csvParser.js       # CSV parsing and validation
│   ├── quizEngine.js      # Quiz logic and word selection
│   ├── ui.js             # User interface management
│   └── app.js            # Main application coordination
├── sample-vocabulary.csv  # Example vocabulary file
├── to-do.md              # Development roadmap
└── README.md             # This file
```

## Technical Details

### Browser Requirements
- Modern browser with ES6+ support
- LocalStorage enabled
- File API support (for CSV upload)

### Data Storage
- **localStorage**: Vocabulary data and progress
- **No server required**: Everything runs locally
- **Privacy-focused**: Your data stays on your device

### Architecture
- **Modular JavaScript**: Clean separation of concerns
- **Event-driven**: Responsive user interactions
- **Error handling**: Graceful error recovery
- **Accessibility**: Keyboard navigation and screen reader support

## Sample Vocabulary

A sample CSV file (`sample-vocabulary.csv`) is included with 20 common French words:

- Basic animals: chat (cat), chien (dog)
- Household items: maison (house), voiture (car), livre (book)
- Furniture: table (table), chaise (chair)
- Food and drinks: pain (bread), lait (milk), eau (water)
- And more!

## Customization

### Adding Your Own Vocabulary
1. Create a CSV file with your French words
2. Follow the format: `french,english`
3. Upload to the app
4. Start learning!

### Styling
- Modify `styles/main.css` for layout changes
- Edit `styles/components.css` for component styling
- The app supports both light and dark themes

### Features
- All JavaScript modules are well-documented
- Easy to extend with new features
- Modular architecture allows for easy modifications

## Troubleshooting

### Common Issues

**"CSV file is empty"**
- Make sure your file has content and proper headers

**"CSV must have headers: french, english"**
- Check that your first row is exactly: `french,english`

**"CSV must contain at least 4 valid vocabulary words"**
- Add more words to your CSV file

**"localStorage is not available"**
- Enable cookies in your browser
- Try a different browser

**Progress not saving**
- Check if localStorage is enabled
- Clear browser cache and try again

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Development

### Running Locally
1. Clone or download the files
2. Open `index.html` in a web browser
3. No build process required!

### Code Structure
- **storage.js**: Handles localStorage operations
- **csvParser.js**: CSV file parsing and validation
- **quizEngine.js**: Quiz logic and word selection
- **ui.js**: User interface and event handling
- **app.js**: Main application coordination

### Adding Features
1. Modify the appropriate module
2. Test thoroughly
3. Update documentation

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the browser console for error messages
3. Ensure your CSV file follows the correct format

---

**Happy Learning! 🇫🇷📚** 