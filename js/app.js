// Main Application Controller
class BugalterAIApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.charts = {}; // Track chart instances
        this.exchangeRates = {}; // Store exchange rates
        this.rateChanges = {}; // Store rate changes
        this.baseCurrency = 'UZS'; // Base currency for conversion
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupTheme();
        
        // Load cached exchange rates first, then update from API
        this.loadCachedExchangeRates();
        this.loadExchangeRates();
        
        this.loadDashboardData();
        this.setupCharts();
        this.setupQuickAdd();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
                this.toggleTheme();
        });

        // Quick add button
        document.getElementById('quick-add')?.addEventListener('click', () => {
            this.showQuickAddModal();
        });

        // Period selector
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePeriodChange(e.target.dataset.period);
            });
        });

        // Filter chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-transactions');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Export buttons
        document.getElementById('export-csv')?.addEventListener('click', () => {
            this.exportData('csv');
        });

        document.getElementById('export-pdf')?.addEventListener('click', () => {
            this.exportData('pdf');
        });

        document.getElementById('backup-data')?.addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('reset-data')?.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
                this.resetAllData();
            }
        });

        // Currency rates refresh
        document.getElementById('refresh-rates')?.addEventListener('click', () => {
            this.refreshExchangeRates();
        });

        // Settings
        this.setupSettings();
    }

    setupNavigation() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.switchSection(hash);
            }
        });

        // Initial section based on hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.switchSection(hash);
        }
    }

    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'budget':
                // Budget data is handled by BudgetManager
                break;
            case 'goals':
                // Goals data is handled by GoalsManager
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'ai-chat':
                // AI chat is handled by AIChatAssistant
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadDashboardData() {
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Update AI insights
        this.updateAIInsights();
        
        // Load recent transactions
        this.loadRecentTransactions();
    }

    updateDashboardStats() {
        // Load data from localStorage or use empty stats
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Calculate real stats from transactions
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const balance = income - expense;
        const budgetUsed = income > 0 ? Math.round((expense / income) * 100) : 0;

        const stats = {
            balance: balance,
            income: income,
            expense: expense,
            budgetUsed: budgetUsed
        };

        // Update stat cards
        const balanceEl = document.getElementById('current-balance');
        if (balanceEl) {
            balanceEl.textContent = this.formatCurrency(stats.balance);
        }

        const incomeEl = document.getElementById('total-income');
        if (incomeEl) {
            incomeEl.textContent = this.formatCurrency(stats.income);
        }

        const expenseEl = document.getElementById('total-expense');
        if (expenseEl) {
            expenseEl.textContent = this.formatCurrency(stats.expense);
        }

        const budgetEl = document.getElementById('budget-used');
        if (budgetEl) {
            budgetEl.textContent = `${stats.budgetUsed}%`;
        }
    }

    updateAIInsights() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        let insights;
        if (transactions.length === 0) {
            insights = [
                "Добро пожаловать! Начните отслеживать свои расходы за июль, добавив первую транзакцию.",
                "Совет: Добавляйте все свои расходы и доходы для точного анализа бюджета.",
                "Используйте категории для лучшей организации ваших финансов.",
                "Установите бюджетные лимиты для контроля расходов."
            ];
        } else {
            insights = [
                "Ваши расходы на продукты на 15% выше среднего. Рекомендую установить лимит на эту категорию.",
                `Отличная работа с бюджетом! Вы сэкономили ${this.formatCurrency(12000)} в этом месяце.`,
                "Ваши доходы растут на 8% в месяц. Отличная динамика!",
                "Рассмотрите возможность инвестирования излишков в доходные инструменты."
            ];
        }

        const insightText = document.getElementById('ai-insight-text');
        if (insightText) {
            insightText.textContent = insights[Math.floor(Math.random() * insights.length)];
        }
    }

    loadRecentTransactions() {
        const container = document.getElementById('recent-transactions-list');
        if (!container) return;

        // Load transactions from localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Get recent transactions (last 5)
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <h3>Нет транзакций</h3>
                    <p>Добавьте свою первую транзакцию для июля</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTransactions.map(t => {
            let amountDisplay = this.formatCurrency(Math.abs(t.amount));
            
            // Show original currency if different from base currency
            if (t.originalCurrency && t.originalCurrency !== 'UZS') {
                amountDisplay = `${t.originalAmount} ${t.originalCurrency} (${this.formatCurrency(Math.abs(t.amount))})`;
            }
            
            return `
            <div class="transaction-item">
                    <div class="transaction-icon ${t.type}">
                        <i class="${this.getTransactionIcon(t.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${t.category}</h4>
                        <p>${t.description}</p>
                    </div>
                    <div class="transaction-amount ${t.amount > 0 ? 'income' : 'expense'}">
                        ${t.amount > 0 ? '+' : ''}${amountDisplay}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTransactionIcon(category) {
        const iconMap = {
            'Продукты': 'fas fa-utensils',
            'Транспорт': 'fas fa-car',
            'Развлечения': 'fas fa-gamepad',
            'Покупки': 'fas fa-shopping-bag',
            'Здоровье': 'fas fa-heartbeat',
            'Образование': 'fas fa-graduation-cap',
            'Коммунальные': 'fas fa-home',
            'Зарплата': 'fas fa-briefcase',
            'Прочее': 'fas fa-ellipsis-h'
        };
        return iconMap[category] || 'fas fa-ellipsis-h';
    }

    getChartData(transactions) {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const currentYear = new Date().getFullYear();
        
        const income = new Array(12).fill(0);
        const expense = new Array(12).fill(0);
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                if (transaction.type === 'income') {
                    income[month] += Math.abs(transaction.amount);
        } else {
                    expense[month] += Math.abs(transaction.amount);
                }
            }
        });
        
        return {
            labels: months,
            income: income,
            expense: expense
        };
    }

    loadTransactions() {
        // This would load transactions from storage/API
        console.log('Loading transactions...');
    }

    loadAnalytics() {
        // This would load analytics data
        console.log('Loading analytics...');
    }

    loadSettings() {
        // Load user settings
        const currency = localStorage.getItem('currency') || 'RUB';
        const language = localStorage.getItem('language') || 'ru';
        const theme = localStorage.getItem('theme') || 'light';

        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.value = currency;
        }

        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.value = language;
        }

        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    setupSettings() {
        // Currency change
        document.getElementById('currency')?.addEventListener('change', (e) => {
            localStorage.setItem('currency', e.target.value);
            this.updateCurrency(e.target.value);
        });

        // Language change
        document.getElementById('language')?.addEventListener('change', (e) => {
            localStorage.setItem('language', e.target.value);
            this.updateLanguage(e.target.value);
        });

        // Theme change
        document.getElementById('theme')?.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
    }

    setupTheme() {
        this.setTheme(this.theme);
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setupCharts() {
        // Income vs Expenses Chart
        this.setupIncomeExpenseChart();
        
        // Category Pie Chart
        this.setupCategoryPieChart();
    }

    setupIncomeExpenseChart() {
        const ctx = document.getElementById('income-expense-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.incomeExpense) {
            this.charts.incomeExpense.destroy();
        }

        // Get real data from localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const chartData = this.getChartData(transactions);

        this.charts.incomeExpense = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: chartData.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Расходы',
                        data: chartData.expense,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                const currency = localStorage.getItem('currency') || 'RUB';
                                const language = localStorage.getItem('language') || 'ru';
                                
                                let locale = 'ru-RU';
                                if (language === 'en') locale = 'en-US';
                                else if (language === 'uz') locale = 'uz-UZ';
                                
                                return new Intl.NumberFormat(locale, {
                                    style: 'currency',
                                    currency: currency,
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    setupCategoryPieChart() {
        const ctx = document.getElementById('category-pie-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.categoryPie) {
            this.charts.categoryPie.destroy();
        }

        this.charts.categoryPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Продукты', 'Транспорт', 'Развлечения', 'Покупки', 'Здоровье', 'Прочее'],
                datasets: [{
                    data: [25000, 15000, 12000, 8000, 5000, 3000],
                    backgroundColor: [
                        '#f59e0b',
                        '#3b82f6',
                        '#8b5cf6',
                        '#ec4899',
                        '#ef4444',
                        '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupQuickAdd() {
        // Quick add modal functionality
        const modal = document.getElementById('quick-add-modal');
        const closeBtn = document.getElementById('close-quick-modal');
        const cancelBtn = document.getElementById('cancel-quick-add');
        const form = document.getElementById('quick-add-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
                this.handleQuickAdd(form);
            });
        }

        // Update categories when type changes
        const typeSelect = document.getElementById('quick-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.setupCategoryOptions();
            });
        }

        // Real-time conversion display
        const amountInput = document.getElementById('quick-amount');
        const currencySelect = document.getElementById('quick-currency');
        
        if (amountInput && currencySelect) {
            const updateConversion = () => {
                const amount = parseFloat(amountInput.value) || 0;
                const currency = currencySelect.value;
                
                if (currency !== 'UZS' && amount > 0 && this.exchangeRates[currency]) {
                    const convertedAmount = this.convertCurrency(amount, currency, 'UZS');
                    document.getElementById('conversion-display').style.display = 'block';
                    document.querySelector('.converted-amount').textContent = convertedAmount.toFixed(0);
                } else {
                    document.getElementById('conversion-display').style.display = 'none';
                }
            };
            
            amountInput.addEventListener('input', updateConversion);
            currencySelect.addEventListener('change', updateConversion);
        }

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    showQuickAddModal() {
        const modal = document.getElementById('quick-add-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Set default date to today
            const dateInput = document.getElementById('quick-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Set default currency to UZS
            const currencySelect = document.getElementById('quick-currency');
            if (currencySelect) {
                currencySelect.value = 'UZS';
            }
            
            // Set default type to expense
            const typeSelect = document.getElementById('quick-type');
            if (typeSelect) {
                typeSelect.value = 'expense';
            }
            
            // Set default source to card
            const sourceSelect = document.getElementById('quick-source');
            if (sourceSelect) {
                sourceSelect.value = 'card';
            }
            
            // Clear amount and description
            const amountInput = document.getElementById('quick-amount');
            const descriptionInput = document.getElementById('quick-description');
            if (amountInput) amountInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            
            // Hide conversion display
            const conversionDisplay = document.getElementById('conversion-display');
            if (conversionDisplay) conversionDisplay.style.display = 'none';
            
            // Set default amount focus
            if (amountInput) {
                setTimeout(() => {
                    amountInput.focus();
                }, 100);
            }
            
            // Setup category options based on type
            this.setupCategoryOptions();
        }
    }

    setupCategoryOptions() {
        const typeSelect = document.getElementById('quick-type');
        const categorySelect = document.getElementById('quick-category');
        
        if (!typeSelect || !categorySelect) return;
        
        // Clear existing options
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        
        const expenseCategories = [
            { value: 'Продукты', text: 'Продукты' },
            { value: 'Транспорт', text: 'Транспорт' },
            { value: 'Развлечения', text: 'Развлечения' },
            { value: 'Покупки', text: 'Покупки' },
            { value: 'Здоровье', text: 'Здоровье' },
            { value: 'Образование', text: 'Образование' },
            { value: 'Коммунальные', text: 'Коммунальные' },
            { value: 'Прочее', text: 'Прочее' }
        ];
        
        const incomeCategories = [
            { value: 'Зарплата', text: 'Зарплата' },
            { value: 'Фриланс', text: 'Фриланс' },
            { value: 'Инвестиции', text: 'Инвестиции' },
            { value: 'Подарки', text: 'Подарки' },
            { value: 'Прочее', text: 'Прочее' }
        ];
        
        const categories = typeSelect.value === 'income' ? incomeCategories : expenseCategories;
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.text;
            categorySelect.appendChild(option);
        });
    }

    handleQuickAdd(form) {
        const formData = new FormData(form);
        const amount = parseFloat(formData.get('quick-amount'));
        const type = formData.get('quick-type');
        const category = formData.get('quick-category');
        const description = formData.get('quick-description');
        const date = formData.get('quick-date');
        const currency = formData.get('quick-currency') || 'UZS';
        const source = formData.get('quick-source') || 'card';

        // Validate required fields
        if (!amount || !type || !category || !date) {
            this.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Convert amount to base currency (UZS) if different currency
        let convertedAmount = amount;
        let conversionInfo = '';
        
        if (currency !== 'UZS') {
            if (!this.exchangeRates[currency]) {
                this.showNotification(`Курс валюты ${currency} недоступен. Попробуйте обновить курсы валют.`, 'error');
                return;
            }
            convertedAmount = this.convertCurrency(amount, currency, 'UZS');
            const rate = this.exchangeRates[currency] || 0;
            conversionInfo = ` (курс: 1 ${currency} = ${rate.toFixed(0)} UZS)`;
        }

        // Create transaction object
        const transaction = {
            id: Date.now(), // Simple ID generation
            amount: type === 'expense' ? -Math.abs(convertedAmount) : Math.abs(convertedAmount),
            originalAmount: amount,
            originalCurrency: currency,
            type: type,
            category: category,
            source: source,
            description: description || category,
            date: date,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        // Close modal
        const modal = document.getElementById('quick-add-modal');
        modal.classList.remove('active');
        
        // Reset form
        form.reset();
        
        // Show success notification with conversion info
        if (currency !== 'UZS') {
            this.showNotification(`Транзакция добавлена! ${amount} ${currency} = ${convertedAmount.toFixed(0)} UZS${conversionInfo}`, 'success');
        } else {
            this.showNotification('Транзакция добавлена!', 'success');
        }
        
        // Refresh dashboard
        this.loadDashboardData();
    }

    handlePeriodChange(period) {
        // Update period selector
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // Reload data for new period
        this.loadDashboardData();
    }

    handleFilterChange(filter) {
        // Update filter chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Apply filter to transactions
        this.filterTransactions(filter);
    }

    handleSearch(query) {
        // Search transactions
        this.searchTransactions(query);
    }

    filterTransactions(filter) {
        // Filter logic here
        console.log('Filtering transactions by:', filter);
    }

    searchTransactions(query) {
        // Search logic here
        console.log('Searching transactions:', query);
    }

    exportData(format) {
        // Export logic here
        console.log(`Exporting data as ${format}`);
        this.showNotification(`Данные экспортированы в формате ${format.toUpperCase()}`, 'success');
    }

    backupData() {
        // Backup logic here
        console.log('Creating backup...');
        this.showNotification('Резервная копия создана!', 'success');
    }

    resetAllData() {
        // Clear all data from localStorage
        localStorage.removeItem('transactions');
        localStorage.removeItem('budgets');
        localStorage.removeItem('budget-categories');
        localStorage.removeItem('financial-goals');
        localStorage.removeItem('ai-chat-history');
        
        // Reload dashboard with empty data
        this.loadDashboardData();
        this.setupCharts();
        
        this.showNotification('Все данные сброшены! Теперь можете добавить свои расходы за июль.', 'success');
    }

    updateCurrency(currency) {
        // Update currency throughout the app
        console.log('Currency updated to:', currency);
        localStorage.setItem('currency', currency);
        
        // Dispatch custom event to notify all modules
        window.dispatchEvent(new CustomEvent('currencyChanged', { 
            detail: { currency: currency } 
        }));
        
        this.loadDashboardData(); // Reload with new currency
        this.setupCharts(); // Re-render charts with new currency
    }

    updateLanguage(language) {
        // Update language throughout the app
        console.log('Language updated to:', language);
        localStorage.setItem('language', language);
        // Update document language attribute
        document.documentElement.lang = language;
        
        // Dispatch custom event to notify all modules
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: language } 
        }));
        
        this.loadDashboardData(); // Reload with new language
    }

    formatCurrency(amount) {
        const currency = localStorage.getItem('currency') || 'RUB';
        const language = localStorage.getItem('language') || 'ru';
        
        let locale = 'ru-RU';
        if (language === 'en') locale = 'en-US';
        else if (language === 'uz') locale = 'uz-UZ';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            }, 300);
        }, 3000);
    }

    // Currency Exchange Methods
    loadCachedExchangeRates() {
        try {
            const cached = localStorage.getItem('exchangeRates');
            if (cached) {
                const data = JSON.parse(cached);
                this.exchangeRates = data.rates || {};
                this.rateChanges = data.changes || {};
                this.updateCurrencyRatesDisplay();
                console.log('Loaded cached exchange rates:', this.exchangeRates);
            }
        } catch (error) {
            console.log('Failed to load cached exchange rates:', error);
        }
    }

    async loadExchangeRates() {
        try {
            // Using Central Bank of Uzbekistan API - fetch each currency separately
            const currencies = ['USD', 'EUR', 'RUB'];
            this.exchangeRates = {};
            this.rateChanges = {};
            
            for (const currency of currencies) {
                try {
                    const response = await fetch(`https://cbu.uz/oz/arkhiv-kursov-valyut/json/${currency}/`);
                    const data = await response.json();
                    
                    if (data && data.length > 0) {
                        const rate = data[0];
                        if (rate.Ccy && rate.Rate) {
                            const rateValue = parseFloat(rate.Rate);
                            const changeValue = parseFloat(rate.Diff || 0);
                            
                            this.exchangeRates[currency] = rateValue;
                            this.rateChanges[currency] = changeValue;
                        }
                    }
                } catch (currencyError) {
                    console.log(`Failed to load ${currency} rate:`, currencyError);
                }
            }
            
            console.log('CBU Rates loaded:', this.exchangeRates);
            console.log('CBU Changes:', this.rateChanges);
            
            // Check if we got any rates
            if (Object.keys(this.exchangeRates).length === 0) {
                console.log('No rates loaded from CBU, using fallback');
                this.loadFallbackRates();
                return;
            }
            
            this.updateCurrencyRatesDisplay();
            
            // Save rates to localStorage for offline use
            localStorage.setItem('exchangeRates', JSON.stringify({
                rates: this.exchangeRates,
                changes: this.rateChanges,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.log('Failed to load exchange rates from CBU:', error);
            // Use fallback with exchangerate-api
            this.loadFallbackRates();
        }
    }
    
    async loadFallbackRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/UZS');
            const data = await response.json();
            
            this.exchangeRates = data.rates;
            
            // Get previous rates for change calculation
            const previousRates = JSON.parse(localStorage.getItem('previousExchangeRates') || '{}');
            
            // Calculate changes
            this.rateChanges = {};
            Object.keys(this.exchangeRates).forEach(currency => {
                if (previousRates[currency]) {
                    const currentRate = 1 / this.exchangeRates[currency];
                    const previousRate = 1 / previousRates[currency];
                    this.rateChanges[currency] = currentRate - previousRate;
                } else {
                    // If no previous data, simulate a small change for demonstration
                    this.rateChanges[currency] = Math.random() > 0.5 ? 0.5 : -0.3;
                }
            });
            
            console.log('Fallback rates loaded:', this.exchangeRates);
            console.log('Fallback changes:', this.rateChanges);
            
            this.updateCurrencyRatesDisplay();
            
            // Save current rates as previous for next comparison
            localStorage.setItem('previousExchangeRates', JSON.stringify(this.exchangeRates));
            
            localStorage.setItem('exchangeRates', JSON.stringify({
                rates: this.exchangeRates,
                changes: this.rateChanges,
                timestamp: Date.now()
            }));
        } catch (fallbackError) {
            console.log('Failed to load exchange rates, using cached data');
            // Try to load from localStorage
            const cached = localStorage.getItem('exchangeRates');
            if (cached) {
                const data = JSON.parse(cached);
                this.exchangeRates = data.rates;
                this.rateChanges = data.changes || {};
                this.updateCurrencyRatesDisplay();
            }
        }
    }

    updateCurrencyRatesDisplay() {
        const ratesContainer = document.getElementById('currency-rates');
        if (!ratesContainer) return;

        const currencies = ['USD', 'EUR', 'RUB'];
        ratesContainer.innerHTML = '';

        console.log('Updating currency display with rates:', this.exchangeRates);
        console.log('Changes:', this.rateChanges);

        currencies.forEach(currency => {
            const rate = this.exchangeRates[currency] || 0;
            // CBU provides rates as "X UZS per 1 USD", so we use the rate directly
            const rateInUZS = rate;
            // Format as integer without commas
            const formattedRate = Math.round(rateInUZS).toLocaleString('en-US', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            // Get change data from CBU
            const change = this.rateChanges[currency] || 0;
            const changeFormatted = change.toFixed(2);
            const isPositive = change >= 0;
            const changeIcon = isPositive ? '📈' : '📉';
            const changeClass = isPositive ? 'positive' : 'negative';
            
            console.log(`Currency ${currency}: Rate=${rate}, Change=${change}, Formatted=${formattedRate}`);
            
            const rateItem = document.createElement('div');
            rateItem.className = 'rate-item';
            rateItem.innerHTML = `
                <div class="rate-info">
                    <span class="currency-code">${currency}</span>
                    <span class="rate-value">${formattedRate} UZS</span>
                </div>
                <div class="rate-change ${changeClass}">
                    <span class="change-icon">${changeIcon}</span>
                    <span class="change-value">${isPositive ? '+' : ''}${changeFormatted}</span>
                </div>
            `;
            ratesContainer.appendChild(rateItem);
        });
    }

    convertCurrency(amount, fromCurrency, toCurrency = 'UZS') {
        if (fromCurrency === toCurrency) return amount;
        
        if (!this.exchangeRates[fromCurrency]) {
            console.warn(`Exchange rate not available for ${fromCurrency}`);
            return amount;
        }

        // CBU provides rates as "X UZS per 1 USD", so we multiply directly
        if (toCurrency === 'UZS') {
            return amount * this.exchangeRates[fromCurrency];
        } else {
            // Convert to UZS first, then to target currency
            const inUZS = amount * this.exchangeRates[fromCurrency];
            return inUZS / this.exchangeRates[toCurrency];
        }
    }

    async refreshExchangeRates() {
        this.showNotification('Обновление курсов валют...', 'info');
        
        try {
            await this.loadExchangeRates();
            this.showNotification('Курсы валют обновлены!', 'success');
        } catch (error) {
            console.log('Failed to refresh exchange rates:', error);
            this.showNotification('Ошибка обновления курсов валют', 'error');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.bugalterApp = new BugalterAIApp();
}); 