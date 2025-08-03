// Bugalter AI - Authentication System
class AuthSystem {
    constructor() {
        this.currentForm = 'register';
        this.verificationCode = '';
        this.userData = {};
        this.apiBaseUrl = 'http://localhost:3000/api';
        
        this.init();
    }
    
    init() {
        console.log('Initializing AuthSystem...');
        this.bindEvents();
        this.setupFormSwitching();
        this.setupAccountTypeHandling();
        this.setupVerificationInputs();
        
        // Check URL hash and show appropriate form
        const hash = window.location.hash;
        if (hash === '#login') {
            this.switchToLogin();
        } else {
            this.switchToRegister();
        }
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash;
            if (newHash === '#login') {
                this.switchToLogin();
            } else {
                this.switchToRegister();
            }
        });
        
        console.log('AuthSystem initialized successfully');
        
        // Check if forms exist
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        console.log('Forms found:', { registerForm, loginForm });
    }
    
    // API Helper Methods
    async apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Form submissions
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            console.log('Registration form found');
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Registration form submitted');
                this.handleRegistration();
            });
        } else {
            console.error('Registration form not found!');
        }
        
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin();
            });
        } else {
            console.error('Login form not found!');
        }
        
        const passwordForm = document.getElementById('password-setup-form-element');
        if (passwordForm) {
            console.log('Password setup form found');
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Password setup form submitted');
                this.setPassword();
            });
        } else {
            console.error('Password setup form not found!');
        }
        
        // Send verification code (both in form and modal)
        const sendCodeBtns = document.querySelectorAll('#send-code');
        sendCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Check if we're in modal or form
                const modal = document.getElementById('verification-modal');
                if (modal && modal.style.display === 'block') {
                    // Modal is open, use modal resend
                    this.resendCode();
                } else {
                    // Form resend
                    this.sendVerificationCode();
                }
            });
        });
        
        // Verify code from input (both in form and modal)
        const verifyCodeBtns = document.querySelectorAll('#verify-code');
        verifyCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Check if we're in modal or form
                const modal = document.getElementById('verification-modal');
                if (modal && modal.style.display === 'block') {
                    // Modal is open, use modal verification
                    this.verifyCode();
                } else {
                    // Form verification
                    this.verifyCodeFromInput();
                }
            });
        });
        
        // Resend code
        const resendCodeBtn = document.getElementById('resend-code');
        if (resendCodeBtn) {
            resendCodeBtn.addEventListener('click', () => {
                this.resendCode();
            });
        }
        
        // Close modal
        const closeModalBtn = document.getElementById('close-verification');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeVerificationModal();
            });
        }
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
        
        // Phone number formatting for login (if element exists)
        const loginPhoneInput = document.getElementById('login-phone');
        if (loginPhoneInput) {
            loginPhoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }
    
    setupFormSwitching() {
        console.log('Setting up form switching...');
        
        const showLoginBtn = document.getElementById('show-login');
        console.log('Show login button:', showLoginBtn);
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Login button clicked!');
                this.switchToLogin();
            });
        }
        
        const showRegisterBtn = document.getElementById('show-register');
        console.log('Show register button:', showRegisterBtn);
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Register button clicked!');
                this.switchToRegister();
            });
        }
    }
    
    setupAccountTypeHandling() {
        const accountTypeSelect = document.getElementById('account-type');
        const roleGroup = document.getElementById('role-group');
        const companyNameGroup = document.getElementById('company-name-group');
        
        if (accountTypeSelect) {
            accountTypeSelect.addEventListener('change', () => {
                if (accountTypeSelect.value === 'business') {
                    if (roleGroup) roleGroup.style.display = 'block';
                    if (companyNameGroup) companyNameGroup.style.display = 'block';
                    const roleInput = document.getElementById('role');
                    const companyInput = document.getElementById('company-name');
                    if (roleInput) roleInput.required = true;
                    if (companyInput) companyInput.required = true;
                } else {
                    if (roleGroup) roleGroup.style.display = 'none';
                    if (companyNameGroup) companyNameGroup.style.display = 'none';
                    const roleInput = document.getElementById('role');
                    const companyInput = document.getElementById('company-name');
                    if (roleInput) roleInput.required = false;
                    if (companyInput) companyInput.required = false;
                }
            });
        }
    }
    
    setupVerificationInputs() {
        const inputs = document.querySelectorAll('.verification-input');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Move to next input if value is entered
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                
                // Update verification code
                this.updateVerificationCode();
            });
            
            input.addEventListener('keydown', (e) => {
                // Move to previous input on backspace
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('998')) {
            value = '+' + value;
        } else if (value.startsWith('8')) {
            value = '+998' + value.substring(1);
        } else if (value.length > 0 && !value.startsWith('+')) {
            value = '+998' + value;
        }
        
        // Format: +998 XX XXX XX XX
        if (value.length > 4) {
            value = value.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        
        input.value = value;
    }
    
    validateForm(formType) {
        const errors = [];
        
        if (formType === 'register') {
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const accountType = document.getElementById('account-type').value;
            const terms = document.getElementById('terms').checked;
            
            if (!firstName) errors.push('Имя обязательно для заполнения');
            if (!lastName) errors.push('Фамилия обязательна для заполнения');
            if (!this.validatePhone(phone)) errors.push('Неверный формат номера телефона');
            if (!this.validateEmail(email)) errors.push('Неверный формат email');
            if (!accountType) errors.push('Выберите тип аккаунта');
            if (!terms) errors.push('Необходимо согласие с условиями');
            
            if (accountType === 'business') {
                const role = document.getElementById('role').value;
                const companyName = document.getElementById('company-name').value.trim();
                
                if (!role) errors.push('Выберите должность в компании');
                if (!companyName) errors.push('Введите название компании');
            }
        } else if (formType === 'login') {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!this.validateEmail(email)) errors.push('Неверный формат email');
            if (!password) errors.push('Введите пароль');
        }
        
        return errors;
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePhone(phone) {
        const phoneRegex = /^\+998\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/;
        return phoneRegex.test(phone);
    }
    
    async handleRegistration() {
        console.log('Registration started');
        
        const errors = this.validateForm('register');
        
        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            this.showErrors(errors);
            return;
        }
        
        // Collect user data
        this.userData = {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            accountType: document.getElementById('account-type').value,
            role: document.getElementById('role').value,
            companyName: document.getElementById('company-name').value.trim(),
            createdAt: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = document.querySelector('#registration-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Call backend API
            const response = await this.apiRequest('/auth/register', 'POST', {
                firstName: this.userData.firstName,
                lastName: this.userData.lastName,
                email: this.userData.email,
                phone: this.userData.phone,
                accountType: this.userData.accountType,
                role: this.userData.role,
                companyName: this.userData.companyName
            });
            
            // Store userId for verification
            this.userData.userId = response.userId;
            
            // Show verification code section
            document.getElementById('verification-code-section').style.display = 'block';
            
            // Show success message
            this.showSuccess('Регистрация успешна! Проверьте email для подтверждения.');
            
        } catch (error) {
            this.showErrors([error.message || 'Ошибка при регистрации. Попробуйте еще раз.']);
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
    
    async handleLogin() {
        const errors = this.validateForm('login');
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Show loading state
        const submitBtn = document.querySelector('#login-form-element button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Call backend API
            const response = await this.apiRequest('/auth/login', 'POST', {
                email: email,
                password: password
            });
            
            // Store user session
            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userSession', JSON.stringify({
                user: response.user,
                loggedInAt: new Date().toISOString()
            }));
            
            this.showSuccess('Вход выполнен успешно!');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            this.showErrors([error.message || 'Ошибка при входе. Попробуйте еще раз.']);
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
    
    async sendVerificationCode() {
        console.log('📧 Sending verification code...');
        const email = this.currentForm === 'register' 
            ? document.getElementById('email').value.trim()
            : document.getElementById('login-email').value.trim();
        
        console.log('📧 Email:', email);
        console.log('📧 Current form:', this.currentForm);
        
        if (!this.validateEmail(email)) {
            console.log('❌ Invalid email');
            this.showErrors(['Введите корректный email']);
            return;
        }
        
        try {
            // Call backend API
            await this.apiRequest('/auth/resend-code', 'POST', {
                userId: this.userData.userId
            });
            
            this.showSuccess('Код подтверждения отправлен на ваш email');
            
        } catch (error) {
            this.showErrors([error.message || 'Ошибка при отправке кода']);
        }
    }
    
    async verifyCode() {
        console.log('🔍 Verifying code from modal...');
        const code = this.updateVerificationCode();
        
        console.log('📝 Code length:', code.length);
        console.log('📝 Code value:', code);
        
        if (code.length !== 6) {
            console.log('❌ Invalid code length');
            this.showErrors(['Введите 6-значный код']);
            return;
        }
        
        try {
            // Call backend API
            const response = await this.apiRequest('/auth/verify', 'POST', {
                userId: this.userData.userId,
                code: code
            });
            
            this.showSuccess('Email подтвержден! Теперь установите пароль.');
            
            // Show password setup form
            this.showPasswordSetup();
            
        } catch (error) {
            this.showErrors([error.message || 'Неверный код или код истек']);
        }
    }
    
    async verifyCodeFromInput() {
        console.log('🔍 Verifying code from input...');
        const codeInput = document.getElementById('verification-code');
        const code = codeInput ? codeInput.value.trim() : '';
        
        console.log('📝 Code length:', code.length);
        console.log('📝 Code value:', code);
        
        if (code.length !== 6) {
            console.log('❌ Invalid code length');
            this.showErrors(['Введите 6-значный код']);
            return;
        }
        
        try {
            console.log('🔍 Calling API to verify code from input...');
            // Call backend API
            const response = await this.apiRequest('/auth/verify', 'POST', {
                userId: this.userData.userId,
                code: code
            });
            
            console.log('✅ Code verified successfully from input');
            this.showSuccess('Email подтвержден! Теперь установите пароль.');
            
            // Show password setup form
            this.showPasswordSetup();
            
        } catch (error) {
            console.log('❌ Error verifying code from input:', error.message);
            this.showErrors([error.message || 'Неверный код или код истек']);
        }
    }
    
    async resendCode() {
        console.log('🔄 Resending code...');
        try {
            // Call backend API
            await this.apiRequest('/auth/resend-code', 'POST', {
                userId: this.userData.userId
            });
            
            console.log('✅ Code resent successfully');
            this.showSuccess('Новый код подтверждения отправлен');
            
        } catch (error) {
            console.log('❌ Error resending code:', error.message);
            this.showErrors([error.message || 'Ошибка при отправке кода']);
        }
    }
    
    async setPassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password.length < 6) {
            this.showErrors(['Пароль должен содержать минимум 6 символов']);
            return;
        }
        
        if (password !== confirmPassword) {
            this.showErrors(['Пароли не совпадают']);
            return;
        }
        
        try {
            // Call backend API
            const response = await this.apiRequest('/auth/set-password', 'POST', {
                userId: this.userData.userId,
                password: password
            });
            
            // Store user session
            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userSession', JSON.stringify({
                user: this.userData,
                loggedInAt: new Date().toISOString()
            }));
            
            this.showSuccess('Пароль установлен! Регистрация завершена.');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            this.showErrors([error.message || 'Ошибка при установке пароля']);
        }
    }
    
    updateVerificationCode() {
        const inputs = document.querySelectorAll('.verification-input');
        this.verificationCode = Array.from(inputs).map(input => input.value).join('');
        console.log('🔢 Updated verification code:', this.verificationCode);
        return this.verificationCode;
    }
    
    switchToLogin() {
        console.log('Switching to login form...');
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        
        if (registerForm && loginForm) {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            this.currentForm = 'login';
            // Update URL hash
            window.location.hash = 'login';
            console.log('Switched to login form successfully');
        } else {
            console.error('Forms not found!', { registerForm, loginForm });
        }
    }
    
    switchToRegister() {
        console.log('Switching to register form...');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            this.currentForm = 'register';
            // Update URL hash
            window.location.hash = '';
            console.log('Switched to register form successfully');
        } else {
            console.error('Forms not found!', { loginForm, registerForm });
        }
    }
    
    showVerificationModal() {
        document.getElementById('verification-modal').style.display = 'block';
        
        // Focus first input
        setTimeout(() => {
            document.querySelector('.verification-input').focus();
        }, 100);
    }
    
    closeVerificationModal() {
        document.getElementById('verification-modal').style.display = 'none';
        
        // Clear inputs
        document.querySelectorAll('.verification-input').forEach(input => {
            input.value = '';
        });
    }
    
    showErrors(errors) {
        // Remove existing error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.style.cssText = `
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
        `;
        
        const errorList = document.createElement('ul');
        errorList.style.cssText = 'margin: 0; padding-left: 1.5rem;';
        
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        errorContainer.appendChild(errorList);
        
        // Insert at the top of the current form
        const currentForm = this.currentForm === 'register' ? 'register-form' : 'login-form';
        const form = document.getElementById(currentForm);
        form.insertBefore(errorContainer, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);
    }
    
    showSuccess(message) {
        // Remove existing success messages
        document.querySelectorAll('.success-message').forEach(el => el.remove());
        
        // Create success container
        const successContainer = document.createElement('div');
        successContainer.className = 'success-message';
        successContainer.style.cssText = `
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
        `;
        
        successContainer.textContent = message;
        
        // Insert at the top of the current form
        const currentForm = this.currentForm === 'register' ? 'register-form' : 'login-form';
        const form = document.getElementById(currentForm);
        form.insertBefore(successContainer, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successContainer.remove();
        }, 5000);
    }
    
    showPasswordSetup() {
        // Hide verification modal
        document.getElementById('verification-modal').style.display = 'none';
        
        // Show password setup form
        const passwordForm = document.getElementById('password-setup-form');
        if (passwordForm) {
            passwordForm.style.display = 'block';
        }
    }
    
    completeRegistration() {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(this.userData));
        
        // Show success and redirect
        this.showSuccess('Регистрация завершена! Перенаправление...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
}); 