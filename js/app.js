// Main Application JavaScript
class MockTestApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'landing';
        this.questions = [];
        this.tests = [];
        this.results = [];
        this.currentTest = null;
        this.testState = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.checkAuthState();
        this.showToast('Welcome to MockTest Pro! 🎉', 'success');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Authentication
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        if (signupBtn) signupBtn.addEventListener('click', () => this.showModal('signupModal'));
        if (logoutBtn) logoutBtn.addEventListener('click', this.logout.bind(this));

        // Hero buttons
        const startCreatingBtn = document.getElementById('startCreatingBtn');
        const tryDemoBtn = document.getElementById('tryDemoBtn');

        if (startCreatingBtn) startCreatingBtn.addEventListener('click', () => {
            this.showModal('signupModal');
        });

        if (tryDemoBtn) tryDemoBtn.addEventListener('click', () => {
            this.showDemo();
        });

        // Dashboard tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginForm) loginForm.addEventListener('submit', this.handleLogin.bind(this));
        if (signupForm) signupForm.addEventListener('submit', this.handleSignup.bind(this));

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal').id);
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Form navigation
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');

        if (showSignup) showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.showModal('signupModal');
        });

        if (showLogin) showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('signupModal');
            this.showModal('loginModal');
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });

        // Test taking navigation
        const prevQuestionBtn = document.getElementById('prevQuestionBtn');
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        const submitTestBtn = document.getElementById('submitTestBtn');

        if (prevQuestionBtn) prevQuestionBtn.addEventListener('click', this.previousQuestion.bind(this));
        if (nextQuestionBtn) nextQuestionBtn.addEventListener('click', this.nextQuestion.bind(this));
        if (submitTestBtn) submitTestBtn.addEventListener('click', this.submitTest.bind(this));
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = sectionName;
            
            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.section === sectionName) {
                    link.classList.add('active');
                }
            });
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    toggleMobileMenu() {
        // Implementation for mobile menu toggle
        console.log('Mobile menu toggled');
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simple validation
        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Simulate login (in real app, this would be an API call)
        setTimeout(() => {
            this.currentUser = {
                email: email,
                name: email.split('@')[0],
                role: 'teacher',
                subscription: 'free'
            };
            
            this.saveAuthState();
            this.closeModal('loginModal');
            this.showSection('dashboard');
            this.updateDashboard();
            this.showToast('Welcome back!', 'success');
        }, 1000);
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;

        // Simple validation
        if (!name || !email || !password || !role) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Simulate signup
        setTimeout(() => {
            this.currentUser = {
                name: name,
                email: email,
                role: role,
                subscription: 'free'
            };
            
            this.saveAuthState();
            this.closeModal('signupModal');
            this.showSection('dashboard');
            this.updateDashboard();
            this.showToast('Account created successfully!', 'success');
        }, 1000);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('mockTestUser');
        localStorage.removeItem('mockTestQuestions');
        localStorage.removeItem('mockTestTests');
        localStorage.removeItem('mockTestResults');
        
        this.showSection('landing');
        this.showToast('Logged out successfully', 'success');
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('mockTestUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showSection('dashboard');
            this.updateDashboard();
        }
    }

    saveAuthState() {
        if (this.currentUser) {
            localStorage.setItem('mockTestUser', JSON.stringify(this.currentUser));
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateOverviewStats();
                this.loadRecentActivity();
                break;
            case 'questions':
                this.loadQuestions();
                break;
            case 'tests':
                this.loadTests();
                break;
            case 'results':
                this.loadResults();
                break;
        }
    }

    updateDashboard() {
        if (this.currentUser) {
            this.updateOverviewStats();
        }
    }

    updateOverviewStats() {
        document.getElementById('totalQuestions').textContent = this.questions.length;
        document.getElementById('totalTests').textContent = this.tests.length;
        document.getElementById('totalStudents').textContent = this.tests.reduce((sum, test) => sum + (test.enrolledStudents || 0), 0);
        document.getElementById('successRate').textContent = this.calculateSuccessRate() + '%';
    }

    calculateSuccessRate() {
        if (this.results.length === 0) return 0;
        const passedTests = this.results.filter(result => result.score >= 60).length;
        return Math.round((passedTests / this.results.length) * 100);
    }

    loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            {
                title: 'Created new question: "What is photosynthesis?"',
                time: '2 hours ago',
                icon: 'question'
            },
            {
                title: 'Completed test: Mathematics Quiz',
                time: '5 hours ago',
                icon: 'test'
            },
            {
                title: 'Uploaded PDF: Sample Questions',
                time: '1 day ago',
                icon: 'pdf'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        ${this.getActivityIcon(activity.icon)}
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(iconName) {
        const icons = {
            question: '<path d="M8 12l3-3 3 3-3 3-3-3z" stroke="#007BFF" stroke-width="2"/>',
            test: '<rect x="3" y="4" width="10" height="8" rx="1" stroke="#007BFF" stroke-width="2"/><path d="M3 8h10" stroke="#007BFF" stroke-width="2"/>',
            pdf: '<path d="M6 2h4l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#007BFF" stroke-width="2"/><path d="M10 2v4h4" stroke="#007BFF" stroke-width="2"/>'
        };
        return icons[iconName] || icons.question;
    }

    loadQuestions() {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        if (this.questions.length === 0) {
            // Add sample questions if none exist
            this.addSampleQuestions();
        }

        questionsList.innerHTML = this.questions.map(question => `
            <div class="question-item">
                <div class="question-header">
                    <div class="question-category">
                        <span class="category-tag">${this.getCategoryName(question.category)}</span>
                        <span class="difficulty-tag ${question.difficulty}">${question.difficulty}</span>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.editQuestion('${question.id}')">Edit</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.deleteQuestion('${question.id}')">Delete</button>
                    </div>
                </div>
                <div class="question-text-preview">${question.text.substring(0, 100)}${question.text.length > 100 ? '...' : ''}</div>
                <div class="question-meta">
                    <span class="question-options-count">${question.options.length} options</span>
                    <span class="question-created">Created ${this.formatDate(question.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    loadTests() {
        const testsList = document.getElementById('testsList');
        if (!testsList) return;

        if (this.tests.length === 0) {
            // Add sample tests if none exist
            this.addSampleTests();
        }

        testsList.innerHTML = this.tests.map(test => `
            <div class="test-item">
                <div class="test-header">
                    <div class="test-meta-info">
                        <span class="category-tag">${this.getCategoryName(test.subject)}</span>
                        <span class="difficulty-tag medium">${test.duration} min</span>
                    </div>
                    <div class="test-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.startTest('${test.id}')">Take Test</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.editTest('${test.id}')">Edit</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.deleteTest('${test.id}')">Delete</button>
                    </div>
                </div>
                <h3 class="test-title">${test.name}</h3>
                <div class="test-description">${test.description || 'No description'}</div>
                <div class="test-meta">
                    <span class="test-questions">${test.questions.length} questions</span>
                    <span class="test-enrolled">${test.enrolledStudents || 0} enrolled</span>
                </div>
            </div>
        `).join('');
    }

    loadResults() {
        const resultsList = document.getElementById('resultsList');
        if (!resultsList) return;

        if (this.results.length === 0) {
            // Add sample results if none exist
            this.addSampleResults();
        }

        resultsList.innerHTML = this.results.map(result => `
            <div class="result-item">
                <div class="test-header">
                    <h3 class="test-title">${result.testName}</h3>
                    <div class="test-score ${this.getScoreClass(result.score)}">${result.score}%</div>
                </div>
                <div class="result-details">
                    <div class="result-stat">
                        <strong>Attempted:</strong> ${result.attempted}/${result.totalQuestions}
                    </div>
                    <div class="result-stat">
                        <strong>Correct:</strong> ${result.correct}
                    </div>
                    <div class="result-stat">
                        <strong>Time:</strong> ${result.timeSpent}
                    </div>
                    <div class="result-stat">
                        <strong>Date:</strong> ${this.formatDate(result.completedAt)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        return 'poor';
    }

    getCategoryName(category) {
        const categories = {
            mathematics: 'Mathematics',
            science: 'Science',
            english: 'English',
            history: 'History',
            geography: 'Geography',
            general: 'General Knowledge',
            other: 'Other'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    showDemo() {
        // Show a demo of the test-taking interface
        this.showSection('test-taking');
        this.initializeTestDemo();
    }

    initializeTestDemo() {
        const demoQuestions = [
            {
                id: '1',
                text: 'What is the capital of France?',
                options: ['London', 'Paris', 'Berlin', 'Madrid'],
                correctAnswer: 1
            },
            {
                id: '2',
                text: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 1
            },
            {
                id: '3',
                text: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1
            }
        ];

        this.currentTest = {
            id: 'demo',
            name: 'Demo Test',
            subject: 'general',
            duration: 5,
            questions: demoQuestions
        };

        this.testState = {
            currentQuestion: 0,
            answers: {},
            timeRemaining: 300, // 5 minutes
            startTime: new Date()
        };

        this.renderTest();
        this.startTimer();
    }

    renderTest() {
        const question = this.currentTest.questions[this.testState.currentQuestion];
        
        document.getElementById('testTitle').textContent = this.currentTest.name;
        document.getElementById('testSubject').textContent = this.getCategoryName(this.currentTest.subject);
        document.getElementById('testDifficulty').textContent = `${this.currentTest.duration} minutes`;
        document.getElementById('currentQuestionNumber').textContent = this.testState.currentQuestion + 1;
        document.getElementById('totalQuestionCount').textContent = this.currentTest.questions.length;
        document.getElementById('questionText').textContent = question.text;

        const optionsHtml = question.options.map((option, index) => `
            <div class="option-container ${this.testState.answers[this.testState.currentQuestion] === index ? 'selected' : ''}" 
                 onclick="app.selectOption(${index})">
                <div class="option-radio ${this.testState.answers[this.testState.currentQuestion] === index ? 'checked' : ''}"></div>
                <div class="option-text">${option}</div>
            </div>
        `).join('');
        
        document.getElementById('questionOptions').innerHTML = optionsHtml;

        // Update navigation buttons
        document.getElementById('prevQuestionBtn').disabled = this.testState.currentQuestion === 0;
        document.getElementById('nextQuestionBtn').textContent = 
            this.testState.currentQuestion === this.currentTest.questions.length - 1 ? 'Submit' : 'Next';

        // Update question grid
        this.renderQuestionGrid();
    }

    renderQuestionGrid() {
        const gridHtml = this.currentTest.questions.map((_, index) => `
            <div class="question-number-btn ${index === this.testState.currentQuestion ? 'current' : ''} 
                 ${this.testState.answers[index] !== undefined ? 'answered' : ''}" 
                 onclick="app.goToQuestion(${index})">
                ${index + 1}
            </div>
        `).join('');
        
        document.getElementById('questionGrid').innerHTML = gridHtml;
    }

    selectOption(optionIndex) {
        this.testState.answers[this.testState.currentQuestion] = optionIndex;
        this.renderTest();
    }

    goToQuestion(questionIndex) {
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
        if (this.testState.currentQuestion < this.currentTest.questions.length - 1) {
            this.testState.currentQuestion++;
            this.renderTest();
        } else {
            this.submitTest();
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.testState.timeRemaining--;
            this.updateTimer();
            
            if (this.testState.timeRemaining <= 0) {
                this.submitTest();
            }
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.testState.timeRemaining / 60);
        const seconds = this.testState.timeRemaining % 60;
        const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timer').textContent = timerText;
        
        // Change color when time is low
        const timerElement = document.querySelector('.test-timer');
        if (this.testState.timeRemaining <= 60) {
            timerElement.style.background = '#DC3545';
        } else if (this.testState.timeRemaining <= 300) {
            timerElement.style.background = '#FFC107';
        }
    }

    submitTest() {
        clearInterval(this.timer);
        
        // Calculate score
        let correct = 0;
        const answers = [];
        
        this.currentTest.questions.forEach((question, index) => {
            const userAnswer = this.testState.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correct++;
            
            answers.push({
                questionIndex: index,
                questionId: question.id,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            });
        });

        const score = Math.round((correct / this.currentTest.questions.length) * 100);
        
        // Create result
        const result = {
            id: 'result_' + Date.now(),
            testId: this.currentTest.id,
            testName: this.currentTest.name,
            score: score,
            correct: correct,
            totalQuestions: this.currentTest.questions.length,
            attempted: Object.keys(this.testState.answers).length,
            timeSpent: this.formatTimeSpent(),
            completedAt: new Date().toISOString(),
            answers: answers
        };

        this.results.push(result);
        this.saveData();
        
        // Show results
        this.showTestResults(result);
    }

    formatTimeSpent() {
        const startTime = this.testState.startTime;
        const endTime = new Date();
        const diffMs = endTime - startTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffSeconds = Math.floor((diffMs % 60000) / 1000);
        return `${diffMinutes}m ${diffSeconds}s`;
    }

    showTestResults(result) {
        const modal = document.getElementById('testResultsModal');
        const content = document.getElementById('testResultsContent');
        
        content.innerHTML = `
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
        `;
        
        this.showModal('testResultsModal');
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

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const messageElement = document.getElementById('toastMessage');
        const iconElement = toast.querySelector('.toast-icon');
        
        messageElement.textContent = message;
        
        // Update icon based on type
        const icons = {
            success: '<circle cx="10" cy="10" r="10" fill="#28A745"/><path d="M6 10l2 2 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            error: '<circle cx="10" cy="10" r="10" fill="#DC3545"/><path d="M6 6l4 4M10 6l-4 4" stroke="white" stroke-width="2" stroke-linecap="round"/>',
            warning: '<circle cx="10" cy="10" r="10" fill="#FFC107"/><path d="M10 6v8M10 16h0" stroke="white" stroke-width="2" stroke-linecap="round"/>'
        };
        
        iconElement.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">${icons[type]}</svg>`;
        
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Sample data methods
    addSampleQuestions() {
        this.questions = [
            {
                id: 'q1',
                text: 'What is the square root of 144?',
                category: 'mathematics',
                difficulty: 'easy',
                options: ['10', '11', '12', '13'],
                correctAnswer: 2,
                explanation: 'The square root of 144 is 12, because 12 × 12 = 144.',
                createdAt: new Date().toISOString()
            },
            {
                id: 'q2',
                text: 'Which of the following is the largest planet in our solar system?',
                category: 'science',
                difficulty: 'easy',
                options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 2,
                explanation: 'Jupiter is the largest planet in our solar system.',
                createdAt: new Date().toISOString()
            },
            {
                id: 'q3',
                text: 'Complete the sentence: "To be or ___ to be"',
                category: 'english',
                difficulty: 'medium',
                options: ['not', 'rather', 'never', 'always'],
                correctAnswer: 0,
                explanation: 'This is a famous quote from Shakespeare\'s Hamlet.',
                createdAt: new Date().toISOString()
            }
        ];
        this.saveData();
    }

    addSampleTests() {
        this.tests = [
            {
                id: 't1',
                name: 'Mathematics Basics',
                subject: 'mathematics',
                description: 'Test your knowledge of basic mathematical concepts',
                duration: 30,
                questions: ['q1'],
                enrolledStudents: 15,
                createdAt: new Date().toISOString()
            },
            {
                id: 't2',
                name: 'General Science Quiz',
                subject: 'science',
                description: 'Basic questions about planets and space',
                duration: 20,
                questions: ['q2'],
                enrolledStudents: 8,
                createdAt: new Date().toISOString()
            }
        ];
        this.saveData();
    }

    addSampleResults() {
        this.results = [
            {
                id: 'r1',
                testId: 't1',
                testName: 'Mathematics Basics',
                score: 85,
                correct: 1,
                totalQuestions: 1,
                attempted: 1,
                timeSpent: '2m 15s',
                completedAt: new Date().toISOString(),
                answers: []
            }
        ];
        this.saveData();
    }

    loadData() {
        const savedQuestions = localStorage.getItem('mockTestQuestions');
        const savedTests = localStorage.getItem('mockTestTests');
        const savedResults = localStorage.getItem('mockTestResults');
        
        if (savedQuestions) this.questions = JSON.parse(savedQuestions);
        if (savedTests) this.tests = JSON.parse(savedTests);
        if (savedResults) this.results = JSON.parse(savedResults);
    }

    saveData() {
        if (this.currentUser) {
            localStorage.setItem('mockTestQuestions', JSON.stringify(this.questions));
            localStorage.setItem('mockTestTests', JSON.stringify(this.tests));
            localStorage.setItem('mockTestResults', JSON.stringify(this.results));
        }
    }

    // Question management
    editQuestion(questionId) {
        console.log('Edit question:', questionId);
        this.showToast('Edit functionality coming soon!', 'info');
    }

    deleteQuestion(questionId) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveData();
            this.loadQuestions();
            this.showToast('Question deleted successfully', 'success');
        }
    }

    // Test management
    startTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            this.currentTest = test;
            this.testState = {
                currentQuestion: 0,
                answers: {},
                timeRemaining: test.duration * 60,
                startTime: new Date()
            };
            
            this.showSection('test-taking');
            this.renderTest();
            this.startTimer();
        }
    }

    editTest(testId) {
        console.log('Edit test:', testId);
        this.showToast('Edit functionality coming soon!', 'info');
    }

    deleteTest(testId) {
        if (confirm('Are you sure you want to delete this test?')) {
            this.tests = this.tests.filter(t => t.id !== testId);
            this.saveData();
            this.loadTests();
            this.showToast('Test deleted successfully', 'success');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MockTestApp();
});
