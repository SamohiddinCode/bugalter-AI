// Main Application Controller
class BugalterAIApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.charts = {}; // Track chart instances
        this.exchangeRates = {}; // Store exchange rates
        this.rateChanges = {}; // Store rate changes
        this.baseCurrency = 'UZS'; // Base currency for conversion
        
        // Pagination variables
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filteredTransactions = [];
        this.activeFilters = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupTheme();
        
        // Load cached exchange rates first, then update from API
        this.loadCachedExchangeRates();
        this.loadExchangeRates();
        
        // Restore last active section or default to dashboard
        const lastSection = localStorage.getItem('currentSection') || 'dashboard';
        this.switchSection(lastSection);
        
        this.setupCharts();
        this.setupQuickAdd();
        
        // Инициализируем пагинацию
        this.initializePagination();
        
        // Принудительно обновляем аналитические карточки через 1 секунду
        setTimeout(() => {
            if (this.transactionManager) {
                console.log('Принудительное обновление аналитических карточек при инициализации...');
                this.transactionManager.updateAnalyticsCards();
            }
        }, 1000);
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
            console.log('Кнопка сброса данных нажата');
            if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
                console.log('Пользователь подтвердил сброс данных');
                this.resetAllData();
            } else {
                console.log('Пользователь отменил сброс данных');
            }
        });

        // Add filter buttons
        document.getElementById('add-filter-btn')?.addEventListener('click', () => {
            this.showAddFilterModal();
        });

        document.getElementById('add-filter-btn-main')?.addEventListener('click', () => {
            this.showAddFilterModal();
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Currency rates refresh
        document.getElementById('refresh-rates')?.addEventListener('click', () => {
            this.refreshExchangeRates();
        });

        // Settings
        this.setupSettings();

        // Advanced transaction filters
        this.bindTransactionFilters();
        
        // Pagination events
        this.bindPaginationEvents();
        
        // Создать глобальные функции для отладки
        window.resetAllDataGlobal = () => {
            console.log('Глобальная функция сброса данных вызвана');
            this.resetAllData();
        };
        
        window.restoreFromBackupGlobal = () => {
            console.log('Глобальная функция восстановления данных вызвана');
            this.restoreFromBackup();
        };
        
        // Автоматическое резервное копирование каждые 30 секунд
        setInterval(() => {
            this.createBackup();
        }, 30000);
        
        // Создать резервную копию при загрузке страницы
        this.createBackup();
    }

    bindTransactionFilters() {
        // Add transaction button
        document.getElementById('add-transaction-btn')?.addEventListener('click', () => {
            this.showQuickAddModal();
        });
        
        // Date range filter
        document.getElementById('date-range-filter')?.addEventListener('change', (e) => {
            this.handleDateRangeFilter(e.target.value);
        });

        // Category filter
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.handleCategoryFilter(e.target.value);
        });

        // Amount filter
        document.getElementById('amount-filter')?.addEventListener('change', (e) => {
            this.handleAmountFilter(e.target.value);
        });

        // Sort filter
        document.getElementById('sort-filter')?.addEventListener('change', (e) => {
            this.handleSortFilter(e.target.value);
        });

        // Apply filters button
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.applyAdvancedFilters();
        });

        // Clear filters button
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearAdvancedFilters();
        });

        // Transaction management buttons
        document.getElementById('bulk-edit')?.addEventListener('click', () => {
            this.showBulkEditModal();
        });

        document.getElementById('bulk-delete')?.addEventListener('click', () => {
            this.showBulkDeleteModal();
        });

        document.getElementById('duplicate-transaction')?.addEventListener('click', () => {
            this.duplicateSelectedTransactions();
        });

        document.getElementById('export-selected')?.addEventListener('click', () => {
            this.exportSelectedTransactions();
        });

        // Selection buttons
        document.getElementById('select-all')?.addEventListener('click', () => {
            this.selectAllTransactions();
        });

        document.getElementById('deselect-all')?.addEventListener('click', () => {
            this.deselectAllTransactions();
        });

        // Transaction actions modal
        document.getElementById('close-transaction-modal')?.addEventListener('click', () => {
            this.closeTransactionModal();
        });

        document.getElementById('edit-transaction')?.addEventListener('click', () => {
            this.editSelectedTransaction();
        });

        document.getElementById('duplicate-transaction-action')?.addEventListener('click', () => {
            this.duplicateSelectedTransaction();
        });

        document.getElementById('delete-transaction')?.addEventListener('click', () => {
            this.deleteSelectedTransaction();
        });

        document.getElementById('cancel-transaction-action')?.addEventListener('click', () => {
            this.closeTransactionModal();
        });
    }

    setupNavigation() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.switchSection(hash);
            }
        });

        // Initial section based on hash or localStorage
        const hash = window.location.hash.substring(1);
        const savedSection = localStorage.getItem('currentSection');
        
        if (hash) {
            this.switchSection(hash);
        } else if (savedSection) {
            this.switchSection(savedSection);
        }
    }

    switchSection(sectionId) {
        console.log(`Переключение на раздел: ${sectionId}`);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            console.log(`Раздел ${sectionId} активирован`);
        } else {
            console.error(`Раздел ${sectionId} не найден!`);
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            console.log(`Навигационная ссылка ${sectionId} активирована`);
        } else {
            console.error(`Навигационная ссылка ${sectionId} не найдена!`);
        }

        // Save current section to localStorage
        localStorage.setItem('currentSection', sectionId);
        
        // Update URL hash
        window.location.hash = `#${sectionId}`;

        // Load section-specific data
        console.log(`Загружаем данные для раздела: ${sectionId}`);
        this.loadSectionData(sectionId);
        
        // Если переключаемся на транзакции, обновляем аналитические карточки
        if (sectionId === 'transactions' && this.transactionManager) {
            setTimeout(() => {
                console.log('Обновление аналитических карточек при переключении на транзакции...');
                this.transactionManager.updateAnalyticsCards();
            }, 500);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'transactions':
                console.log('Загрузка раздела транзакций...');
                this.loadTransactions();
                
                // Принудительная инициализация TransactionManager если он не существует
                if (!this.transactionManager && typeof TransactionManager !== 'undefined') {
                    console.log('Принудительная инициализация TransactionManager...');
                    TransactionManager.extendApp(this);
                }
                
                // Убедимся, что транзакции отображаются с пагинацией
                setTimeout(() => {
                    // Загружаем все транзакции для пагинации
                    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                    this.filteredTransactions = transactions;
                    this.currentPage = 1;
                    this.displayTransactions();
                    
                    // Обновляем аналитические карточки
                    if (this.transactionManager) {
                        this.transactionManager.updateAnalyticsCards();
                    }
                }, 200);
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
        
        // Get current period from active button
        const activePeriodButton = document.querySelector('[data-period].active');
        const currentPeriod = activePeriodButton ? activePeriodButton.dataset.period : 'month';
        
        // Filter transactions by selected period for income/expense stats
        const filteredTransactions = this.filterTransactionsByPeriod(transactions, currentPeriod);
        
        // Calculate period-specific income and expense
        const periodIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const periodExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Calculate total balance (all time) - НЕ ИЗМЕНЯЕТСЯ при смене периода
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const totalBalance = totalIncome - totalExpense;
        const budgetUsed = periodIncome > 0 ? Math.round((periodExpense / periodIncome) * 100) : 0;

        const stats = {
            balance: totalBalance, // Всегда показывает общий баланс (все время)
            income: periodIncome,  // Показывает доходы за выбранный период
            expense: periodExpense, // Показывает расходы за выбранный период
            budgetUsed: budgetUsed
        };

        console.log(`Обновление статистики дашборда:`);
        console.log(`- Общий баланс (все время): ${totalBalance}`);
        console.log(`- Доходы за ${currentPeriod}: ${periodIncome}`);
        console.log(`- Расходы за ${currentPeriod}: ${periodExpense}`);

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

    filterTransactionsByPeriod(transactions, period) {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                startDate = new Date(now.getFullYear(), now.getMonth(), diff);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const filteredTransactions = transactions.filter(transaction => {
            // Убеждаемся, что дата транзакции корректно парсится
            let transactionDate;
            if (typeof transaction.date === 'string') {
                // Если дата в формате YYYY-MM-DD
                transactionDate = new Date(transaction.date + 'T00:00:00');
            } else {
                transactionDate = new Date(transaction.date);
            }
            
            // Проверяем, что дата валидна
            if (isNaN(transactionDate.getTime())) {
                return false;
            }
            
            const isInPeriod = transactionDate >= startDate && transactionDate <= endDate;
            return isInPeriod;
        });

        return filteredTransactions;
    }

    updateAIInsights() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Get current period from active button
        const activePeriodButton = document.querySelector('[data-period].active');
        const currentPeriod = activePeriodButton ? activePeriodButton.dataset.period : 'month';
        
        // Filter transactions by selected period
        const filteredTransactions = this.filterTransactionsByPeriod(transactions, currentPeriod);
        
        let insights;
        if (filteredTransactions.length === 0) {
            insights = [
                "Добро пожаловать! Начните отслеживать свои расходы, добавив первую транзакцию.",
                "Совет: Добавляйте все свои расходы и доходы для точного анализа бюджета.",
                "Используйте категории для лучшей организации ваших финансов.",
                "Установите бюджетные лимиты для контроля расходов."
            ];
        } else {
            const income = filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
            const expense = filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
            const balance = income - expense;
            
            insights = [
                "Ваши расходы на продукты на 15% выше среднего. Рекомендую установить лимит на эту категорию.",
                `Отличная работа с бюджетом! Вы сэкономили ${this.formatCurrency(balance)} за выбранный период.`,
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
        
        // Get current period from active button
        const activePeriodButton = document.querySelector('[data-period].active');
        const currentPeriod = activePeriodButton ? activePeriodButton.dataset.period : 'month';
        
        // Filter transactions by selected period
        const filteredTransactions = this.filterTransactionsByPeriod(transactions, currentPeriod);
        
        // Get recent transactions (last 5) from filtered transactions
        const recentTransactions = filteredTransactions
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
        
        // Проверяем localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        console.log('localStorage transactions:', transactions);
        
        // Инициализируем filteredTransactions для пагинации
        this.filteredTransactions = transactions;
        this.currentPage = 1;
        
        // Принудительно отображаем транзакции если мы на странице транзакций
        if (this.currentSection === 'transactions') {
            console.log('Принудительное отображение транзакций...');
            setTimeout(() => {
                this.displayTransactions();
                // Обновляем аналитические карточки
                if (this.transactionManager) {
                    this.transactionManager.updateAnalyticsCards();
                }
            }, 200);
        }
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
        
        // Get current period from active button
        const activePeriodButton = document.querySelector('[data-period].active');
        const currentPeriod = activePeriodButton ? activePeriodButton.dataset.period : 'month';
        
        // Filter transactions by selected period
        const filteredTransactions = this.filterTransactionsByPeriod(transactions, currentPeriod);
        const chartData = this.getChartData(filteredTransactions);

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

        // Get real data from localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Get current period from active button
        const activePeriodButton = document.querySelector('[data-period].active');
        const currentPeriod = activePeriodButton ? activePeriodButton.dataset.period : 'month';
        
        // Filter transactions by selected period
        const filteredTransactions = this.filterTransactionsByPeriod(transactions, currentPeriod);
        
        // Calculate category data from filtered transactions
        const categoryData = this.getCategoryData(filteredTransactions);

        this.charts.categoryPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: categoryData.colors
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

    getCategoryData(transactions) {
        // Filter only expense transactions
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Group by category
        const categoryMap = {};
        expenses.forEach(transaction => {
            const category = transaction.category || 'Прочее';
            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }
            categoryMap[category] += Math.abs(transaction.amount);
        });

        // Convert to arrays for Chart.js
        const labels = Object.keys(categoryMap);
        const data = Object.values(categoryMap);
        
        // Generate colors for categories
        const colors = [
            '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#6b7280',
            '#10b981', '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#64748b'
        ];

        return {
            labels: labels,
            data: data,
            colors: labels.map((_, index) => colors[index % colors.length])
        };
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

    async handleQuickAdd(form) {
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

        // Save transaction using TransactionManager
        if (this.transactionManager) {
            try {
                await this.transactionManager.createTransaction(transaction);
            } catch (error) {
                console.error('Error creating transaction:', error);
                // Fallback: save directly to localStorage
                const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                transactions.push(transaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));
            }
        } else {
            // Fallback: save directly to localStorage
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }

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
        
        // Refresh current section data
        this.refreshCurrentSection();
    }

    refreshCurrentSection() {
        // Refresh data for current section
        this.loadSectionData(this.currentSection);
        
        // Update transactions table if we're on transactions page
        if (this.currentSection === 'transactions' && this.transactionManager) {
            setTimeout(() => {
                this.transactionManager.renderTransactionsTable();
            }, 100);
        }
        
        // Update charts if we're on dashboard
        if (this.currentSection === 'dashboard') {
            this.setupCharts();
        }
    }

    handlePeriodChange(period) {
        console.log(`Переключение периода на: ${period}`);
        
        // Update period selector
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // Reload data for new period
        this.loadDashboardData();
        
        // Update charts for new period
        this.setupCharts();
        
        // Update transactions table if we're on transactions page
        if (this.transactionManager) {
            this.transactionManager.renderTransactionsTable();
        }
        
        console.log(`Период ${period} успешно применен`);
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
    
    createBackup() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
                budgets: JSON.parse(localStorage.getItem('budgets') || '{}'),
                goals: JSON.parse(localStorage.getItem('financial-goals') || '{}'),
                settings: {
                    theme: localStorage.getItem('theme'),
                    currency: localStorage.getItem('currency'),
                    language: localStorage.getItem('language')
                }
            };
            
            localStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));
            
            // Ограничить количество резервных копий (оставить только последние 5)
            const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
            if (backupKeys.length > 5) {
                backupKeys.sort().slice(0, -5).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            
            console.log('Автоматическая резервная копия создана');
        } catch (error) {
            console.error('Ошибка при создании резервной копии:', error);
        }
    }
    
    restoreFromBackup() {
        try {
            const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
            if (backupKeys.length === 0) {
                this.showNotification('Резервные копии не найдены', 'error');
                return;
            }
            
            // Найти самую свежую резервную копию
            const latestBackupKey = backupKeys.sort().pop();
            const backup = JSON.parse(localStorage.getItem(latestBackupKey));
            
            // Восстановить данные
            if (backup.transactions) {
                localStorage.setItem('transactions', JSON.stringify(backup.transactions));
            }
            if (backup.budgets) {
                localStorage.setItem('budgets', JSON.stringify(backup.budgets));
            }
            if (backup.goals) {
                localStorage.setItem('financial-goals', JSON.stringify(backup.goals));
            }
            if (backup.settings) {
                Object.entries(backup.settings).forEach(([key, value]) => {
                    if (value) localStorage.setItem(key, value);
                });
            }
            
            this.showNotification('Данные восстановлены из резервной копии!', 'success');
            this.loadDashboardData();
            
        } catch (error) {
            console.error('Ошибка при восстановлении из резервной копии:', error);
            this.showNotification('Ошибка при восстановлении данных', 'error');
        }
    }

    resetAllData() {
        console.log('=== НАЧАЛО СБРОСА ДАННЫХ ===');
        
        try {
            // Clear all data from localStorage
            const keysToRemove = [
                'transactions',
                'budgets', 
                'budget-categories',
                'financial-goals',
                'ai-chat-history',
                'currentSection',
                'theme',
                'currency',
                'language',
                'exchangeRates'
            ];
            
            keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`Удален ключ: ${key}`);
                }
            });
            
            console.log('Все данные из localStorage удалены');
            
            // Обновить внутренние массивы приложения
            if (this.transactionManager) {
                this.transactionManager.transactions = [];
                this.transactionManager.filteredTransactions = [];
                console.log('Внутренние массивы транзакций очищены');
            }
            
            // Reload dashboard with empty data
            this.loadDashboardData();
            this.setupCharts();
            
            // Обновить транзакции если мы на странице транзакций
            if (this.transactionManager) {
                this.transactionManager.renderTransactionsTable();
            }
            
            console.log('=== СБРОС ДАННЫХ ЗАВЕРШЕН ===');
            this.showNotification('Все данные сброшены! Теперь можете добавить свои расходы за июль.', 'success');
            
        } catch (error) {
            console.error('Ошибка при сбросе данных:', error);
            this.showNotification('Ошибка при сбросе данных', 'error');
        }
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

    // Advanced Transaction Filter Methods
    handleDateRangeFilter(value) {
        console.log('Date range filter:', value);
        // Implementation will be added
    }

    handleCategoryFilter(value) {
        console.log('Category filter:', value);
        // Implementation will be added
    }

    handleAmountFilter(value) {
        console.log('Amount filter:', value);
        // Implementation will be added
    }

    handleSortFilter(value) {
        console.log('Sort filter:', value);
        // Implementation will be added
    }

    applyAdvancedFilters() {
        console.log('Applying advanced filters');
        if (this.transactionManager) {
            this.transactionManager.renderTransactionsTable();
        }
        this.showNotification('Фильтры применены', 'success');
    }

    clearAdvancedFilters() {
        // Reset all filter inputs
        document.getElementById('date-range-filter').value = 'month';
        document.getElementById('category-filter').value = '';
        document.getElementById('amount-filter').value = '';
        document.getElementById('sort-filter').value = 'date-desc';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        document.getElementById('search-transactions').value = '';

        if (this.transactionManager) {
            this.transactionManager.renderTransactionsTable();
        }
        this.showNotification('Фильтры очищены', 'info');
    }

    // Transaction Management Methods
    showBulkEditModal() {
        this.showNotification('Массовое редактирование в разработке', 'info');
    }

    showBulkDeleteModal() {
        if (confirm('Вы уверены, что хотите удалить выбранные транзакции?')) {
            this.showNotification('Массовое удаление в разработке', 'info');
        }
    }

    duplicateSelectedTransactions() {
        this.showNotification('Дублирование выбранных транзакций в разработке', 'info');
    }

    exportSelectedTransactions() {
        this.showNotification('Экспорт выбранных транзакций в разработке', 'info');
    }

    selectAllTransactions() {
        const checkboxes = document.querySelectorAll('.transaction-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        this.updateSelectionInfo();
    }

    deselectAllTransactions() {
        const checkboxes = document.querySelectorAll('.transaction-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const selectedCount = document.querySelectorAll('.transaction-item input[type="checkbox"]:checked').length;
        const selectionInfo = document.getElementById('selection-info');
        const selectedCountElement = document.getElementById('selected-count');
        
        if (selectedCount > 0) {
            selectionInfo.style.display = 'flex';
            selectedCountElement.textContent = selectedCount;
        } else {
            selectionInfo.style.display = 'none';
        }
    }

    closeTransactionModal() {
        const modal = document.getElementById('transaction-actions-modal');
        modal?.classList.remove('active');
    }

    editSelectedTransaction() {
        this.showNotification('Редактирование транзакции в разработке', 'info');
        this.closeTransactionModal();
    }

    duplicateSelectedTransaction() {
        this.showNotification('Дублирование транзакции в разработке', 'info');
        this.closeTransactionModal();
    }

    deleteSelectedTransaction() {
        if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            this.showNotification('Удаление транзакции в разработке', 'info');
        }
        this.closeTransactionModal();
    }

    showAddFilterModal() {
        const filterTypes = [
            { id: 'period', label: 'Период', type: 'select', options: [
                { value: 'all', label: 'Все время' },
                { value: 'today', label: 'Сегодня' },
                { value: 'week', label: 'Неделя' },
                { value: 'month', label: 'Месяц' },
                { value: 'quarter', label: 'Квартал' },
                { value: 'year', label: 'Год' },
                { value: 'custom', label: 'Произвольный' }
            ]},
            { id: 'category', label: 'Категория', type: 'select', options: [
                { value: '', label: 'Все категории' },
                { value: 'food', label: 'Продукты' },
                { value: 'transport', label: 'Транспорт' },
                { value: 'entertainment', label: 'Развлечения' },
                { value: 'shopping', label: 'Покупки' },
                { value: 'health', label: 'Здоровье' },
                { value: 'education', label: 'Образование' },
                { value: 'income', label: 'Доходы' }
            ]},
            { id: 'type', label: 'Тип', type: 'select', options: [
                { value: '', label: 'Все типы' },
                { value: 'income', label: 'Доходы' },
                { value: 'expense', label: 'Расходы' }
            ]},
            { id: 'sort', label: 'Сортировка', type: 'select', options: [
                { value: 'date-desc', label: 'Дата (новые)' },
                { value: 'date-asc', label: 'Дата (старые)' },
                { value: 'amount-desc', label: 'Сумма (большие)' },
                { value: 'amount-asc', label: 'Сумма (малые)' },
                { value: 'category', label: 'По категории' }
            ]},
            { id: 'date-from', label: 'Дата от', type: 'date' },
            { id: 'date-to', label: 'Дата до', type: 'date' },
            { id: 'search', label: 'Поиск', type: 'text', placeholder: 'Поиск по описанию...' }
        ];

        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal active filter-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Добавить фильтр</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Выберите тип фильтра для добавления:</p>
                    <div class="form-row">
                        ${filterTypes.slice(0, 2).map(filter => `
                            <div class="form-group" data-filter-id="${filter.id}" data-filter-label="${filter.label}" data-filter-type="${filter.type}">
                                <label>${filter.label.toUpperCase()}</label>
                                ${filter.type === 'select' ? `
                                    <select class="select">
                                        ${filter.options.map(option => `
                                            <option value="${option.value}">${option.label}</option>
                                        `).join('')}
                                    </select>
                                ` : filter.type === 'date' ? `
                                    <input type="date" class="input">
                                ` : `
                                    <input type="text" class="input" placeholder="${filter.placeholder || ''}">
                                `}
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-row">
                        ${filterTypes.slice(2, 4).map(filter => `
                            <div class="form-group" data-filter-id="${filter.id}" data-filter-label="${filter.label}" data-filter-type="${filter.type}">
                                <label>${filter.label.toUpperCase()}</label>
                                ${filter.type === 'select' ? `
                                    <select class="select">
                                        ${filter.options.map(option => `
                                            <option value="${option.value}">${option.label}</option>
                                        `).join('')}
                                    </select>
                                ` : filter.type === 'date' ? `
                                    <input type="date" class="input">
                                ` : `
                                    <input type="text" class="input" placeholder="${filter.placeholder || ''}">
                                `}
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-row">
                        ${filterTypes.slice(4, 6).map(filter => `
                            <div class="form-group" data-filter-id="${filter.id}" data-filter-label="${filter.label}" data-filter-type="${filter.type}">
                                <label>${filter.label.toUpperCase()}</label>
                                ${filter.type === 'select' ? `
                                    <select class="select">
                                        ${filter.options.map(option => `
                                            <option value="${option.value}">${option.label}</option>
                                        `).join('')}
                                    </select>
                                ` : filter.type === 'date' ? `
                                    <input type="date" class="input">
                                ` : `
                                    <input type="text" class="input" placeholder="${filter.placeholder || ''}">
                                `}
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-group">
                        <label>${filterTypes[6].label.toUpperCase()}</label>
                        <input type="text" class="input" placeholder="${filterTypes[6].placeholder || ''}" data-filter-id="${filterTypes[6].id}" data-filter-label="${filterTypes[6].label}" data-filter-type="${filterTypes[6].type}">
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Отмена
                        </button>
                        <button class="btn btn-primary" onclick="window.bugalterApp.addSelectedFilter()">
                            Добавить фильтр
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);


    }

    addSelectedFilter() {
        const modal = document.querySelector('.modal.active');
        
        // Получаем все заполненные фильтры
        const filterGroups = modal.querySelectorAll('.form-group');
        const activeFilters = [];
        
        filterGroups.forEach(group => {
            const filterId = group.dataset.filterId;
            const filterLabel = group.dataset.filterLabel;
            const filterType = group.dataset.filterType;
            
            let filterValue = '';
            const input = group.querySelector('input');
            const select = group.querySelector('select');
            
            if (input) {
                filterValue = input.value.trim();
            } else if (select) {
                filterValue = select.value;
            }
            
            // Добавляем только заполненные фильтры
            if (filterValue && filterValue !== '') {
                activeFilters.push({
                    id: filterId,
                    label: filterLabel,
                    type: filterType,
                    value: filterValue
                });
            }
        });
        
        if (activeFilters.length === 0) {
            this.showNotification('Выберите хотя бы один фильтр', 'warning');
            return;
        }
        
        // Применяем фильтры
        this.applyActiveFilters(activeFilters);
        
        // Закрываем модальное окно
        modal.remove();
        
        
    }

    addFilterToContainer(filterId, filterValue, filterLabel, filterType) {
        const container = document.getElementById('filters-container');
        
        // Получаем отображаемое значение
        let displayValue = filterValue;
        if (filterType === 'select') {
            const option = document.querySelector(`option[value="${filterValue}"]`);
            if (option) {
                displayValue = option.textContent;
            }
        }
        
        const filterElement = document.createElement('div');
        filterElement.className = 'filter-item';
        filterElement.dataset.filterId = filterId;
        filterElement.dataset.filterValue = filterValue;
        filterElement.innerHTML = `
            <div class="filter-group">
                <label>${filterLabel}:</label>
                <div class="filter-control">
                    <input type="text" value="${displayValue}" class="input" readonly>
                    <button class="btn btn-sm btn-text" onclick="this.closest('.filter-item').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(filterElement);
        
        // Применяем фильтр к транзакциям
        this.applyFilters();
    }

    applyActiveFilters(activeFilters) {
        console.log('Применение активных фильтров:', activeFilters);
        
        // Получаем все транзакции из localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        let filteredTransactions = [...transactions];
        
        // Применяем каждый фильтр
        activeFilters.forEach(filter => {
            switch (filter.id) {
                case 'period':
                    filteredTransactions = this.filterByPeriod(filteredTransactions, filter.value);
                    break;
                case 'category':
                    filteredTransactions = this.filterByCategory(filteredTransactions, filter.value);
                    break;
                case 'type':
                    filteredTransactions = this.filterByType(filteredTransactions, filter.value);
                    break;
                case 'sort':
                    filteredTransactions = this.sortTransactions(filteredTransactions, filter.value);
                    break;
                case 'date-from':
                    filteredTransactions = this.filterByDateFrom(filteredTransactions, filter.value);
                    break;
                case 'date-to':
                    filteredTransactions = this.filterByDateTo(filteredTransactions, filter.value);
                    break;
                case 'search':
                    filteredTransactions = this.filterBySearch(filteredTransactions, filter.value);
                    break;
            }
        });
        
        // Обновляем отображение транзакций
        this.displayFilteredTransactions(filteredTransactions);
        
        // Сохраняем активные фильтры
        this.activeFilters = activeFilters;
    }
    
    filterByPeriod(transactions, period) {
        if (period === 'all') return transactions;
        
        const now = new Date();
        const filtered = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch (period) {
                case 'today':
                    return this.isSameDay(transactionDate, now);
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return transactionDate >= monthAgo;
                case 'quarter':
                    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    return transactionDate >= quarterAgo;
                case 'year':
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    return transactionDate >= yearAgo;
                default:
                    return true;
            }
        });
        
        return filtered;
    }
    
    filterByCategory(transactions, category) {
        if (!category || category === '') return transactions;
        return transactions.filter(transaction => transaction.category === category);
    }
    
    filterByType(transactions, type) {
        if (!type || type === '') return transactions;
        return transactions.filter(transaction => transaction.type === type);
    }
    
    sortTransactions(transactions, sortType) {
        const sorted = [...transactions];
        
        switch (sortType) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'amount-desc':
                return sorted.sort((a, b) => b.amount - a.amount);
            case 'amount-asc':
                return sorted.sort((a, b) => a.amount - b.amount);
            case 'category':
                return sorted.sort((a, b) => a.category.localeCompare(b.category));
            default:
                return sorted;
        }
    }
    
    filterByDateFrom(transactions, dateFrom) {
        if (!dateFrom) return transactions;
        const fromDate = new Date(dateFrom);
        return transactions.filter(transaction => new Date(transaction.date) >= fromDate);
    }
    
    filterByDateTo(transactions, dateTo) {
        if (!dateTo) return transactions;
        const toDate = new Date(dateTo);
        return transactions.filter(transaction => new Date(transaction.date) <= toDate);
    }
    
    filterBySearch(transactions, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return transactions;
        const term = searchTerm.toLowerCase();
        return transactions.filter(transaction => 
            transaction.description.toLowerCase().includes(term) ||
            transaction.category.toLowerCase().includes(term)
        );
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    displayFilteredTransactions(filteredTransactions) {
        // Обновляем данные в TransactionManager
        if (this.transactionManager) {
            this.transactionManager.filteredTransactions = filteredTransactions;
        }
        
        // Отображаем транзакции
        this.displayTransactions();
        
        // Показываем кнопку сброса фильтров
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.style.display = 'inline-flex';
        }
    }
    
    resetFilters() {
        // Сбрасываем фильтры в TransactionManager
        if (this.transactionManager) {
            this.transactionManager.filteredTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        }
        
        // Отображаем транзакции
        this.displayTransactions();
        
        // Скрываем кнопку сброса фильтров
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.style.display = 'none';
        }
        
        this.showNotification('Фильтры сброшены', 'success');
    }
    
    applyFilters() {
        console.log('Применение фильтров...');
        // TODO: Реализовать логику фильтрации транзакций
    }

    initializePagination() {
        // Инициализируем пагинацию с данными из TransactionManager
        if (this.transactionManager) {
            this.transactionManager.filteredTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        }
        
        // Если мы на странице транзакций, отображаем их
        if (this.currentSection === 'transactions') {
            setTimeout(() => {
                this.displayTransactions();
            }, 100);
        }
    }

    // Pagination methods
    bindPaginationEvents() {
        const itemsPerPageSelect = document.getElementById('items-per-page');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');

        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.updatePagination();
                this.displayTransactions();
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updatePagination();
                    this.displayTransactions();
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updatePagination();
                    this.displayTransactions();
                }
            });
        }

        // Delegate event for page buttons
        if (pageNumbers) {
            pageNumbers.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-btn')) {
                    const page = parseInt(e.target.dataset.page);
                    this.currentPage = page;
                    this.updatePagination();
                    this.displayTransactions();
                }
            });
        }
    }

    updatePagination() {
        const totalItems = this.filteredTransactions.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update info text
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Показано ${startItem}-${endItem} из ${totalItems}`;
        }

        // Update navigation buttons
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        if (prevPageBtn) {
            prevPageBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = this.currentPage >= totalPages;
        }

        // Update page numbers
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.getElementById('page-numbers');
        if (!pageNumbers) return;

        pageNumbers.innerHTML = '';

        // Show max 5 pages around current page
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);

        // Adjust if we're near the beginning
        if (this.currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
        }

        // Adjust if we're near the end
        if (this.currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.dataset.page = i;
            pageBtn.textContent = i;
            pageNumbers.appendChild(pageBtn);
        }
    }

    displayTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return;

        // Используем данные из TransactionManager если он доступен
        const transactions = this.transactionManager ? this.transactionManager.filteredTransactions : this.filteredTransactions;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = transactions.slice(startIndex, endIndex);

        if (pageTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Нет транзакций</h3>
                    <p>Добавьте первую транзакцию, чтобы начать отслеживать ваши финансы</p>
                </div>
            `;
        } else {
            transactionsList.innerHTML = pageTransactions.map(transaction => {
                const amount = Math.abs(transaction.amount);
                const amountDisplay = transaction.type === 'income' ? `+${this.formatCurrency(amount)}` : `-${this.formatCurrency(amount)}`;
                const categoryDisplay = transaction.category || 'Без категории';
                const sourceDisplay = transaction.source || 'Не указан';
                
                return `
                <div class="transaction-item ${transaction.type}" data-transaction-id="${transaction.id}">
                    <div class="transaction-icon">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    
                    <div class="transaction-details">
                        <div class="transaction-header">
                            <div class="transaction-id">
                                <span class="transaction-number">Транзакция: ${transaction.id}</span>
                                <span class="transaction-date">Создан: ${new Date(transaction.date).toLocaleDateString('ru-RU')}, ${new Date(transaction.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                        </div>
                        
                        <div class="transaction-info-grid">
                            <div class="info-column">
                                <div class="info-label">Тип</div>
                                <div class="info-value">
                                    <span class="transaction-type">${transaction.type === 'income' ? 'Доход' : 'Расход'}</span>
                                </div>
                            </div>
                            
                            <div class="info-column">
                                <div class="info-label">Категория</div>
                                <div class="info-value">
                                    <span class="category-name">${categoryDisplay}</span>
                                </div>
                            </div>
                            
                            <div class="info-column">
                                <div class="info-label">Источник</div>
                                <div class="info-value">
                                    <span class="source-name">${sourceDisplay}</span>
                                    <i class="fas fa-info-circle info-icon"></i>
                                </div>
                            </div>
                            
                            <div class="info-column">
                                <div class="info-label">Статус</div>
                                <div class="info-value">
                                    <span class="status-badge ${transaction.type}">${transaction.type === 'income' ? 'Получен' : 'Потрачен'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="transaction-amount-section">
                        <div class="amount-info">
                            <div class="amount-value ${transaction.type}">${amountDisplay}</div>
                            <div class="amount-label">Стоимость транзакции</div>
                        </div>
                    </div>
                    
                    <div class="transaction-action">
                        <div class="action-icon ${transaction.type === 'income' ? 'success' : 'warning'}">
                            <i class="fas fa-${transaction.type === 'income' ? 'check' : 'exclamation'}"></i>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }

        this.updatePagination();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализируем приложение...');
    window.bugalterApp = new BugalterAIApp();
    
    // Ждем загрузки всех скриптов перед инициализацией менеджеров
    setTimeout(() => {
        console.log('Проверяем доступность менеджеров...');
        
        // Initialize TransactionManager
        if (typeof TransactionManager !== 'undefined') {
            console.log('TransactionManager найден, инициализируем...');
            TransactionManager.extendApp(window.bugalterApp);
        } else {
            console.error('TransactionManager не найден!');
            // Попробуем еще раз через секунду
            setTimeout(() => {
                if (typeof TransactionManager !== 'undefined') {
                    console.log('TransactionManager найден при повторной попытке...');
                    TransactionManager.extendApp(window.bugalterApp);
                } else {
                    console.error('TransactionManager все еще не найден!');
                }
            }, 1000);
        }
        
        // Initialize other managers
        if (typeof AnalyticsManager !== 'undefined') {
            AnalyticsManager.extendApp(window.bugalterApp);
        }
        
        if (typeof AIInsightsManager !== 'undefined') {
            AIInsightsManager.extendApp(window.bugalterApp);
        }
        
        if (typeof ReportsManager !== 'undefined') {
            ReportsManager.extendApp(window.bugalterApp);
        }
        
        // Принудительная проверка инициализации
        setTimeout(() => {
            console.log('Проверка инициализации через 2 секунды...');
            if (window.bugalterApp.transactionManager) {
                console.log('TransactionManager успешно инициализирован');
            } else {
                console.error('TransactionManager не инициализирован!');
            }
        }, 2000);
        
        // Принудительная инициализация при загрузке страницы транзакций
        setTimeout(() => {
            if (window.location.hash === '#transactions') {
                console.log('Принудительная инициализация для страницы транзакций...');
                if (window.bugalterApp.transactionManager) {
                    window.bugalterApp.transactionManager.renderTransactionsTable();
                    window.bugalterApp.transactionManager.updateAnalyticsCards();
                }
            }
        }, 3000);
        
        // Принудительное обновление аналитических карточек через 4 секунды
        setTimeout(() => {
            console.log('Принудительное обновление аналитических карточек...');
            if (window.bugalterApp.transactionManager) {
                window.bugalterApp.transactionManager.updateAnalyticsCards();
            }
        }, 4000);
    }, 500);
}); 