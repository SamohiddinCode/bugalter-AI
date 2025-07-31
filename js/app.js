// Bugalter AI - Main Application
class BugalterApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.currency = localStorage.getItem('currency') || 'UZS';
        this.language = localStorage.getItem('language') || 'ru';
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadInitialData();
        this.updateStats();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to nav link
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load section specific data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'transactions':
                this.loadTransactionsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'ai-insights':
                this.loadAIInsights();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    setupEventListeners() {
        // Add transaction button
        const addTransactionBtn = document.getElementById('add-transaction');
        const addTransactionBtn2 = document.getElementById('add-transaction-btn');
        
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }
        
        if (addTransactionBtn2) {
            addTransactionBtn2.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }

        // Import CSV button
        const importCsvBtn = document.getElementById('import-csv');
        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => {
                this.importCSV();
            });
        }

        // Telegram sync button
        const syncTelegramBtn = document.getElementById('sync-telegram');
        if (syncTelegramBtn) {
            syncTelegramBtn.addEventListener('click', () => {
                this.syncTelegram();
            });
        }

        // Connect Telegram button
        const connectTelegramBtn = document.getElementById('connect-telegram');
        if (connectTelegramBtn) {
            connectTelegramBtn.addEventListener('click', () => {
                this.connectTelegram();
            });
        }

        // View all transactions button
        const viewAllTransactionsBtn = document.getElementById('view-all-transactions');
        if (viewAllTransactionsBtn) {
            viewAllTransactionsBtn.addEventListener('click', () => {
                this.showSection('transactions');
            });
        }

        // Settings form
        const currencySelect = document.getElementById('currency');
        const languageSelect = document.getElementById('language');
        const themeSelect = document.getElementById('theme');

        if (currencySelect) {
            currencySelect.value = this.currency;
            currencySelect.addEventListener('change', (e) => {
                this.currency = e.target.value;
                localStorage.setItem('currency', this.currency);
                this.updateStats();
            });
        }

        if (languageSelect) {
            languageSelect.value = this.language;
            languageSelect.addEventListener('change', (e) => {
                this.language = e.target.value;
                localStorage.setItem('language', this.language);
                // TODO: Implement language change
            });
        }

        if (themeSelect) {
            themeSelect.value = this.theme;
            themeSelect.addEventListener('change', (e) => {
                this.theme = e.target.value;
                localStorage.setItem('theme', this.theme);
                document.documentElement.setAttribute('data-theme', this.theme);
            });
        }
    }

    loadInitialData() {
        // Load categories if not exists
        if (!localStorage.getItem('categories')) {
            const defaultCategories = [
                { id: 1, name: 'Продукты', color: '#10b981', type: 'expense' },
                { id: 2, name: 'Транспорт', color: '#3b82f6', type: 'expense' },
                { id: 3, name: 'Развлечения', color: '#f59e0b', type: 'expense' },
                { id: 4, name: 'Здоровье', color: '#ef4444', type: 'expense' },
                { id: 5, name: 'Одежда', color: '#8b5cf6', type: 'expense' },
                { id: 6, name: 'Зарплата', color: '#10b981', type: 'income' },
                { id: 7, name: 'Фриланс', color: '#06b6d4', type: 'income' },
                { id: 8, name: 'Инвестиции', color: '#059669', type: 'income' }
            ];
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }

        // Load sample transactions if not exists
        if (!localStorage.getItem('transactions')) {
            const sampleTransactions = [
                {
                    id: 1,
                    date: '2024-01-15',
                    description: 'Зарплата',
                    category: 'Зарплата',
                    amount: 5000000,
                    type: 'income'
                },
                {
                    id: 2,
                    date: '2024-01-16',
                    description: 'Продукты в супермаркете',
                    category: 'Продукты',
                    amount: 150000,
                    type: 'expense'
                },
                {
                    id: 3,
                    date: '2024-01-17',
                    description: 'Такси',
                    category: 'Транспорт',
                    amount: 25000,
                    type: 'expense'
                },
                {
                    id: 4,
                    date: '2024-01-18',
                    description: 'Фриланс проект',
                    category: 'Фриланс',
                    amount: 800000,
                    type: 'income'
                }
            ];
            localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
        }
    }

    loadDashboardData() {
        this.updateStats();
        this.loadRecentTransactions();
        this.loadExpenseCategories();
    }

    loadTransactionsData() {
        this.renderTransactionsTable();
        this.setupTransactionFilters();
    }

    loadReportsData() {
        // TODO: Implement charts
        console.log('Loading reports data...');
    }

    loadSettingsData() {
        this.renderCategoriesList();
    }

    updateStats() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalBalance = totalIncome - totalExpense;
        
        document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('total-expense').textContent = this.formatCurrency(totalExpense);
        document.getElementById('total-balance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('total-transactions').textContent = transactions.length;
    }

    formatCurrency(amount) {
        const formatter = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: this.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return formatter.format(amount);
    }

    loadRecentTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recent-transactions-list');
        if (!container) return;

        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>Нет транзакций</h3>
                    <p>Добавьте первую транзакцию, чтобы начать отслеживать финансы</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${transaction.category} • ${new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }

    loadExpenseCategories() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        const expenseCategories = categories.filter(c => c.type === 'expense');
        const categoryStats = {};

        // Calculate expenses by category
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
            });

        const container = document.getElementById('expense-categories');
        if (!container) return;

        if (Object.keys(categoryStats).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Нет расходов</h3>
                    <p>Добавьте расходы для анализа по категориям</p>
                </div>
            `;
            return;
        }

        const sortedCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        container.innerHTML = sortedCategories.map(([category, amount]) => {
            const categoryData = expenseCategories.find(c => c.name === category);
            return `
                <div class="category-item">
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${categoryData?.color || '#64748b'}"></div>
                        <span class="category-name">${category}</span>
                    </div>
                    <span class="transaction-amount expense">${this.formatCurrency(amount)}</span>
                </div>
            `;
        }).join('');
    }

    showTransactionModal(transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('transaction-form');
        
        if (transaction) {
            modalTitle.textContent = 'Редактировать транзакцию';
            this.populateTransactionForm(transaction);
        } else {
            modalTitle.textContent = 'Добавить транзакцию';
            form.reset();
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        
        // Setup modal event listeners
        this.setupModalEventListeners(transaction);
    }

    setupModalEventListeners(transaction) {
        const modal = document.getElementById('transaction-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-transaction');
        const form = document.getElementById('transaction-form');

        const closeModal = () => {
            modal.classList.remove('active');
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction(transaction);
            closeModal();
        });
    }

    populateTransactionForm(transaction) {
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-type').value = transaction.type;
    }

    saveTransaction(transaction = null) {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);
        
        const transactionData = {
            id: transaction ? transaction.id : Date.now(),
            date: formData.get('transaction-date'),
            description: formData.get('transaction-description'),
            category: formData.get('transaction-category'),
            amount: parseFloat(formData.get('transaction-amount')),
            type: formData.get('transaction-type')
        };

        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        if (transaction) {
            // Update existing transaction
            const index = transactions.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                transactions[index] = transactionData;
            }
        } else {
            // Add new transaction
            transactions.push(transactionData);
        }

        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        this.updateStats();
        this.loadRecentTransactions();
        
        if (this.currentSection === 'transactions') {
            this.renderTransactionsTable();
        }

        this.showNotification('Транзакция сохранена успешно!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.parseCSV(file);
            }
        });
        
        input.click();
    }

    parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            
            const transactions = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',');
                    const transaction = {
                        id: Date.now() + i,
                        date: values[0] || new Date().toISOString().split('T')[0],
                        description: values[1] || 'Импортированная транзакция',
                        category: values[2] || 'Другое',
                        amount: parseFloat(values[3]) || 0,
                        type: values[4] || 'expense'
                    };
                    transactions.push(transaction);
                }
            }
            
            if (transactions.length > 0) {
                const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                const updatedTransactions = [...existingTransactions, ...transactions];
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                
                this.updateStats();
                this.loadRecentTransactions();
                
                if (this.currentSection === 'transactions') {
                    this.renderTransactionsTable();
                }
                
                this.showNotification(`Импортировано ${transactions.length} транзакций`, 'success');
            }
        };
        
        reader.readAsText(file);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bugalterApp = new BugalterApp();
}); 