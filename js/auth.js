// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkStoredAuth();
    }

    setupEventListeners() {
        // Login form handling
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Signup form handling
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
        }

        // Social login buttons (if implemented)
        document.querySelectorAll('.social-login-btn').forEach(btn => {
            btn.addEventListener('click', this.handleSocialLogin.bind(this));
        });

        // Forgot password (if implemented)
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', this.handleForgotPassword.bind(this));
        }

        // Update password (if in settings)
        const updatePasswordForm = document.getElementById('updatePasswordForm');
        if (updatePasswordForm) {
            updatePasswordForm.addEventListener('submit', this.handleUpdatePassword.bind(this));
        }

        // Auto-save form fields
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.addEventListener('input', this.autoSaveForm.bind(this));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email') || document.getElementById('loginEmail').value,
            password: formData.get('password') || document.getElementById('loginPassword').value
        };

        // Validate input
        if (!this.validateLoginForm(credentials)) {
            return;
        }

        try {
            this.showLoadingState(form);
            
            // Simulate API call (replace with actual authentication)
            const user = await this.authenticateUser(credentials);
            
            if (user) {
                this.setCurrentUser(user);
                this.showSuccess('Welcome back!');
                this.closeLoginModal();
                this.redirectAfterLogin();
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            this.hideLoadingState(form);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name') || document.getElementById('signupName').value,
            email: formData.get('email') || document.getElementById('signupEmail').value,
            password: formData.get('password') || document.getElementById('signupPassword').value,
            role: formData.get('role') || document.getElementById('signupRole').value,
            agreedToTerms: formData.get('terms') || false
        };

        // Validate input
        if (!this.validateSignupForm(userData)) {
            return;
        }

        try {
            this.showLoadingState(form);
            
            // Check if user already exists
            if (this.userExists(userData.email)) {
                this.showError('An account with this email already exists');
                return;
            }

            // Create new user
            const newUser = await this.createUser(userData);
            
            this.setCurrentUser(newUser);
            this.showSuccess('Account created successfully!');
            this.closeSignupModal();
            this.redirectAfterSignup();
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('Failed to create account. Please try again.');
        } finally {
            this.hideLoadingState(form);
        }
    }

    async handleSocialLogin(e) {
        e.preventDefault();
        
        const provider = e.target.dataset.provider;
        
        try {
            this.showLoadingState(e.target);
            
            // Simulate social login (replace with actual OAuth implementation)
            const user = await this.authenticateWithSocial(provider);
            
            if (user) {
                this.setCurrentUser(user);
                this.showSuccess('Logged in successfully!');
                this.closeLoginModal();
                this.redirectAfterLogin();
            }
        } catch (error) {
            console.error('Social login error:', error);
            this.showError(`Failed to login with ${provider}`);
        } finally {
            this.hideLoadingState(e.target);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = prompt('Enter your email address:');
        if (!email) return;

        try {
            // Simulate password reset (replace with actual implementation)
            await this.sendPasswordResetEmail(email);
            this.showSuccess('Password reset instructions sent to your email');
        } catch (error) {
            console.error('Password reset error:', error);
            this.showError('Failed to send password reset email');
        }
    }

    async handleUpdatePassword(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const passwords = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        if (!this.validatePasswordUpdate(passwords)) {
            return;
        }

        try {
            this.showLoadingState(e.target);
            
            // Verify current password (simplified)
            if (passwords.currentPassword !== this.currentUser.password) {
                this.showError('Current password is incorrect');
                return;
            }

            // Update password
            await this.updateUserPassword(this.currentUser.id, passwords.newPassword);
            
            this.showSuccess('Password updated successfully');
            e.target.reset();
            
        } catch (error) {
            console.error('Password update error:', error);
            this.showError('Failed to update password');
        } finally {
            this.hideLoadingState(e.target);
        }
    }

    // Validation methods
    validateLoginForm(credentials) {
        const errors = [];

        if (!credentials.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(credentials.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!credentials.password) {
            errors.push('Password is required');
        } else if (credentials.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    validateSignupForm(userData) {
        const errors = [];

        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (!userData.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!userData.password) {
            errors.push('Password is required');
        } else if (!this.isStrongPassword(userData.password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
        }

        if (!userData.role) {
            errors.push('Please select your role');
        }

        if (userData.agreedToTerms === false) {
            errors.push('You must agree to the terms and conditions');
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    validatePasswordUpdate(passwords) {
        const errors = [];

        if (!passwords.currentPassword) {
            errors.push('Current password is required');
        }

        if (!passwords.newPassword) {
            errors.push('New password is required');
        } else if (!this.isStrongPassword(passwords.newPassword)) {
            errors.push('New password must be at least 8 characters with uppercase, lowercase, and number');
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    // Authentication logic
    async authenticateUser(credentials) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find user (in real app, this would be API call)
        const user = this.users.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            return this.sanitizeUser(user);
        }

        return null;
    }

    async createUser(userData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            role: userData.role,
            subscription: 'free',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
                theme: 'light',
                language: 'en',
                notifications: true
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return this.sanitizeUser(newUser);
    }

    async authenticateWithSocial(provider) {
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create or find user based on social provider
        const socialUser = {
            id: 'social_' + Date.now(),
            name: 'Social User',
            email: `social_${provider}@example.com`,
            provider: provider,
            role: 'student',
            subscription: 'free',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        return this.sanitizeUser(socialUser);
    }

    // User management
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('mockTestAuth', JSON.stringify({
            user: user,
            timestamp: Date.now()
        }));
        
        this.updateUIForAuthenticatedUser();
    }

    checkStoredAuth() {
        const storedAuth = localStorage.getItem('mockTestAuth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                
                // Check if auth is still valid (24 hours)
                const authAge = Date.now() - authData.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (authAge < maxAge) {
                    this.currentUser = authData.user;
                    this.updateUIForAuthenticatedUser();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Invalid stored auth data:', error);
                this.logout();
            }
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('mockTestAuth');
        this.updateUIForAuthenticatedUser();
        this.showSuccess('Logged out successfully');
    }

    updateUIForAuthenticatedUser() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.querySelector('.user-info');

        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            
            // Update user info display
            if (userInfo) {
                userInfo.innerHTML = `
                    <span>Welcome, ${this.currentUser.name}</span>
                    <div class="user-avatar">${this.currentUser.name.charAt(0).toUpperCase()}</div>
                `;
            }

            // Redirect to dashboard if on landing page
            if (window.location.hash === '' || window.location.hash === '#landing') {
                if (window.app) {
                    window.app.showSection('dashboard');
                }
            }
        } else {
            // User is logged out
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (signupBtn) signupBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            if (userInfo) {
                userInfo.innerHTML = '';
            }
        }
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isStrongPassword(password) {
        // At least 8 characters, uppercase, lowercase, and number
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    }

    userExists(email) {
        return this.users.some(user => user.email === email);
    }

    sanitizeUser(user) {
        // Remove sensitive data before storing
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    loadUsers() {
        try {
            const stored = localStorage.getItem('mockTestUsers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('mockTestUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    async sendPasswordResetEmail(email) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Password reset email sent to: ${email}`);
    }

    async updateUserPassword(userId, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.password = newPassword;
            this.saveUsers();
        }
    }

    // UI helpers
    showLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <div class="spinner spinner-sm"></div>
                Processing...
            `;
        }
    }

    hideLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.id === 'loginBtn' ? 'Sign In' : 'Sign Up';
        }
    }

    showValidationErrors(errors) {
        const errorContainer = document.querySelector('.form-errors');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-error">
                    <div class="alert-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="8" fill="#F8D7DA"/>
                            <path d="M6 6l4 4M10 6l-4 4" stroke="#721C24" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="alert-content">
                        ${errors.map(error => `<p>${error}</p>`).join('')}
                    </div>
                </div>
            `;
            errorContainer.style.display = 'block';
        } else {
            // Fallback to toast
            this.showError(errors.join(', '));
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type) {
        if (window.app && typeof app.showToast === 'function') {
            app.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    closeSignupModal() {
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    redirectAfterLogin() {
        // Default redirect to dashboard
        if (window.app) {
            app.showSection('dashboard');
        }
    }

    redirectAfterSignup() {
        // Redirect to onboarding or dashboard
        if (window.app) {
            app.showSection('dashboard');
        }
    }

    autoSaveForm(e) {
        // Auto-save form data to prevent loss
        const form = e.target.form;
        if (form) {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            localStorage.setItem('mockTestFormData', JSON.stringify({
                formId: form.id,
                data: data,
                timestamp: Date.now()
            }));
        }
    }

    loadAutoSavedForm() {
        const saved = localStorage.getItem('mockTestFormData');
        if (saved) {
            try {
                const formData = JSON.parse(saved);
                
                // Check if form data is recent (1 hour)
                const age = Date.now() - formData.timestamp;
                const maxAge = 60 * 60 * 1000; // 1 hour
                
                if (age < maxAge) {
                    const form = document.getElementById(formData.formId);
                    if (form) {
                        Object.entries(formData.data).forEach(([key, value]) => {
                            const field = form.querySelector(`[name="${key}"]`);
                            if (field) {
                                field.value = value;
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading auto-saved form:', error);
            }
        }
    }

    clearAutoSavedForm() {
        localStorage.removeItem('mockTestFormData');
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});