// Bugalter AI - Authentication System with Backend Integration
class AuthSystem {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.currentUserId = null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupFormSwitching();
        this.setupAccountTypeHandling();
        this.setupVerificationInputs();
        this.checkAuthStatus();
    }
    
    bindEvents() {
        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
        
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Verification form
        const verificationForm = document.getElementById('verification-form');
        if (verificationForm) {
            verificationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVerification();
            });
        }
        
        // Password setup form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordSetup();
            });
        }
        
        // Resend code button
        const resendButton = document.getElementById('resend-code');
        if (resendButton) {
            resendButton.addEventListener('click', () => {
                this.handleResendCode();
            });
        }
    }
    
    setupFormSwitching() {
        const switchToLogin = document.getElementById('switch-to-login');
        const switchToRegister = document.getElementById('switch-to-register');
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.switchToLogin();
            });
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.switchToRegister();
            });
        }
    }
    
    setupAccountTypeHandling() {
        const accountTypeSelect = document.getElementById('account-type');
        const businessFields = document.getElementById('business-fields');
        
        if (accountTypeSelect && businessFields) {
            accountTypeSelect.addEventListener('change', () => {
                if (accountTypeSelect.value === 'business') {
                    businessFields.style.display = 'block';
                } else {
                    businessFields.style.display = 'none';
                }
            });
        }
    }
    
    setupVerificationInputs() {
        const verificationInputs = document.querySelectorAll('.verification-input');
        
        verificationInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < verificationInputs.length - 1) {
                    verificationInputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
                    verificationInputs[index - 1].focus();
                }
            });
        });
    }
    
    async handleRegistration() {
        const formData = new FormData(document.getElementById('register-form'));
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            accountType: formData.get('accountType'),
            role: formData.get('role'),
            companyName: formData.get('companyName')
        };
        
        // Validate form
        const errors = this.validateRegistrationForm(data);
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }
        
        try {
            this.showLoading('register-btn', 'Регистрация...');
            
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUserId = result.userId;
                this.showVerificationModal();
                this.showSuccess('Код подтверждения отправлен на ваш email');
            } else {
                this.showErrors([result.error]);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showErrors(['Ошибка при регистрации. Попробуйте еще раз.']);
        } finally {
            this.hideLoading('register-btn', 'Зарегистрироваться');
        }
    }
    
    async handleVerification() {
        const verificationCode = this.getVerificationCode();
        
        if (verificationCode.length !== 6) {
            this.showErrors(['Введите 6-значный код']);
            return;
        }
        
        try {
            this.showLoading('verify-btn', 'Проверка...');
            
            const response = await fetch(`${this.apiBase}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUserId,
                    code: verificationCode
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.closeVerificationModal();
                this.showPasswordSetupModal();
                this.showSuccess('Email подтвержден. Установите пароль.');
            } else {
                this.showErrors([result.error]);
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            this.showErrors(['Ошибка при подтверждении кода']);
        } finally {
            this.hideLoading('verify-btn', 'Подтвердить');
        }
    }
    
    async handlePasswordSetup() {
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
            this.showLoading('setup-password-btn', 'Установка...');
            
            const response = await fetch(`${this.apiBase}/auth/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUserId,
                    password: password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store token
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userId', this.currentUserId);
                
                this.closePasswordSetupModal();
                this.showSuccess('Регистрация завершена!');
                
                // Redirect to pricing page
                setTimeout(() => {
                    window.location.href = 'pricing-page.html';
                }, 2000);
                
            } else {
                this.showErrors([result.error]);
            }
            
        } catch (error) {
            console.error('Password setup error:', error);
            this.showErrors(['Ошибка при установке пароля']);
        } finally {
            this.hideLoading('setup-password-btn', 'Установить пароль');
        }
    }
    
    async handleLogin() {
        const formData = new FormData(document.getElementById('login-form'));
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        if (!data.email || !data.password) {
            this.showErrors(['Заполните все поля']);
            return;
        }
        
        try {
            this.showLoading('login-btn', 'Вход...');
            
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store token and user data
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userId', result.user.id);
                localStorage.setItem('userData', JSON.stringify(result.user));
                
                this.showSuccess('Вход выполнен успешно!');
                
                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } else {
                this.showErrors([result.error]);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showErrors(['Ошибка при входе']);
        } finally {
            this.hideLoading('login-btn', 'Войти');
        }
    }
    
    async handleResendCode() {
        if (!this.currentUserId) {
            this.showErrors(['Ошибка: пользователь не найден']);
            return;
        }
        
        try {
            this.showLoading('resend-code', 'Отправка...');
            
            const response = await fetch(`${this.apiBase}/auth/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUserId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('Новый код отправлен на ваш email');
            } else {
                this.showErrors([result.error]);
            }
            
        } catch (error) {
            console.error('Resend code error:', error);
            this.showErrors(['Ошибка при отправке кода']);
        } finally {
            this.hideLoading('resend-code', 'Отправить код повторно');
        }
    }
    
    validateRegistrationForm(data) {
        const errors = [];
        
        if (!data.firstName || data.firstName.length < 2) {
            errors.push('Имя должно содержать минимум 2 символа');
        }
        
        if (!data.lastName || data.lastName.length < 2) {
            errors.push('Фамилия должна содержать минимум 2 символа');
        }
        
        if (!this.validateEmail(data.email)) {
            errors.push('Введите корректный email адрес');
        }
        
        if (!this.validatePhone(data.phone)) {
            errors.push('Введите корректный номер телефона');
        }
        
        if (data.accountType === 'business') {
            if (!data.role || data.role.length < 2) {
                errors.push('Укажите должность в компании');
            }
            if (!data.companyName || data.companyName.length < 2) {
                errors.push('Укажите название компании');
            }
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
    
    getVerificationCode() {
        const inputs = document.querySelectorAll('.verification-input');
        return Array.from(inputs).map(input => input.value).join('');
    }
    
    showVerificationModal() {
        const modal = document.getElementById('verification-modal');
        if (modal) {
            modal.style.display = 'block';
            // Focus first input
            const firstInput = modal.querySelector('.verification-input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }
    
    closeVerificationModal() {
        const modal = document.getElementById('verification-modal');
        if (modal) {
            modal.style.display = 'none';
            // Clear inputs
            const inputs = modal.querySelectorAll('.verification-input');
            inputs.forEach(input => input.value = '');
        }
    }
    
    showPasswordSetupModal() {
        const modal = document.getElementById('password-setup-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    closePasswordSetupModal() {
        const modal = document.getElementById('password-setup-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    switchToLogin() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('switch-to-register').style.display = 'inline';
        document.getElementById('switch-to-login').style.display = 'none';
    }
    
    switchToRegister() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('switch-to-login').style.display = 'inline';
        document.getElementById('switch-to-register').style.display = 'none';
    }
    
    showLoading(buttonId, text) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.classList.add('loading');
            const buttonText = button.querySelector('.btn-text');
            if (buttonText) {
                buttonText.textContent = text;
            }
        }
    }
    
    hideLoading(buttonId, text) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            button.classList.remove('loading');
            const buttonText = button.querySelector('.btn-text');
            if (buttonText) {
                buttonText.textContent = text;
            }
        }
    }
    
    showErrors(errors) {
        const errorContainer = document.getElementById('error-messages');
        if (errorContainer) {
            errorContainer.innerHTML = errors.map(error => 
                `<div class="error-message">${error}</div>`
            ).join('');
            errorContainer.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }
    
    showSuccess(message) {
        const successContainer = document.getElementById('success-messages');
        if (successContainer) {
            successContainer.innerHTML = `<div class="success-message">${message}</div>`;
            successContainer.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successContainer.style.display = 'none';
            }, 5000);
        }
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            // User is already logged in, redirect to main app
            window.location.href = 'index.html';
        }
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
}); 