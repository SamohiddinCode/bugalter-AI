// Financial Goals Management System
class GoalsManager {
    constructor() {
        this.goals = this.loadGoals();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderGoals();
    }

    bindEvents() {
        // Add goal button
        document.getElementById('add-goal')?.addEventListener('click', () => {
            this.showAddGoalModal();
        });

        // Add goal card click
        document.querySelector('.add-goal')?.addEventListener('click', () => {
            this.showAddGoalModal();
        });

        // Goal actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-to-goal"]')) {
                const goalId = e.target.dataset.goalId;
                this.showAddToGoalModal(goalId);
            }
            
            if (e.target.matches('[data-action="view-goal"]')) {
                const goalId = e.target.dataset.goalId;
                this.showGoalDetailsModal(goalId);
            }
        });

        // Listen for currency changes
        window.addEventListener('currencyChanged', () => {
            this.renderGoals();
        });

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.renderGoals();
        });
    }

    loadGoals() {
        const saved = localStorage.getItem('financial-goals');
        return saved ? JSON.parse(saved) : this.getDefaultGoals();
    }

    getDefaultGoals() {
        return [
            {
                id: 'goal-1',
                name: 'Покупка квартиры',
                description: 'Накопить на первый взнос',
                targetAmount: 5000000,
                currentAmount: 2500000,
                deadline: '2025-12-31',
                icon: 'home',
                color: '#3b82f6',
                createdAt: '2024-01-01',
                monthlyContribution: 100000
            },
            {
                id: 'goal-2',
                name: 'Путешествие в Европу',
                description: 'Летний отпуск',
                targetAmount: 300000,
                currentAmount: 150000,
                deadline: '2024-06-30',
                icon: 'plane',
                color: '#10b981',
                createdAt: '2024-01-15',
                monthlyContribution: 25000
            }
        ];
    }

    saveGoals() {
        localStorage.setItem('financial-goals', JSON.stringify(this.goals));
    }

    renderGoals() {
        const container = document.querySelector('.goals-grid');
        if (!container) return;

        // Clear existing goals (except add goal card)
        const addGoalCard = container.querySelector('.add-goal');
        container.innerHTML = '';
        if (addGoalCard) {
            container.appendChild(addGoalCard);
        }

        this.goals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            container.insertBefore(goalCard, addGoalCard);
        });
    }

    createGoalCard(goal) {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysUntilDeadline = this.getDaysUntilDeadline(goal.deadline);
        const aiPrediction = this.getAIPrediction(goal);

        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-icon" style="background: ${goal.color}">
                    <i class="fas fa-${goal.icon}"></i>
                </div>
                <div class="goal-info">
                    <h3>${goal.name}</h3>
                    <p>${goal.description}</p>
                </div>
            </div>
            <div class="goal-progress">
                <div class="progress-info">
                    <span class="current-amount">${this.formatCurrency(goal.currentAmount)}</span>
                    <span class="target-amount">из ${this.formatCurrency(goal.targetAmount)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="goal-stats">
                    <span class="percentage">${Math.round(percentage)}%</span>
                    <span class="remaining">Осталось ${this.formatCurrency(remaining)}</span>
                </div>
            </div>
            <div class="goal-details">
                <div class="goal-meta">
                    <span class="deadline">До ${this.formatDate(goal.deadline)} (${daysUntilDeadline} дней)</span>
                    <span class="monthly-contribution">${this.formatCurrency(goal.monthlyContribution)}/мес</span>
                </div>
                ${aiPrediction ? `
                    <div class="ai-prediction ${aiPrediction.status}">
                        <i class="fas fa-robot"></i>
                        <span>${aiPrediction.message}</span>
                    </div>
                ` : ''}
            </div>
            <div class="goal-actions">
                <button class="btn btn-sm btn-outline" data-action="add-to-goal" data-goal-id="${goal.id}">
                    Добавить
                </button>
                <button class="btn btn-sm btn-primary" data-action="view-goal" data-goal-id="${goal.id}">
                    Подробнее
                </button>
            </div>
        `;

        return card;
    }

    getAIPrediction(goal) {
        const monthlyContribution = goal.monthlyContribution;
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysUntilDeadline = this.getDaysUntilDeadline(goal.deadline);
        const monthsUntilDeadline = daysUntilDeadline / 30;

        if (monthsUntilDeadline <= 0) {
            return {
                status: 'warning',
                message: 'Срок достижения цели истек'
            };
        }

        const projectedAmount = goal.currentAmount + (monthlyContribution * monthsUntilDeadline);
        const isOnTrack = projectedAmount >= goal.targetAmount;

        if (isOnTrack) {
            const monthsToComplete = Math.ceil(remaining / monthlyContribution);
            return {
                status: 'success',
                message: `Цель будет достигнута через ${monthsToComplete} месяцев`
            };
        } else {
            const shortfall = goal.targetAmount - projectedAmount;
            const additionalMonthly = Math.ceil(shortfall / monthsUntilDeadline);
            return {
                status: 'warning',
                message: `Нужно увеличить взнос на ${this.formatCurrency(additionalMonthly)}/мес`
            };
        }
    }

    showAddGoalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Создать финансовую цель</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="goal-form">
                        <div class="form-group">
                            <label for="goal-name">Название цели</label>
                            <input type="text" id="goal-name" class="input" placeholder="Например: Покупка квартиры" required>
                        </div>
                        <div class="form-group">
                            <label for="goal-description">Описание</label>
                            <textarea id="goal-description" class="input" placeholder="Краткое описание цели"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-target">Целевая сумма</label>
                                <input type="number" id="goal-target" class="input" placeholder="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="goal-deadline">Срок достижения</label>
                                <input type="date" id="goal-deadline" class="input" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goal-current">Текущая сумма</label>
                                <input type="number" id="goal-current" class="input" placeholder="0" step="0.01" value="0">
                            </div>
                            <div class="form-group">
                                <label for="goal-monthly">Ежемесячный взнос</label>
                                <input type="number" id="goal-monthly" class="input" placeholder="0" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="goal-icon">Иконка</label>
                            <select id="goal-icon" class="select">
                                <option value="home">🏠 Дом</option>
                                <option value="car">🚗 Автомобиль</option>
                                <option value="plane">✈️ Путешествие</option>
                                <option value="graduation">🎓 Образование</option>
                                <option value="gift">🎁 Подарок</option>
                                <option value="heart">❤️ Свадьба</option>
                                <option value="briefcase">💼 Бизнес</option>
                                <option value="star">⭐ Мечта</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                            <button type="submit" class="btn btn-primary">Создать цель</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set default deadline to 1 year from now
        const defaultDeadline = new Date();
        defaultDeadline.setFullYear(defaultDeadline.getFullYear() + 1);
        document.getElementById('goal-deadline').value = defaultDeadline.toISOString().split('T')[0];

        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createGoal();
            modal.remove();
        });
    }

    createGoal() {
        const goal = {
            id: `goal-${Date.now()}`,
            name: document.getElementById('goal-name').value,
            description: document.getElementById('goal-description').value,
            targetAmount: parseFloat(document.getElementById('goal-target').value),
            currentAmount: parseFloat(document.getElementById('goal-current').value) || 0,
            deadline: document.getElementById('goal-deadline').value,
            monthlyContribution: parseFloat(document.getElementById('goal-monthly').value),
            icon: document.getElementById('goal-icon').value,
            color: this.getGoalColor(document.getElementById('goal-icon').value),
            createdAt: new Date().toISOString().split('T')[0]
        };

        this.goals.push(goal);
        this.saveGoals();
        this.renderGoals();

        this.showNotification('Цель создана!', 'success');
    }

    getGoalColor(icon) {
        const colors = {
            home: '#3b82f6',
            car: '#ef4444',
            plane: '#10b981',
            graduation: '#8b5cf6',
            gift: '#ec4899',
            heart: '#f59e0b',
            briefcase: '#6b7280',
            star: '#fbbf24'
        };
        return colors[icon] || '#3b82f6';
    }

    showAddToGoalModal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Добавить к цели: ${goal.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="goal-summary">
                        <div class="goal-progress-info">
                            <span>Текущая сумма: ${this.formatCurrency(goal.currentAmount)}</span>
                            <span>Цель: ${this.formatCurrency(goal.targetAmount)}</span>
                            <span>Осталось: ${this.formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                        </div>
                    </div>
                    <form id="add-to-goal-form">
                        <div class="form-group">
                            <label for="add-amount">Сумма для добавления</label>
                            <input type="number" id="add-amount" class="input" placeholder="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="add-note">Заметка (необязательно)</label>
                            <input type="text" id="add-note" class="input" placeholder="Например: Бонус с работы">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                            <button type="submit" class="btn btn-primary">Добавить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('add-to-goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('add-amount').value);
            const note = document.getElementById('add-note').value;

            this.addToGoal(goalId, amount, note);
            modal.remove();
        });
    }

    addToGoal(goalId, amount, note) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        goal.currentAmount += amount;

        // Add transaction record
        if (!goal.transactions) {
            goal.transactions = [];
        }

        goal.transactions.push({
            id: Date.now(),
            amount: amount,
            note: note,
            date: new Date().toISOString().split('T')[0]
        });

        this.saveGoals();
        this.renderGoals();

        this.showNotification(`Добавлено ${this.formatCurrency(amount)} к цели "${goal.name}"`, 'success');
    }

    showGoalDetailsModal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const aiPrediction = this.getAIPrediction(goal);
        const transactions = goal.transactions || [];

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${goal.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="goal-details-overview">
                        <div class="goal-info-grid">
                            <div class="info-item">
                                <label>Целевая сумма</label>
                                <span>${this.formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div class="info-item">
                                <label>Текущая сумма</label>
                                <span>${this.formatCurrency(goal.currentAmount)}</span>
                            </div>
                            <div class="info-item">
                                <label>Осталось</label>
                                <span>${this.formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                            </div>
                            <div class="info-item">
                                <label>Ежемесячный взнос</label>
                                <span>${this.formatCurrency(goal.monthlyContribution)}</span>
                            </div>
                            <div class="info-item">
                                <label>Срок достижения</label>
                                <span>${this.formatDate(goal.deadline)}</span>
                            </div>
                            <div class="info-item">
                                <label>Прогресс</label>
                                <span>${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                            </div>
                        </div>
                        
                        ${aiPrediction ? `
                            <div class="ai-prediction-card ${aiPrediction.status}">
                                <div class="ai-header">
                                    <i class="fas fa-robot"></i>
                                    <h4>AI Прогноз</h4>
                                </div>
                                <p>${aiPrediction.message}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="goal-transactions">
                        <h4>История взносов</h4>
                        ${transactions.length > 0 ? `
                            <div class="transactions-list">
                                ${transactions.map(t => `
                                    <div class="transaction-item">
                                        <div class="transaction-date">${this.formatDate(t.date)}</div>
                                        <div class="transaction-amount">+${this.formatCurrency(t.amount)}</div>
                                        ${t.note ? `<div class="transaction-note">${t.note}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-transactions">Пока нет взносов</p>'}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getDaysUntilDeadline(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

// Initialize goals manager
const goalsManager = new GoalsManager(); 