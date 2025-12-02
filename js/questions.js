// Questions Management Module
class QuestionManager {
    constructor() {
        this.questions = [];
        this.currentEditQuestion = null;
        this.filters = {
            category: '',
            difficulty: '',
            search: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadQuestions();
    }

    setupEventListeners() {
        // Add question button
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', this.showAddQuestionModal.bind(this));
        }

        // PDF upload button
        const uploadPdfBtn = document.getElementById('uploadPdfBtn');
        if (uploadPdfBtn) {
            uploadPdfBtn.addEventListener('click', this.showPdfUploadModal.bind(this));
        }

        // Question form submission
        const addQuestionForm = document.getElementById('addQuestionForm');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', this.handleQuestionSubmit.bind(this));
        }

        // Filter controls
        const categoryFilter = document.getElementById('categoryFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.filterQuestions();
            });
        }

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.filters.difficulty = e.target.value;
                this.filterQuestions();
            });
        }

        // Search functionality (if implemented)
        const searchInput = document.getElementById('questionSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.filterQuestions();
            });
        }

        // Modal close buttons
        const addQuestionModalClose = document.getElementById('addQuestionModalClose');
        const cancelAddQuestion = document.getElementById('cancelAddQuestion');

        if (addQuestionModalClose) {
            addQuestionModalClose.addEventListener('click', this.closeAddQuestionModal.bind(this));
        }

        if (cancelAddQuestion) {
            cancelAddQuestion.addEventListener('click', this.closeAddQuestionModal.bind(this));
        }

        // Bulk operations
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkExportBtn = document.getElementById('bulkExportBtn');

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', this.bulkDeleteQuestions.bind(this));
        }

        if (bulkExportBtn) {
            bulkExportBtn.addEventListener('click', this.bulkExportQuestions.bind(this));
        }
    }

    loadQuestions() {
        // Load from localStorage or API
        const saved = localStorage.getItem('mockTestQuestions');
        if (saved) {
            this.questions = JSON.parse(saved);
        } else {
            this.addSampleQuestions();
        }
        
        this.renderQuestions();
    }

    saveQuestions() {
        localStorage.setItem('mockTestQuestions', JSON.stringify(this.questions));
    }

    renderQuestions() {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        if (this.questions.length === 0) {
            questionsList.innerHTML = this.renderEmptyState();
            return;
        }

        const filteredQuestions = this.getFilteredQuestions();
        
        questionsList.innerHTML = filteredQuestions.map(question => 
            this.renderQuestionItem(question)
        ).join('');

        // Update statistics
        this.updateQuestionStats();
    }

    renderQuestionItem(question) {
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="category-tag">${this.getCategoryName(question.category)}</span>
                        <span class="difficulty-tag ${question.difficulty}">${question.difficulty}</span>
                        ${question.source === 'extracted' ? '<span class="badge badge-info">OCR</span>' : ''}
                    </div>
                    <div class="question-actions">
                        <div class="question-checkbox-container">
                            <input type="checkbox" class="question-select-checkbox" data-question-id="${question.id}">
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="questionManager.editQuestion('${question.id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="questionManager.duplicateQuestion('${question.id}')">
                            Duplicate
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="questionManager.deleteQuestion('${question.id}')">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="question-content">
                    <h3 class="question-title">${this.escapeHtml(question.text)}</h3>
                    <div class="question-options">
                        <div class="options-grid">
                            ${question.options.map((option, index) => `
                                <div class="option-preview ${index === question.correctAnswer ? 'correct' : ''}">
                                    <span class="option-label">${String.fromCharCode(65 + index)})</span>
                                    <span class="option-text">${this.escapeHtml(option)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${question.explanation ? `
                        <div class="question-explanation">
                            <strong>Explanation:</strong> ${this.escapeHtml(question.explanation)}
                        </div>
                    ` : ''}
                </div>
                <div class="question-footer">
                    <div class="question-stats">
                        <span class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 0v14M0 7h14" stroke="currentColor" stroke-width="1"/>
                            </svg>
                            ${question.options.length} options
                        </span>
                        <span class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1"/>
                                <path d="M7 2v5l3 3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                            </svg>
                            ${this.formatDate(question.createdAt)}
                        </span>
                        <span class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 0l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" fill="currentColor"/>
                            </svg>
                            Used in ${this.getQuestionUsageCount(question.id)} tests
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="12" y="8" width="40" height="48" rx="4" stroke="#E9ECEF" stroke-width="2"/>
                        <path d="M20 20h24M20 28h20M20 36h16M20 44h12" stroke="#E9ECEF" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3 class="empty-state-title">No questions yet</h3>
                <p class="empty-state-description">
                    Start building your question bank by adding questions manually or uploading a PDF with OCR.
                </p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" onclick="questionManager.showAddQuestionModal()">
                        Add First Question
                    </button>
                    <button class="btn btn-secondary" onclick="questionManager.showPdfUploadModal()">
                        Upload PDF (OCR)
                    </button>
                </div>
            </div>
        `;
    }

    getFilteredQuestions() {
        let filtered = [...this.questions];

        if (this.filters.category) {
            filtered = filtered.filter(q => q.category === this.filters.category);
        }

        if (this.filters.difficulty) {
            filtered = filtered.filter(q => q.difficulty === this.filters.difficulty);
        }

        if (this.filters.search) {
            filtered = filtered.filter(q => 
                q.text.toLowerCase().includes(this.filters.search) ||
                q.options.some(option => option.toLowerCase().includes(this.filters.search))
            );
        }

        return filtered;
    }

    filterQuestions() {
        this.renderQuestions();
    }

    showAddQuestionModal() {
        const modal = document.getElementById('addQuestionModal');
        if (modal) {
            // Reset form
            this.resetQuestionForm();
            this.currentEditQuestion = null;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    showEditQuestionModal(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        const modal = document.getElementById('addQuestionModal');
        if (modal) {
            this.populateQuestionForm(question);
            this.currentEditQuestion = questionId;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeAddQuestionModal() {
        const modal = document.getElementById('addQuestionModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            this.resetQuestionForm();
        }
    }

    showPdfUploadModal() {
        const modal = document.getElementById('pdfUploadModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    resetQuestionForm() {
        const form = document.getElementById('addQuestionForm');
        if (form) {
            form.reset();
            
            // Clear radio buttons
            form.querySelectorAll('input[name="correctAnswer"]').forEach(radio => {
                radio.checked = false;
            });

            // Show add button text
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Add Question';
            }
        }
    }

    populateQuestionForm(question) {
        const form = document.getElementById('addQuestionForm');
        if (!form) return;

        document.getElementById('questionText').value = question.text;
        document.getElementById('questionCategory').value = question.category;
        document.getElementById('questionDifficulty').value = question.difficulty;
        document.getElementById('questionExplanation').value = question.explanation || '';

        // Populate options
        question.options.forEach((option, index) => {
            if (index < 4) {
                document.getElementById(`option${index}`).value = option;
                if (index === question.correctAnswer) {
                    document.getElementById(`correct${index}`).checked = true;
                }
            }
        });

        // Update button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Question';
        }
    }

    handleQuestionSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const questionData = {
            text: document.getElementById('questionText').value.trim(),
            category: document.getElementById('questionCategory').value,
            difficulty: document.getElementById('questionDifficulty').value,
            options: [],
            correctAnswer: parseInt(formData.get('correctAnswer')),
            explanation: document.getElementById('questionExplanation').value.trim()
        };

        // Validate required fields
        if (!this.validateQuestionData(questionData)) {
            return;
        }

        // Extract options
        for (let i = 0; i < 4; i++) {
            const option = document.getElementById(`option${i}`).value.trim();
            if (option) {
                questionData.options.push(option);
            }
        }

        if (questionData.options.length < 2) {
            this.showToast('Please provide at least 2 options', 'error');
            return;
        }

        if (questionData.correctAnswer === null || 
            questionData.correctAnswer >= questionData.options.length) {
            this.showToast('Please select the correct answer', 'error');
            return;
        }

        if (this.currentEditQuestion) {
            this.updateQuestion(this.currentEditQuestion, questionData);
        } else {
            this.addQuestion(questionData);
        }
    }

    validateQuestionData(data) {
        const errors = [];

        if (!data.text || data.text.length < 10) {
            errors.push('Question text must be at least 10 characters');
        }

        if (!data.category) {
            errors.push('Please select a category');
        }

        if (!data.difficulty) {
            errors.push('Please select difficulty level');
        }

        if (errors.length > 0) {
            this.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    addQuestion(questionData) {
        const newQuestion = {
            id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...questionData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.questions.unshift(newQuestion);
        this.saveQuestions();
        this.renderQuestions();
        this.closeAddQuestionModal();
        this.showToast('Question added successfully!', 'success');
    }

    updateQuestion(questionId, questionData) {
        const index = this.questions.findIndex(q => q.id === questionId);
        if (index === -1) return;

        this.questions[index] = {
            ...this.questions[index],
            ...questionData,
            updatedAt: new Date().toISOString()
        };

        this.saveQuestions();
        this.renderQuestions();
        this.closeAddQuestionModal();
        this.showToast('Question updated successfully!', 'success');
    }

    editQuestion(questionId) {
        this.showEditQuestionModal(questionId);
    }

    duplicateQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        const duplicatedQuestion = {
            ...question,
            id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: question.text + ' (Copy)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.questions.unshift(duplicatedQuestion);
        this.saveQuestions();
        this.renderQuestions();
        this.showToast('Question duplicated successfully!', 'success');
    }

    deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        this.questions = this.questions.filter(q => q.id !== questionId);
        this.saveQuestions();
        this.renderQuestions();
        this.showToast('Question deleted successfully!', 'success');
    }

    bulkDeleteQuestions() {
        const selectedIds = this.getSelectedQuestionIds();
        
        if (selectedIds.length === 0) {
            this.showToast('Please select questions to delete', 'warning');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) {
            return;
        }

        this.questions = this.questions.filter(q => !selectedIds.includes(q.id));
        this.saveQuestions();
        this.renderQuestions();
        this.showToast(`${selectedIds.length} questions deleted successfully!`, 'success');
    }

    bulkExportQuestions() {
        const selectedIds = this.getSelectedQuestionIds();
        const questionsToExport = selectedIds.length > 0 ? 
            this.questions.filter(q => selectedIds.includes(q.id)) : 
            this.questions;

        if (questionsToExport.length === 0) {
            this.showToast('No questions to export', 'warning');
            return;
        }

        this.exportToJSON(questionsToExport, 'questions');
    }

    exportToJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast(`Exported ${data.length} questions successfully!`, 'success');
    }

    getSelectedQuestionIds() {
        const checkboxes = document.querySelectorAll('.question-select-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.dataset.questionId);
    }

    getQuestionUsageCount(questionId) {
        // Count how many tests use this question
        const tests = JSON.parse(localStorage.getItem('mockTestTests') || '[]');
        return tests.filter(test => test.questions.includes(questionId)).length;
    }

    updateQuestionStats() {
        // Update question count in dashboard
        const totalQuestionsEl = document.getElementById('totalQuestions');
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.questions.length;
        }

        // Update category counts
        const categoryCounts = this.getCategoryCounts();
        this.updateCategoryFilterOptions(categoryCounts);
    }

    getCategoryCounts() {
        const counts = {};
        this.questions.forEach(question => {
            counts[question.category] = (counts[question.category] || 0) + 1;
        });
        return counts;
    }

    updateCategoryFilterOptions(counts) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Update option counts in filter
        const options = categoryFilter.querySelectorAll('option');
        options.forEach(option => {
            if (option.value && counts[option.value]) {
                option.textContent = `${this.getCategoryName(option.value)} (${counts[option.value]})`;
            }
        });
    }

    getCategoryName(category) {
        const categoryNames = {
            mathematics: 'Mathematics',
            science: 'Science',
            english: 'English',
            history: 'History',
            geography: 'Geography',
            general: 'General Knowledge',
            other: 'Other'
        };
        return categoryNames[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type) {
        if (window.app && typeof app.showToast === 'function') {
            app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Sample data for initial setup
    addSampleQuestions() {
        this.questions = [
            {
                id: 'q_sample_1',
                text: 'What is the square root of 144?',
                category: 'mathematics',
                difficulty: 'easy',
                options: ['10', '11', '12', '13'],
                correctAnswer: 2,
                explanation: 'The square root of 144 is 12, because 12 × 12 = 144.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'q_sample_2',
                text: 'Which of the following is the largest planet in our solar system?',
                category: 'science',
                difficulty: 'easy',
                options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 2,
                explanation: 'Jupiter is the largest planet in our solar system with a diameter of about 143,000 km.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'q_sample_3',
                text: 'Complete the sentence: "To be or ___ to be"',
                category: 'english',
                difficulty: 'medium',
                options: ['not', 'rather', 'never', 'always'],
                correctAnswer: 0,
                explanation: 'This is a famous quote from Shakespeare\'s Hamlet: "To be or not to be, that is the question."',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        this.saveQuestions();
    }
}

// Initialize question manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.questionManager = new QuestionManager();
});