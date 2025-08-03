// Budget Management System
class BudgetManager {
    constructor() {
        this.budgets = this.loadBudgets();
        this.categories = this.loadCategories();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderBudgetOverview();
        this.renderBudgetCategories();
    }

    bindEvents() {
        // Budget creation
        document.getElementById('create-budget')?.addEventListener('click', () => {
            this.showCreateBudgetModal();
        });

        // AI budget suggestions
        document.getElementById('ai-budget-suggestions')?.addEventListener('click', () => {
            this.getAIBudgetSuggestions();
        });

        // Edit categories
        document.getElementById('edit-categories')?.addEventListener('click', () => {
            this.showEditCategoriesModal();
        });

        // Manage budget
        document.getElementById('manage-budget')?.addEventListener('click', () => {
            this.showManageBudgetModal();
        });

        // Listen for currency changes
        window.addEventListener('currencyChanged', () => {
            this.renderBudgetOverview();
            this.renderBudgetCategories();
        });

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.renderBudgetOverview();
            this.renderBudgetCategories();
        });
    }

    loadBudgets() {
        const saved = localStorage.getItem('budgets');
        return saved ? JSON.parse(saved) : this.getDefaultBudgets();
    }

    loadCategories() {
        const saved = localStorage.getItem('budget-categories');
        return saved ? JSON.parse(saved) : this.getDefaultCategories();
    }

    getDefaultCategories() {
        return [
            { id: 'food', name: 'Продукты', icon: 'fas fa-utensils', color: '#f59e0b' },
            { id: 'transport', name: 'Транспорт', icon: 'fas fa-car', color: '#3b82f6' },
            { id: 'entertainment', name: 'Развлечения', icon: 'fas fa-gamepad', color: '#8b5cf6' },
            { id: 'shopping', name: 'Покупки', icon: 'fas fa-shopping-bag', color: '#ec4899' },
            { id: 'health', name: 'Здоровье', icon: 'fas fa-heartbeat', color: '#ef4444' },
            { id: 'education', name: 'Образование', icon: 'fas fa-graduation-cap', color: '#10b981' },
            { id: 'utilities', name: 'Коммунальные', icon: 'fas fa-home', color: '#6b7280' },
            { id: 'other', name: 'Прочее', icon: 'fas fa-ellipsis-h', color: '#9ca3af' }
        ];
    }

    getDefaultBudgets() {
        return {
            total: 150000,
            categories: {
                food: { limit: 20000, spent: 15000 },
                transport: { limit: 10000, spent: 8500 },
                entertainment: { limit: 5000, spent: 3200 },
                shopping: { limit: 8000, spent: 4500 },
                health: { limit: 5000, spent: 1200 },
                education: { limit: 3000, spent: 0 },
                utilities: { limit: 15000, spent: 12000 },
                other: { limit: 5000, spent: 1800 }
            }
        };
    }

    saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    saveCategories() {
        localStorage.setItem('budget-categories', JSON.stringify(this.categories));
    }

    renderBudgetOverview() {
        const totalBudget = this.budgets.total;
        const totalSpent = Object.values(this.budgets.categories).reduce((sum, cat) => sum + cat.spent, 0);
        const remaining = totalBudget - totalSpent;
        const usedPercentage = (totalSpent / totalBudget) * 100;

        // Update budget overview cards
        const budgetAmountEl = document.querySelector('.budget-amount');
        if (budgetAmountEl) {
            budgetAmountEl.textContent = `${this.formatCurrency(totalBudget)}`;
        }

        const remainingEl = document.querySelector('.budget-amount.positive');
        if (remainingEl) {
            remainingEl.textContent = `${this.formatCurrency(remaining)}`;
        }

        const progressFill = document.querySelector('.budget-progress .progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(usedPercentage, 100)}%`;
        }

        const percentageText = document.querySelector('.budget-progress span');
        if (percentageText) {
            percentageText.textContent = `${Math.round(usedPercentage)}% использовано`;
        }

        // Update budget used in dashboard
        const budgetUsedEl = document.getElementById('budget-used');
        if (budgetUsedEl) {
            budgetUsedEl.textContent = `${Math.round(usedPercentage)}%`;
        }
    }

    renderBudgetCategories() {
        const container = document.getElementById('budget-categories-list');
        if (!container) return;

        container.innerHTML = '';

        this.categories.forEach(category => {
            const budget = this.budgets.categories[category.id];
            if (!budget) return;

            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = budget.spent > budget.limit;

            const categoryEl = document.createElement('div');
            categoryEl.className = 'budget-category-item';
            categoryEl.innerHTML = `
                <div class="category-header">
                    <div class="category-info">
                        <div class="category-icon" style="background: ${category.color}">
                            <i class="${category.icon}"></i>
                        </div>
                        <div class="category-details">
                            <h4>${category.name}</h4>
                            <span class="category-amount">${this.formatCurrency(budget.spent)} / ${this.formatCurrency(budget.limit)}</span>
                        </div>
                    </div>
                    <div class="category-percentage ${isOverBudget ? 'over-budget' : ''}">
                        ${Math.round(percentage)}%
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${isOverBudget ? 'over-budget' : ''}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline" onclick="budgetManager.editCategoryBudget('${category.id}')">
                        Изменить
                    </button>
                    ${isOverBudget ? '<span class="warning-text">Превышен лимит!</span>' : ''}
                </div>
            `;

            container.appendChild(categoryEl);
        });
    }

    showCreateBudgetModal() {
        // Create modal for budget creation
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Создать бюджет</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="create-budget-form">
                        <div class="form-group">
                            <label>Общий бюджет на месяц</label>
                            <input type="number" id="total-budget" class="input" placeholder="Введите сумму" required>
                        </div>
                        <div class="form-group">
                            <label>Использовать AI рекомендации</label>
                            <input type="checkbox" id="use-ai-suggestions" class="checkbox" checked>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                            <button type="submit" class="btn btn-primary">Создать бюджет</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('create-budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const totalBudget = parseFloat(document.getElementById('total-budget').value);
            const useAI = document.getElementById('use-ai-suggestions').checked;

            if (useAI) {
                this.createBudgetWithAI(totalBudget);
            } else {
                this.createBudget(totalBudget);
            }

            modal.remove();
        });
    }

    createBudgetWithAI(totalBudget) {
        // AI-based budget distribution
        const aiSuggestions = {
            food: 0.15,        // 15%
            transport: 0.10,    // 10%
            entertainment: 0.08, // 8%
            shopping: 0.12,     // 12%
            health: 0.08,       // 8%
            education: 0.05,    // 5%
            utilities: 0.12,    // 12%
            other: 0.10         // 10%
        };

        this.budgets.total = totalBudget;
        this.budgets.categories = {};

        Object.keys(aiSuggestions).forEach(categoryId => {
            this.budgets.categories[categoryId] = {
                limit: Math.round(totalBudget * aiSuggestions[categoryId]),
                spent: 0
            };
        });

        this.saveBudgets();
        this.renderBudgetOverview();
        this.renderBudgetCategories();

        // Show success message
        this.showNotification('Бюджет создан с AI рекомендациями!', 'success');
    }

    createBudget(totalBudget) {
        this.budgets.total = totalBudget;
        this.budgets.categories = {};

        // Equal distribution
        const categoryCount = this.categories.length;
        const budgetPerCategory = Math.round(totalBudget / categoryCount);

        this.categories.forEach(category => {
            this.budgets.categories[category.id] = {
                limit: budgetPerCategory,
                spent: 0
            };
        });

        this.saveBudgets();
        this.renderBudgetOverview();
        this.renderBudgetCategories();

        this.showNotification('Бюджет создан!', 'success');
    }

    getAIBudgetSuggestions() {
        // Simulate AI analysis
        const suggestions = [
            {
                category: 'Продукты',
                suggestion: 'Ваши расходы на продукты на 20% выше среднего. Рекомендую установить лимит в 15,000 ₽ вместо 20,000 ₽.',
                savings: 5000
            },
            {
                category: 'Транспорт',
                suggestion: 'Рассмотрите использование общественного транспорта. Это может сэкономить до 3,000 ₽ в месяц.',
                savings: 3000
            },
            {
                category: 'Развлечения',
                suggestion: 'Ваши расходы на развлечения в норме. Можно увеличить лимит до 6,000 ₽.',
                increase: 1000
            }
        ];

        this.showAISuggestionsModal(suggestions);
    }

    showAISuggestionsModal(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-robot"></i> AI Рекомендации по бюджету</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="ai-suggestions">
                        ${suggestions.map(suggestion => `
                            <div class="suggestion-item">
                                <div class="suggestion-header">
                                    <h4>${suggestion.category}</h4>
                                    ${suggestion.savings ? 
                                        `<span class="savings">Экономия: ${this.formatCurrency(suggestion.savings)}</span>` :
                                        `<span class="increase">Увеличение: ${this.formatCurrency(suggestion.increase)}</span>`
                                    }
                                </div>
                                <p>${suggestion.suggestion}</p>
                                <button class="btn btn-sm btn-primary" onclick="budgetManager.applySuggestion('${suggestion.category}')">
                                    Применить
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    applySuggestion(categoryName) {
        // Apply AI suggestion logic
        this.showNotification(`Рекомендация для "${categoryName}" применена!`, 'success');
    }

    editCategoryBudget(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        const budget = this.budgets.categories[categoryId];

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Изменить бюджет: ${category.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-budget-form">
                        <div class="form-group">
                            <label>Лимит бюджета</label>
                            <input type="number" id="category-limit" class="input" value="${budget.limit}" required>
                        </div>
                        <div class="form-group">
                            <label>Уже потрачено</label>
                            <input type="number" id="category-spent" class="input" value="${budget.spent}" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                            <button type="submit" class="btn btn-primary">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('edit-budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const limit = parseFloat(document.getElementById('category-limit').value);
            const spent = parseFloat(document.getElementById('category-spent').value);

            this.budgets.categories[categoryId] = { limit, spent };
            this.saveBudgets();
            this.renderBudgetOverview();
            this.renderBudgetCategories();

            modal.remove();
            this.showNotification('Бюджет обновлен!', 'success');
        });
    }

    addTransactionToBudget(categoryId, amount) {
        if (this.budgets.categories[categoryId]) {
            this.budgets.categories[categoryId].spent += amount;
            this.saveBudgets();
            this.renderBudgetOverview();
            this.renderBudgetCategories();
        }
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
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize budget manager
const budgetManager = new BudgetManager(); 