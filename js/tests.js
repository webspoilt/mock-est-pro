// Tests Management Module
class TestManager {
    constructor() {
        this.tests = [];
        this.currentTest = null;
        this.testState = null;
        this.timer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTests();
    }

    setupEventListeners() {
        // Create test button
        const createTestBtn = document.getElementById('createTestBtn');
        if (createTestBtn) {
            createTestBtn.addEventListener('click', this.showCreateTestModal.bind(this));
        }

        // Test form submission
        const createTestForm = document.getElementById('createTestForm');
        if (createTestForm) {
            createTestForm.addEventListener('submit', this.handleTestSubmit.bind(this));
        }

        // Modal close buttons
        const createTestModalClose = document.getElementById('createTestModalClose');
        const cancelCreateTest = document.getElementById('cancelCreateTest');

        if (createTestModalClose) {
            createTestModalClose.addEventListener('click', this.closeCreateTestModal.bind(this));
        }

        if (cancelCreateTest) {
            cancelCreateTest.addEventListener('click', this.closeCreateTestModal.bind(this));
        }

        // Test taking navigation
        const prevQuestionBtn = document.getElementById('prevQuestionBtn');
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        const submitTestBtn = document.getElementById('submitTestBtn');

        if (prevQuestionBtn) {
            prevQuestionBtn.addEventListener('click', this.previousQuestion.bind(this));
        }

        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', this.nextQuestion.bind(this));
        }

        if (submitTestBtn) {
            submitTestBtn.addEventListener('click', this.submitTest.bind(this));
        }

        // Results modal
        const testResultsModalClose = document.getElementById('testResultsModalClose');
        const closeResultsBtn = document.getElementById('closeResultsBtn');
        const reviewTestBtn = document.getElementById('reviewTestBtn');

        if (testResultsModalClose) {
            testResultsModalClose.addEventListener('click', this.closeTestResultsModal.bind(this));
        }

        if (closeResultsBtn) {
            closeResultsBtn.addEventListener('click', this.closeTestResultsModal.bind(this));
        }

        if (reviewTestBtn) {
            reviewTestBtn.addEventListener('click', this.reviewTestAnswers.bind(this));
        }
    }

    loadTests() {
        // Load from localStorage or API
        const saved = localStorage.getItem('mockTestTests');
        if (saved) {
            this.tests = JSON.parse(saved);
        } else {
            this.addSampleTests();
        }
        
        this.renderTests();
    }

    saveTests() {
        localStorage.setItem('mockTestTests', JSON.stringify(this.tests));
    }

    renderTests() {
        const testsList = document.getElementById('testsList');
        if (!testsList) return;

        if (this.tests.length === 0) {
            testsList.innerHTML = this.renderEmptyState();
            return;
        }

        testsList.innerHTML = this.tests.map(test => 
            this.renderTestItem(test)
        ).join('');

        this.updateTestStats();
    }

    renderTestItem(test) {
        const enrollmentStatus = this.getEnrollmentStatus(test);
        const difficultyLevel = this.getDifficultyLevel(test);
        
        return `
            <div class="test-item" data-test-id="${test.id}">
                <div class="test-header">
                    <div class="test-meta">
                        <span class="category-tag">${this.getCategoryName(test.subject)}</span>
                        <span class="difficulty-tag ${difficultyLevel}">${test.duration} min</span>
                        ${enrollmentStatus !== 'available' ? `<span class="badge badge-${enrollmentStatus === 'full' ? 'warning' : 'success'}">${enrollmentStatus}</span>` : ''}
                    </div>
                    <div class="test-actions">
                        <button class="btn btn-sm btn-primary" onclick="testManager.startTest('${test.id}')" ${enrollmentStatus === 'full' ? 'disabled' : ''}>
                            ${enrollmentStatus === 'available' ? 'Take Test' : enrollmentStatus === 'full' ? 'Full' : 'Continue'}
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testManager.editTest('${test.id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testManager.duplicateTest('${test.id}')">
                            Duplicate
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testManager.shareTest('${test.id}')">
                            Share
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="testManager.deleteTest('${test.id}')">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="test-content">
                    <h3 class="test-title">${this.escapeHtml(test.name)}</h3>
                    <div class="test-description">${this.escapeHtml(test.description || 'No description provided')}</div>
                    <div class="test-stats">
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <rect x="3" y="4" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1"/>
                                <path d="M3 8h8" stroke="currentColor" stroke-width="1"/>
                            </svg>
                            ${test.questions.length} questions
                        </div>
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 0v14M0 7h14" stroke="currentColor" stroke-width="1"/>
                            </svg>
                            ${test.enrolledStudents || 0} enrolled
                        </div>
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1"/>
                                <path d="M7 2v5l3 3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                            </svg>
                            ${this.formatDate(test.createdAt)}
                        </div>
                        ${test.settings?.randomizeQuestions ? `
                            <div class="stat-item">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                                </svg>
                                Random order
                            </div>
                        ` : ''}
                    </div>
                    ${test.settings?.showResults !== 'immediate' ? `
                        <div class="test-results-setting">
                            <small>Results will be available after submission</small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="12" y="16" width="40" height="32" rx="4" stroke="#E9ECEF" stroke-width="2"/>
                        <path d="M20 24h24M20 32h16M20 40h8" stroke="#E9ECEF" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3 class="empty-state-title">No tests created yet</h3>
                <p class="empty-state-description">
                    Create your first mock test by selecting questions from your question bank.
                </p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" onclick="testManager.showCreateTestModal()">
                        Create First Test
                    </button>
                </div>
            </div>
        `;
    }

    showCreateTestModal() {
        const modal = document.getElementById('createTestModal');
        if (modal) {
            this.resetTestForm();
            this.populateQuestionSelector();
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCreateTestModal() {
        const modal = document.getElementById('createTestModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            this.resetTestForm();
        }
    }

    resetTestForm() {
        const form = document.getElementById('createTestForm');
        if (form) {
            form.reset();
        }
        
        const questionSelector = document.getElementById('questionSelector');
        if (questionSelector) {
            questionSelector.innerHTML = '';
        }
    }

    populateQuestionSelector() {
        const questionSelector = document.getElementById('questionSelector');
        if (!questionSelector || !window.questionManager) return;

        const questions = questionManager.questions;
        
        if (questions.length === 0) {
            questionSelector.innerHTML = `
                <div class="empty-state">
                    <p>No questions available. Please add some questions first.</p>
                    <button class="btn btn-sm btn-primary" onclick="questionManager.showAddQuestionModal()">
                        Add Questions
                    </button>
                </div>
            `;
            return;
        }

        questionSelector.innerHTML = questions.map(question => `
            <div class="question-select-item">
                <input type="checkbox" id="select_${question.id}" value="${question.id}">
                <label for="select_${question.id}">
                    <div class="question-preview">
                        <div class="question-text-preview">${this.escapeHtml(question.text.substring(0, 80))}${question.text.length > 80 ? '...' : ''}</div>
                        <div class="question-meta">
                            <span class="category-tag">${this.getCategoryName(question.category)}</span>
                            <span class="difficulty-tag ${question.difficulty}">${question.difficulty}</span>
                        </div>
                    </div>
                </label>
            </div>
        `).join('');
    }

    handleTestSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const testData = {
            name: document.getElementById('testName').value.trim(),
            subject: document.getElementById('testSubject').value,
            duration: parseInt(document.getElementById('testDuration').value),
            description: document.getElementById('testDescription').value.trim(),
            questions: [],
            settings: {
                randomizeQuestions: false,
                showResults: 'immediate',
                allowReview: true,
                requireAllQuestions: false,
                showCorrectAnswers: true
            }
        };

        // Validate required fields
        if (!this.validateTestData(testData)) {
            return;
        }

        // Get selected questions
        const selectedQuestionIds = this.getSelectedQuestionIds();
        if (selectedQuestionIds.length === 0) {
            this.showToast('Please select at least one question', 'error');
            return;
        }

        testData.questions = selectedQuestionIds;

        if (this.currentTest) {
            this.updateTest(this.currentTest.id, testData);
        } else {
            this.createTest(testData);
        }
    }

    validateTestData(data) {
        const errors = [];

        if (!data.name || data.name.length < 3) {
            errors.push('Test name must be at least 3 characters');
        }

        if (!data.subject) {
            errors.push('Please select a subject');
        }

        if (!data.duration || data.duration < 1 || data.duration > 300) {
            errors.push('Duration must be between 1 and 300 minutes');
        }

        if (errors.length > 0) {
            this.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    getSelectedQuestionIds() {
        const checkboxes = document.querySelectorAll('#questionSelector input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    createTest(testData) {
        const newTest = {
            id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...testData,
            enrolledStudents: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };

        this.tests.unshift(newTest);
        this.saveTests();
        this.renderTests();
        this.closeCreateTestModal();
        this.showToast('Test created successfully!', 'success');
    }

    updateTest(testId, testData) {
        const index = this.tests.findIndex(t => t.id === testId);
        if (index === -1) return;

        this.tests[index] = {
            ...this.tests[index],
            ...testData,
            updatedAt: new Date().toISOString()
        };

        this.saveTests();
        this.renderTests();
        this.closeCreateTestModal();
        this.showToast('Test updated successfully!', 'success');
    }

    editTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        const modal = document.getElementById('createTestModal');
        if (modal) {
            this.populateTestForm(test);
            this.currentTest = test;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    populateTestForm(test) {
        document.getElementById('testName').value = test.name;
        document.getElementById('testSubject').value = test.subject;
        document.getElementById('testDuration').value = test.duration;
        document.getElementById('testDescription').value = test.description || '';

        // Populate question selector
        this.populateQuestionSelector();
        
        // Select existing questions
        test.questions.forEach(questionId => {
            const checkbox = document.getElementById(`select_${questionId}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Update button text
        const submitBtn = document.querySelector('#createTestForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Test';
        }
    }

    startTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) {
            this.showToast('Test not found', 'error');
            return;
        }

        this.currentTest = this.prepareTestForTaking(test);
        this.initializeTestState();
        
        // Show test interface
        if (window.app) {
            app.showSection('test-taking');
        }
        
        this.renderTest();
        this.startTimer();
    }

    prepareTestForTaking(test) {
        // Create a copy to avoid modifying the original
        const testCopy = { ...test };
        
        // Shuffle questions if randomize is enabled
        if (testCopy.settings?.randomizeQuestions) {
            testCopy.questions = this.shuffleArray([...testCopy.questions]);
        }

        // Get full question objects
        testCopy.fullQuestions = testCopy.questions.map(questionId => {
            return window.questionManager?.questions.find(q => q.id === questionId);
        }).filter(Boolean);

        return testCopy;
    }

    initializeTestState() {
        this.testState = {
            currentQuestion: 0,
            answers: {},
            timeRemaining: this.currentTest.duration * 60, // Convert to seconds
            startTime: new Date(),
            endTime: null,
            isSubmitted: false
        };
    }

    renderTest() {
        if (!this.currentTest || !this.testState) return;

        const currentQuestion = this.currentTest.fullQuestions[this.testState.currentQuestion];
        
        // Update header
        document.getElementById('testTitle').textContent = this.currentTest.name;
        document.getElementById('testSubject').textContent = this.getCategoryName(this.currentTest.subject);
        document.getElementById('testDifficulty').textContent = `${this.currentTest.duration} minutes`;
        
        // Update question info
        document.getElementById('currentQuestionNumber').textContent = this.testState.currentQuestion + 1;
        document.getElementById('totalQuestionCount').textContent = this.currentTest.fullQuestions.length;
        
        // Update question content
        document.getElementById('questionText').textContent = currentQuestion.text;
        
        // Render options
        const optionsHtml = currentQuestion.options.map((option, index) => `
            <div class="option-container ${this.testState.answers[this.testState.currentQuestion] === index ? 'selected' : ''}" 
                 onclick="testManager.selectOption(${index})">
                <div class="option-radio ${this.testState.answers[this.testState.currentQuestion] === index ? 'checked' : ''}"></div>
                <div class="option-text">${this.escapeHtml(option)}</div>
            </div>
        `).join('');
        
        document.getElementById('questionOptions').innerHTML = optionsHtml;
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitTestBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.testState.currentQuestion === 0;
        }
        
        if (nextBtn && submitBtn) {
            if (this.testState.currentQuestion === this.currentTest.fullQuestions.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-flex';
            } else {
                nextBtn.style.display = 'inline-flex';
                submitBtn.style.display = 'none';
            }
        }
        
        // Update question grid
        this.renderQuestionGrid();
    }

    renderQuestionGrid() {
        const gridHtml = this.currentTest.fullQuestions.map((_, index) => {
            const isAnswered = this.testState.answers[index] !== undefined;
            const isCurrent = index === this.testState.currentQuestion;
            
            return `
                <div class="question-number-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                     onclick="testManager.goToQuestion(${index})">
                    ${index + 1}
                </div>
            `;
        }).join('');
        
        document.getElementById('questionGrid').innerHTML = gridHtml;
    }

    selectOption(optionIndex) {
        if (this.testState.isSubmitted) return;
        
        this.testState.answers[this.testState.currentQuestion] = optionIndex;
        this.renderTest();
    }

    goToQuestion(questionIndex) {
        if (questionIndex < 0 || questionIndex >= this.currentTest.fullQuestions.length) return;
        
        this.testState.currentQuestion = questionIndex;
        this.renderTest();
    }

    previousQuestion() {
        if (this.testState.currentQuestion > 0) {
            this.testState.currentQuestion--;
            this.renderTest();
        }
    }

    nextQuestion() {
        if (this.testState.currentQuestion < this.currentTest.fullQuestions.length - 1) {
            this.testState.currentQuestion++;
            this.renderTest();
        }
    }

    startTimer() {
        this.stopTimer();
        
        this.timer = setInterval(() => {
            this.testState.timeRemaining--;
            this.updateTimer();
            
            if (this.testState.timeRemaining <= 0) {
                this.submitTest();
            }
        }, 1000);
        
        this.updateTimer();
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimer() {
        const minutes = Math.floor(this.testState.timeRemaining / 60);
        const seconds = this.testState.timeRemaining % 60;
        const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = timerText;
        }
        
        // Change timer color based on remaining time
        const timerContainer = document.querySelector('.test-timer');
        if (timerContainer) {
            if (this.testState.timeRemaining <= 60) {
                timerContainer.style.background = '#DC3545';
            } else if (this.testState.timeRemaining <= 300) {
                timerContainer.style.background = '#FFC107';
            } else {
                timerContainer.style.background = '#007BFF';
            }
        }
    }

    submitTest() {
        if (this.testState.isSubmitted) return;
        
        this.testState.isSubmitted = true;
        this.testState.endTime = new Date();
        this.stopTimer();
        
        // Calculate results
        const result = this.calculateResults();
        
        // Save result
        this.saveTestResult(result);
        
        // Show results
        this.showTestResults(result);
    }

    calculateResults() {
        let correct = 0;
        const answers = [];
        
        this.currentTest.fullQuestions.forEach((question, index) => {
            const userAnswer = this.testState.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correct++;
            
            answers.push({
                questionIndex: index,
                questionId: question.id,
                questionText: question.text,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                options: question.options,
                explanation: question.explanation
            });
        });

        const score = Math.round((correct / this.currentTest.fullQuestions.length) * 100);
        const timeSpent = this.calculateTimeSpent();
        
        return {
            id: 'result_' + Date.now(),
            testId: this.currentTest.id,
            testName: this.currentTest.name,
            score: score,
            correct: correct,
            totalQuestions: this.currentTest.fullQuestions.length,
            attempted: Object.keys(this.testState.answers).length,
            timeSpent: timeSpent,
            completedAt: new Date().toISOString(),
            answers: answers
        };
    }

    calculateTimeSpent() {
        const startTime = this.testState.startTime;
        const endTime = this.testState.endTime || new Date();
        const diffMs = endTime - startTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffSeconds = Math.floor((diffMs % 60000) / 1000);
        return `${diffMinutes}m ${diffSeconds}s`;
    }

    saveTestResult(result) {
        // Save to results array
        const results = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
        results.unshift(result);
        localStorage.setItem('mockTestResults', JSON.stringify(results));
        
        // Update test enrollment count
        const testIndex = this.tests.findIndex(t => t.id === this.currentTest.id);
        if (testIndex >= 0) {
            this.tests[testIndex].enrolledStudents = (this.tests[testIndex].enrolledStudents || 0) + 1;
            this.saveTests();
            this.renderTests();
        }
    }

    showTestResults(result) {
        const modal = document.getElementById('testResultsModal');
        const content = document.getElementById('testResultsContent');
        
        if (!modal || !content) return;
        
        content.innerHTML = this.renderResultsContent(result);
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    renderResultsContent(result) {
        return `
            <div class="test-results-summary">
                <div class="result-stat">
                    <div class="result-stat-number ${this.getScoreClass(result.score)}">${result.score}%</div>
                    <div class="result-stat-label">Final Score</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-number">${result.correct}/${result.totalQuestions}</div>
                    <div class="result-stat-label">Correct Answers</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-number">${result.attempted}</div>
                    <div class="result-stat-label">Attempted</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-number">${result.timeSpent}</div>
                    <div class="result-stat-label">Time Taken</div>
                </div>
            </div>
            <div class="result-message">
                <h3>${this.getResultMessage(result.score)}</h3>
                <p>${this.getResultDescription(result.score)}</p>
            </div>
            <div class="result-breakdown">
                <h4>Performance Breakdown</h4>
                <div class="performance-chart">
                    <div class="performance-bar">
                        <div class="performance-fill correct" style="width: ${(result.correct / result.totalQuestions) * 100}%"></div>
                        <div class="performance-fill incorrect" style="width: ${((result.totalQuestions - result.correct) / result.totalQuestions) * 100}%"></div>
                    </div>
                    <div class="performance-legend">
                        <span class="legend-item">
                            <span class="legend-color correct"></span>
                            Correct (${result.correct})
                        </span>
                        <span class="legend-item">
                            <span class="legend-color incorrect"></span>
                            Incorrect (${result.totalQuestions - result.correct})
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    closeTestResultsModal() {
        const modal = document.getElementById('testResultsModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        // Return to dashboard
        if (window.app) {
            app.showSection('dashboard');
        }
    }

    reviewTestAnswers() {
        // Implementation for answer review
        this.showToast('Answer review feature coming soon!', 'info');
    }

    // Utility methods
    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'average';
        return 'poor';
    }

    getResultMessage(score) {
        if (score >= 90) return 'Outstanding! 🎉';
        if (score >= 80) return 'Excellent work! 👏';
        if (score >= 70) return 'Good job! 👍';
        if (score >= 60) return 'Not bad! 📚';
        return 'Keep practicing! 💪';
    }

    getResultDescription(score) {
        if (score >= 90) return 'You have mastered this topic!';
        if (score >= 80) return 'Strong performance with minor areas to improve.';
        if (score >= 70) return 'Good understanding with room for improvement.';
        if (score >= 60) return 'Basic understanding achieved.';
        return 'More practice recommended to improve your score.';
    }

    getEnrollmentStatus(test) {
        // Determine if test is available for enrollment
        if (test.status === 'inactive') return 'inactive';
        if (test.maxEnrollments && test.enrolledStudents >= test.maxEnrollments) return 'full';
        return 'available';
    }

    getDifficultyLevel(test) {
        // Calculate overall difficulty based on questions
        const questions = window.questionManager?.questions.filter(q => test.questions.includes(q.id)) || [];
        if (questions.length === 0) return 'medium';
        
        const difficultyScores = { easy: 1, medium: 2, hard: 3 };
        const avgScore = questions.reduce((sum, q) => sum + difficultyScores[q.difficulty], 0) / questions.length;
        
        if (avgScore <= 1.5) return 'easy';
        if (avgScore <= 2.5) return 'medium';
        return 'hard';
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

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateTestStats() {
        // Update test count in dashboard
        const totalTestsEl = document.getElementById('totalTests');
        if (totalTestsEl) {
            totalTestsEl.textContent = this.tests.length;
        }
    }

    deleteTest(testId) {
        if (!confirm('Are you sure you want to delete this test?')) {
            return;
        }

        this.tests = this.tests.filter(t => t.id !== testId);
        this.saveTests();
        this.renderTests();
        this.showToast('Test deleted successfully!', 'success');
    }

    duplicateTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        const duplicatedTest = {
            ...test,
            id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: test.name + ' (Copy)',
            enrolledStudents: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tests.unshift(duplicatedTest);
        this.saveTests();
        this.renderTests();
        this.showToast('Test duplicated successfully!', 'success');
    }

    shareTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        // Generate shareable link (in real app, this would be a proper URL)
        const shareUrl = `${window.location.origin}/test/${testId}`;
        
        if (navigator.share) {
            navigator.share({
                title: test.name,
                text: `Take the "${test.name}" mock test`,
                url: shareUrl
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showToast('Share link copied to clipboard!', 'success');
            });
        }
    }

    showToast(message, type) {
        if (window.app && typeof app.showToast === 'function') {
            app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Sample data for initial setup
    addSampleTests() {
        this.tests = [
            {
                id: 't_sample_1',
                name: 'Mathematics Basics Quiz',
                subject: 'mathematics',
                description: 'Test your knowledge of basic mathematical concepts including arithmetic and algebra.',
                duration: 30,
                questions: ['q_sample_1'],
                enrolledStudents: 15,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: {
                    randomizeQuestions: false,
                    showResults: 'immediate',
                    allowReview: true,
                    requireAllQuestions: false,
                    showCorrectAnswers: true
                }
            },
            {
                id: 't_sample_2',
                name: 'Science Fundamentals',
                subject: 'science',
                description: 'Basic questions about planets, science concepts, and natural phenomena.',
                duration: 25,
                questions: ['q_sample_2'],
                enrolledStudents: 8,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: {
                    randomizeQuestions: false,
                    showResults: 'immediate',
                    allowReview: true,
                    requireAllQuestions: false,
                    showCorrectAnswers: true
                }
            }
        ];
        this.saveTests();
    }
}

// Initialize test manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.testManager = new TestManager();
});