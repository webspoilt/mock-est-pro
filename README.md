# MockTest Pro - AI-Powered Mock Test Platform

A comprehensive mock test platform similar to ClassPlus app with OCR capabilities, question management, test creation, and detailed analytics.

## Features

### 🎯 Core Features
- **Question Management**: Create, edit, duplicate, and organize questions by categories and difficulty
- **Mock Test Creation**: Build tests with custom duration, settings, and question selection
- **OCR PDF Processing**: Upload PDF files and automatically extract questions using OCR technology
- **Real-time Test Taking**: Conduct live tests with timer, question navigation, and instant results
- **Comprehensive Analytics**: View detailed performance reports and progress tracking
- **User Authentication**: Secure login/signup system with role-based access
- **Subscription System**: Free tier with option to upgrade to premium features

### 🔍 OCR Capabilities
- **PDF Text Extraction**: Upload PDF question papers and extract questions automatically
- **Image OCR**: Process scanned images using Tesseract.js technology
- **Smart Question Detection**: AI-powered question and option identification
- **Category Auto-Classification**: Automatic categorization based on content analysis

### 📊 Test Management
- **Flexible Test Settings**: Randomize questions, control result visibility, set time limits
- **Multiple Question Types**: Support for MCQ, true/false, and other formats
- **Question Bank Organization**: Filter by category, difficulty, and search functionality
- **Bulk Operations**: Export/import questions, bulk delete capabilities

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface based on premium design standards
- **Accessibility**: WCAG AA compliant with keyboard navigation support
- **Dark/Light Theme**: Automatic theme detection with manual toggle option

## Technology Stack

### Frontend
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Custom CSS with CSS Grid and Flexbox layouts
- **JavaScript (ES6+)**: Modern JavaScript with modules and classes
- **PDF.js**: Client-side PDF processing and text extraction
- **Tesseract.js**: OCR engine for image text recognition

### Key Libraries
- **PDF.js**: PDF rendering and text extraction
- **Tesseract.js**: OCR (Optical Character Recognition) for image processing
- **Google Fonts**: Inter font family for typography
- **SVG Icons**: Custom SVG icons for UI elements

### Storage
- **LocalStorage**: Browser-based data persistence
- **IndexedDB**: Large data storage (when needed)
- **JSON**: Data serialization format

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading external libraries)

### Installation
1. Download all project files
2. Open `index.html` in your web browser
3. Start creating questions and tests immediately!

### Quick Start Guide

#### 1. Create an Account
- Click "Get Started Free" or "Sign Up"
- Fill in your details and select your role (Student/Teacher/Institution)
- Login to access the dashboard

#### 2. Add Questions
- Navigate to "Question Bank" in the dashboard
- Click "Add Question" for manual entry
- Or click "Upload PDF (OCR)" for automatic question extraction

#### 3. Create Tests
- Go to "My Tests" section
- Click "Create New Test"
- Select questions from your question bank
- Set duration and test settings

#### 4. Take Tests
- Click "Take Test" on any created test
- Answer questions using the navigation panel
- Submit when ready or when time runs out

#### 5. View Results
- Check "Results" section for detailed analytics
- Review performance breakdown and improvement suggestions

## File Structure

```
mocktest-pro/
├── index.html                 # Main application file
├── styles/
│   ├── main.css              # Main stylesheet
│   └── components.css        # Component-specific styles
├── js/
│   ├── app.js                # Main application logic
│   ├── auth.js               # Authentication system
│   ├── questions.js          # Question management
│   ├── tests.js              # Test management
│   └── ocr.js                # OCR processing
└── README.md                 # This file
```

## Usage Examples

### Adding Questions Manually
1. Click "Add Question" button
2. Enter question text
3. Select category and difficulty
4. Add 2-4 options
5. Select the correct answer
6. Add explanation (optional)

### OCR PDF Processing
1. Click "Upload PDF (OCR)" button
2. Drag and drop or select a PDF file
3. Wait for automatic processing
4. Review extracted questions
5. Select questions to add to bank

### Creating a Test
1. Click "Create New Test"
2. Enter test name and description
3. Select subject and duration
4. Choose questions from your bank
5. Configure test settings
6. Save and share

### Taking a Test
1. Click "Take Test" on any available test
2. Read questions carefully
3. Use question grid for navigation
4. Submit when ready
5. View detailed results immediately

## Features Breakdown

### Authentication System
- **User Registration**: Sign up with email, name, and role
- **Login/Logout**: Secure session management
- **Role-based Access**: Different features for students, teachers, institutions
- **Session Persistence**: Automatic login state management

### Question Bank
- **Categories**: Mathematics, Science, English, History, Geography, General
- **Difficulty Levels**: Easy, Medium, Hard
- **Search & Filter**: Find questions quickly
- **Bulk Operations**: Export, delete multiple questions
- **Question Types**: Multiple choice, true/false, fill-in-blank

### Test Engine
- **Flexible Timing**: 1 minute to 5 hours duration
- **Randomization**: Shuffle questions and options
- **Review Mode**: Allow students to review answers
- **Immediate Results**: Show scores and explanations right after submission
- **Progress Tracking**: Monitor completion status

### Analytics & Reporting
- **Performance Metrics**: Score, accuracy, time spent
- **Progress Tracking**: Historical performance data
- **Detailed Breakdown**: Question-by-question analysis
- **Improvement Suggestions**: Personalized recommendations

### OCR Capabilities
- **PDF Processing**: Extract text from PDF documents
- **Image Recognition**: Process scanned question papers
- **Smart Parsing**: Identify questions, options, and answers
- **Auto-categorization**: Categorize questions automatically
- **Progress Tracking**: Show processing progress

## Browser Compatibility

### Fully Supported
- **Chrome 70+**: Full feature support
- **Firefox 65+**: All features working
- **Safari 12+**: Complete compatibility
- **Edge 79+**: All functionality available

### Limited Support
- **Internet Explorer**: Not supported (uses modern JavaScript features)

## Performance Optimization

### Loading Speed
- **Lazy Loading**: Components load on demand
- **Code Splitting**: JavaScript modules load independently
- **CDN Usage**: External libraries loaded from CDN
- **Image Optimization**: SVG icons for scalability

### Storage Efficiency
- **LocalStorage**: Compact data storage
- **Data Compression**: JSON serialization optimization
- **Cache Management**: Automatic cache cleanup
- **Sync Mechanisms**: Cross-tab data synchronization

## Security Features

### Data Protection
- **Client-side Only**: No server data transmission
- **Local Encryption**: Simple obfuscation of sensitive data
- **Session Management**: Secure token handling
- **Input Validation**: XSS protection

### Privacy
- **No Tracking**: Zero user tracking or analytics
- **Local Data**: All data stored locally
- **No External Calls**: No data sent to third parties
- **GDPR Compliant**: No personal data collection

## Customization Options

### Styling
- **CSS Variables**: Easy theme customization
- **Component Styles**: Modular CSS architecture
- **Responsive Breakpoints**: Mobile-first design
- **Animation Controls**: Respect user preferences

### Functionality
- **Feature Flags**: Enable/disable features
- **Configuration**: Settings for OCR, storage, etc.
- **Themes**: Light/dark mode support
- **Accessibility**: WCAG AA compliance

## API Integration Ready

The platform is designed to easily integrate with backend APIs:

### Endpoints to Connect
- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Questions**: `/api/questions`, `/api/questions/:id`
- **Tests**: `/api/tests`, `/api/tests/:id/take`
- **Results**: `/api/results`, `/api/analytics`

### Integration Steps
1. Replace localStorage with API calls
2. Add authentication headers
3. Implement error handling
4. Add loading states
5. Configure CORS settings

## Troubleshooting

### Common Issues

#### OCR Not Working
- **Check file format**: Ensure PDF or image is supported
- **File size**: Verify file is under 10MB
- **Image quality**: Ensure text is clear and readable
- **Browser compatibility**: Try different browser

#### Questions Not Saving
- **LocalStorage full**: Clear browser storage
- **JavaScript errors**: Check browser console
- **File permissions**: Ensure file access granted

#### Test Taking Issues
- **Timer not working**: Check browser allows timers
- **Navigation problems**: Ensure JavaScript enabled
- **Results not showing**: Check test submission

### Browser Console Errors
Open Developer Tools (F12) and check Console tab for detailed error messages.

## Contributing

This is a demonstration project, but improvements are welcome:

### Areas for Enhancement
- **Backend Integration**: Add API endpoints
- **Advanced OCR**: Improve question detection accuracy
- **More Question Types**: Add essay, matching, etc.
- **Advanced Analytics**: More detailed reporting
- **Mobile App**: React Native or Flutter implementation

### Code Style
- **ES6+ Features**: Use modern JavaScript
- **Modular Design**: Separate concerns
- **Documentation**: Comment complex logic
- **Consistent Naming**: Use camelCase for variables

## License

This project is for educational and demonstration purposes. Feel free to use and modify for your own projects.

## Support

For questions or issues:
1. Check this README file
2. Review code comments
3. Test in different browsers
4. Clear browser cache/storage

## Future Enhancements

### Planned Features
- **AI-powered Content Generation**: Automatic question creation
- **Advanced Analytics Dashboard**: Detailed performance insights
- **Collaboration Features**: Share questions and tests
- **Mobile Application**: Native iOS/Android apps
- **Offline Support**: Progressive Web App capabilities

### Technical Improvements
- **Backend API**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL or MongoDB for data persistence
- **Real-time Features**: WebSocket integration for live tests
- **Advanced OCR**: Integration with cloud OCR services
- **Performance**: Service Workers for caching

---

**MockTest Pro** - Empowering education through technology 🎓