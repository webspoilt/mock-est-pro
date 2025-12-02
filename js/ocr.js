// OCR and PDF Processing Module
class OCRProcessor {
    constructor() {
        this.isProcessing = false;
        this.extractedQuestions = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPDFJS();
    }

    setupEventListeners() {
        // PDF upload events
        const uploadArea = document.getElementById('uploadArea');
        const pdfFileInput = document.getElementById('pdfFileInput');
        const browseFilesBtn = document.getElementById('browseFilesBtn');
        const addQuestionsBtn = document.getElementById('addQuestionsBtn');
        const cancelOcrBtn = document.getElementById('cancelOcrBtn');

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                pdfFileInput?.click();
            });

            // Drag and drop
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        }

        if (browseFilesBtn) {
            browseFilesBtn.addEventListener('click', () => {
                pdfFileInput?.click();
            });
        }

        if (pdfFileInput) {
            pdfFileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        if (addQuestionsBtn) {
            addQuestionsBtn.addEventListener('click', this.addSelectedQuestions.bind(this));
        }

        if (cancelOcrBtn) {
            cancelOcrBtn.addEventListener('click', () => {
                app.closeModal('pdfUploadModal');
                this.resetOCR();
            });
        }
    }

    setupPDFJS() {
        // Configure PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.isProcessing = true;
        this.showProgress(0);
        this.showToast('Processing PDF file...', 'info');

        try {
            let extractedText = '';

            if (file.type === 'application/pdf') {
                extractedText = await this.extractTextFromPDF(file);
            } else {
                extractedText = await this.extractTextFromImage(file);
            }

            this.extractedQuestions = this.parseQuestionsFromText(extractedText);
            this.displayExtractedQuestions();
            this.showToast(`Successfully extracted ${this.extractedQuestions.length} questions!`, 'success');

        } catch (error) {
            console.error('Processing error:', error);
            this.showToast('Error processing file. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            this.hideProgress();
        }
    }

    validateFile(file) {
        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Please upload a PDF file or image (JPEG/PNG)', 'error');
            return false;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showToast('File size must be less than 10MB', 'error');
            return false;
        }

        return true;
    }

    async extractTextFromPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
            
            // Update progress
            const progress = (pageNum / pdf.numPages) * 50; // PDF processing is 50% of total progress
            this.showProgress(progress);
        }

        return fullText;
    }

    async extractTextFromImage(file) {
        // Show progress for image processing
        this.showProgress(20);

        // Convert image to canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve, reject) => {
            img.onload = async () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Update progress
                this.showProgress(40);

                try {
                    // Use Tesseract.js for OCR
                    const { data: { text } } = await Tesseract.recognize(
                        canvas.toDataURL(),
                        'eng',
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const progress = 40 + (m.progress * 50);
                                    this.showProgress(progress);
                                }
                            }
                        }
                    );

                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    parseQuestionsFromText(text) {
        const questions = [];
        const lines = text.split('\n').filter(line => line.trim().length > 0);

        let currentQuestion = null;
        let questionNumber = 1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect question patterns
            if (this.isQuestionLine(line)) {
                // Save previous question if exists
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }

                currentQuestion = {
                    id: `extracted_${questionNumber}_${Date.now()}`,
                    text: line,
                    category: this.inferCategoryFromText(text),
                    difficulty: 'medium',
                    options: [],
                    correctAnswer: 0,
                    explanation: '',
                    source: 'extracted'
                };
                questionNumber++;
            } else if (currentQuestion && this.isOptionLine(line)) {
                // Extract option
                const option = this.extractOptionText(line);
                if (option) {
                    currentQuestion.options.push(option);
                }
            } else if (currentQuestion && this.isAnswerLine(line)) {
                // Extract correct answer
                const answer = this.extractAnswer(line);
                if (answer !== null) {
                    currentQuestion.correctAnswer = answer;
                }
            }
        }

        // Add last question
        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        // If no questions were found, try alternative parsing
        if (questions.length === 0) {
            return this.alternativeParsing(text);
        }

        return questions.filter(q => q.text.length > 10); // Filter out very short text
    }

    isQuestionLine(line) {
        // Check for question patterns
        const questionPatterns = [
            /^\d+[\.\)]\s+/,           // "1." or "1)"
            /^Q\s*\d+[\.\:]\s+/,       // "Q1." or "Q1:"
            /^Question\s*\d+[\.\:]\s+/, // "Question 1:"
            /\?$/,                     // Ends with question mark
            /^(what|how|when|where|why|who|which|whom|whose)\b/i, // Starts with question words
            /^(true|false|yes|no)\b/i  // True/False questions
        ];

        return questionPatterns.some(pattern => pattern.test(line)) && line.length > 10;
    }

    isOptionLine(line) {
        // Check for option patterns
        const optionPatterns = [
            /^[A-D][\.\)]\s+/,         // "A." or "A)"
            /^\([A-D]\)\s+/,           // "(A)"
            /^[a-d][\.\)]\s+/          // "a." or "a)"
        ];

        return optionPatterns.some(pattern => pattern.test(line)) && line.length > 3;
    }

    isAnswerLine(line) {
        // Check for answer patterns
        return /^(answer|solution|correct|ans)[\s\:]/i.test(line);
    }

    extractOptionText(line) {
        // Remove option prefix and return clean text
        return line.replace(/^[A-Da-d][\.\)\s]+/, '').trim();
    }

    extractAnswer(line) {
        // Extract answer from various formats
        const answerPatterns = [
            /(?:answer|solution|correct|ans)[\s\:]*([A-Da-d])/i,
            /([A-Da-d])$/,
            /\b([A-Da-d])\b/
        ];

        for (const pattern of answerPatterns) {
            const match = line.match(pattern);
            if (match) {
                const letter = match[1].toUpperCase();
                return letter.charCodeAt(0) - 'A'.charCodeAt(0);
            }
        }

        return null;
    }

    inferCategoryFromText(text) {
        const textLower = text.toLowerCase();
        
        // Check for category keywords
        const categories = {
            mathematics: ['math', 'algebra', 'geometry', 'calculus', 'arithmetic', 'number', 'sum', 'equation', 'formula', 'solve', '+', '-', '×', '÷', '='],
            science: ['science', 'physics', 'chemistry', 'biology', 'planet', 'atom', 'molecule', 'reaction', 'experiment', 'hypothesis'],
            english: ['english', 'grammar', 'literature', 'poem', 'novel', 'essay', 'paragraph', 'sentence', 'verb', 'noun', 'adjective'],
            history: ['history', 'historical', 'war', 'revolution', 'ancient', 'medieval', 'century', 'year', 'date', 'empire', 'king', 'queen'],
            geography: ['geography', 'country', 'capital', 'continent', 'ocean', 'mountain', 'river', 'climate', 'population', 'latitude', 'longitude']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    alternativeParsing(text) {
        // Fallback parsing for text that doesn't match standard patterns
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const questions = [];

        sentences.forEach((sentence, index) => {
            const trimmed = sentence.trim();
            if (trimmed.length > 10) {
                // Check if it looks like a question or statement that could be a question
                if (this.isLikelyQuestion(trimmed)) {
                    questions.push({
                        id: `alt_${index}_${Date.now()}`,
                        text: trimmed,
                        category: this.inferCategoryFromText(text),
                        difficulty: 'medium',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 0,
                        explanation: '',
                        source: 'extracted'
                    });
                }
            }
        });

        return questions.slice(0, 10); // Limit to 10 questions
    }

    isLikelyQuestion(text) {
        // Simple heuristic to identify likely questions
        const questionIndicators = [
            'what', 'how', 'when', 'where', 'why', 'who', 'which', 'whom', 'whose',
            'define', 'explain', 'describe', 'compare', 'contrast', 'analyze',
            'true or false', 'multiple choice', 'select', 'choose'
        ];

        return questionIndicators.some(indicator => 
            text.toLowerCase().includes(indicator)
        ) || text.includes('?');
    }

    displayExtractedQuestions() {
        const extractedContainer = document.getElementById('extractedQuestions');
        const resultsContainer = document.querySelector('.ocr-results');
        
        if (!extractedContainer || !resultsContainer) return;

        if (this.extractedQuestions.length === 0) {
            extractedContainer.innerHTML = `
                <div class="empty-state">
                    <h4>No questions detected</h4>
                    <p>Could not automatically extract questions from the uploaded file. You can manually add questions instead.</p>
                </div>
            `;
        } else {
            extractedContainer.innerHTML = this.extractedQuestions.map((question, index) => `
                <div class="extracted-question">
                    <div class="question-checkbox">
                        <input type="checkbox" id="question_${index}" checked>
                        <label for="question_${index}">
                            <strong>Question ${index + 1}</strong> 
                            <span class="category-tag">${this.getCategoryName(question.category)}</span>
                        </label>
                    </div>
                    <div class="question-text-preview">
                        ${question.text.substring(0, 200)}${question.text.length > 200 ? '...' : ''}
                    </div>
                    <div class="question-options-preview">
                        <small>
                            ${question.options.length > 0 ? `${question.options.length} options detected` : 'No options detected'}
                        </small>
                    </div>
                </div>
            `).join('');
        }

        resultsContainer.classList.remove('hidden');
    }

    getCategoryName(category) {
        const categoryNames = {
            mathematics: 'Mathematics',
            science: 'Science',
            english: 'English',
            history: 'History',
            geography: 'Geography',
            general: 'General Knowledge'
        };
        return categoryNames[category] || 'General';
    }

    addSelectedQuestions() {
        const selectedQuestions = [];
        const checkboxes = document.querySelectorAll('#extractedQuestions input[type="checkbox"]:checked');
        
        checkboxes.forEach((checkbox, index) => {
            const questionIndex = parseInt(checkbox.id.split('_')[1]);
            const question = this.extractedQuestions[questionIndex];
            if (question) {
                selectedQuestions.push({
                    ...question,
                    id: `q_${Date.now()}_${index}`,
                    createdAt: new Date().toISOString()
                });
            }
        });

        if (selectedQuestions.length === 0) {
            this.showToast('Please select at least one question to add', 'warning');
            return;
        }

        // Add to app's questions array
        app.questions.push(...selectedQuestions);
        app.saveData();

        // Close modal and refresh questions list
        app.closeModal('pdfUploadModal');
        app.loadQuestions();

        this.showToast(`Successfully added ${selectedQuestions.length} questions!`, 'success');
        this.resetOCR();
    }

    showProgress(percentage) {
        const progressContainer = document.querySelector('.ocr-progress');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');

        if (progressContainer && progressFill && progressPercent) {
            progressContainer.classList.remove('hidden');
            progressFill.style.width = `${percentage}%`;
            progressPercent.textContent = `${Math.round(percentage)}%`;
        }
    }

    hideProgress() {
        const progressContainer = document.querySelector('.ocr-progress');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
    }

    resetOCR() {
        this.extractedQuestions = [];
        this.isProcessing = false;
        
        // Reset form
        const pdfFileInput = document.getElementById('pdfFileInput');
        const extractedContainer = document.getElementById('extractedQuestions');
        const resultsContainer = document.querySelector('.ocr-results');
        
        if (pdfFileInput) pdfFileInput.value = '';
        if (extractedContainer) extractedContainer.innerHTML = '';
        if (resultsContainer) resultsContainer.classList.add('hidden');
        
        this.hideProgress();
    }

    showToast(message, type = 'info') {
        if (window.app && typeof app.showToast === 'function') {
            app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize OCR processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ocrProcessor = new OCRProcessor();
});

// Additional OCR utilities
window.OCRSample = {
    // Sample questions for testing OCR functionality
    getSampleQuestions() {
        return [
            {
                id: 'sample_1',
                text: 'What is the capital of France?',
                category: 'geography',
                difficulty: 'easy',
                options: ['London', 'Paris', 'Berlin', 'Madrid'],
                correctAnswer: 1,
                explanation: 'Paris is the capital and most populous city of France.',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample_2',
                text: 'Which planet is known as the Red Planet?',
                category: 'science',
                difficulty: 'easy',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 1,
                explanation: 'Mars is called the Red Planet because of its reddish appearance.',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample_3',
                text: 'What is 15 + 27?',
                category: 'mathematics',
                difficulty: 'easy',
                options: ['40', '41', '42', '43'],
                correctAnswer: 2,
                explanation: '15 + 27 = 42',
                createdAt: new Date().toISOString()
            }
        ];
    },

    // Text processing utilities
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')           // Multiple spaces to single space
            .replace(/\n\s*\n/g, '\n')     // Multiple newlines to single newline
            .trim();
    },

    extractTextFromHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }
};