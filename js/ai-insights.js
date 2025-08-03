// AI Insights and Smart Analysis
class AIInsightsManager {
    constructor(app) {
        this.app = app;
        this.insights = [];
        this.patterns = [];
        this.recommendations = [];
        this.init();
    }

    getCurrencyFormat() {
        const currency = localStorage.getItem('currency') || 'RUB';
        const language = localStorage.getItem('language') || 'ru';
        
        let locale = 'ru-RU';
        if (language === 'en') locale = 'en-US';
        else if (language === 'uz') locale = 'uz-UZ';
        
        return { locale, currency };
    }

    init() {
        this.loadAIInsights();
        this.setupAIEventListeners();
    }

    setupAIEventListeners() {
        // AI settings checkboxes
        const aiAnalysis = document.getElementById('ai-analysis');
        const aiRecommendations = document.getElementById('ai-recommendations');
        const aiForecast = document.getElementById('ai-forecast');

        if (aiAnalysis) {
            aiAnalysis.addEventListener('change', (e) => {
                localStorage.setItem('ai-analysis', e.target.checked);
                this.toggleAIAnalysis(e.target.checked);
            });
        }

        if (aiRecommendations) {
            aiRecommendations.addEventListener('change', (e) => {
                localStorage.setItem('ai-recommendations', e.target.checked);
                this.toggleAIRecommendations(e.target.checked);
            });
        }

        if (aiForecast) {
            aiForecast.addEventListener('change', (e) => {
                localStorage.setItem('ai-forecast', e.target.checked);
                this.toggleAIForecast(e.target.checked);
            });
        }
    }

    loadAIInsights() {
        this.generateInsights();
        this.renderAIRecommendations();
        this.renderPatternAnalysis();
        this.renderGoalsProgress();
        this.renderAIForecastChart();
    }

    generateInsights() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        if (transactions.length === 0) {
            this.insights = [];
            return;
        }

        this.insights = [
            this.analyzeSpendingPatterns(transactions),
            this.analyzeIncomeTrends(transactions),
            this.analyzeCategoryAnomalies(transactions),
            this.generateSavingsRecommendations(transactions),
            this.analyzeBudgetPerformance(transactions)
        ].filter(insight => insight !== null);
    }

    analyzeSpendingPatterns(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return null;

        const monthlyExpenses = this.groupByMonth(expenses);
        const averageMonthlyExpense = Object.values(monthlyExpenses).reduce((sum, amount) => sum + amount, 0) / Object.keys(monthlyExpenses).length;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthKey = `${currentYear}-${currentMonth}`;
        const currentMonthExpense = monthlyExpenses[currentMonthKey] || 0;

        const percentageChange = ((currentMonthExpense - averageMonthlyExpense) / averageMonthlyExpense) * 100;

        if (percentageChange > 20) {
            return {
                type: 'warning',
                title: 'Повышенные расходы',
                message: `Ваши расходы в этом месяце на ${percentageChange.toFixed(1)}% выше среднего. Рекомендуем пересмотреть бюджет.`,
                icon: 'fas fa-exclamation-triangle',
                priority: 'high'
            };
        } else if (percentageChange < -20) {
            return {
                type: 'success',
                title: 'Отличная экономия',
                message: `Ваши расходы в этом месяце на ${Math.abs(percentageChange).toFixed(1)}% ниже среднего. Отличная работа!`,
                icon: 'fas fa-thumbs-up',
                priority: 'medium'
            };
        }

        return null;
    }

    analyzeIncomeTrends(transactions) {
        const income = transactions.filter(t => t.type === 'income');
        if (income.length < 2) return null;

        const monthlyIncome = this.groupByMonth(income);
        const incomeValues = Object.values(monthlyIncome);
        const recentIncome = incomeValues.slice(-3);
        
        if (recentIncome.length >= 2) {
            const growth = ((recentIncome[recentIncome.length - 1] - recentIncome[0]) / recentIncome[0]) * 100;
            
            if (growth > 10) {
                return {
                    type: 'success',
                    title: 'Рост доходов',
                    message: `Ваши доходы растут на ${growth.toFixed(1)}% в месяц. Отличная динамика!`,
                    icon: 'fas fa-chart-line',
                    priority: 'medium'
                };
            } else if (growth < -10) {
                return {
                    type: 'warning',
                    title: 'Снижение доходов',
                    message: `Ваши доходы снизились на ${Math.abs(growth).toFixed(1)}%. Рекомендуем проанализировать причины.`,
                    icon: 'fas fa-chart-line-down',
                    priority: 'high'
                };
            }
        }

        return null;
    }

    analyzeCategoryAnomalies(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return null;

        const categoryStats = {};
        expenses.forEach(t => {
            categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
        });

        const totalExpenses = Object.values(categoryStats).reduce((sum, amount) => sum + amount, 0);
        const averageCategoryExpense = totalExpenses / Object.keys(categoryStats).length;

        const anomalies = Object.entries(categoryStats)
            .filter(([category, amount]) => amount > averageCategoryExpense * 2)
            .sort(([,a], [,b]) => b - a);

        if (anomalies.length > 0) {
            const [category, amount] = anomalies[0];
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            
            return {
                type: 'info',
                title: 'Высокие расходы по категории',
                message: `Категория "${category}" составляет ${percentage}% от всех расходов. Рассмотрите возможность оптимизации.`,
                icon: 'fas fa-lightbulb',
                priority: 'medium'
            };
        }

        return null;
    }

    generateSavingsRecommendations(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return null;

        const categoryStats = {};
        expenses.forEach(t => {
            categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
        });

        const topCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        const recommendations = [
            'Рассмотрите возможность покупки товаров оптом для экономии',
            'Используйте кэшбэк и скидки для снижения расходов',
            'Составьте план питания для экономии на продуктах',
            'Используйте общественный транспорт вместо такси',
            'Отслеживайте подписки и отменяйте неиспользуемые'
        ];

        const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];

        return {
            type: 'info',
            title: 'Рекомендация по экономии',
            message: randomRecommendation,
            icon: 'fas fa-piggy-bank',
            priority: 'low'
        };
    }

    analyzeBudgetPerformance(transactions) {
        // Mock budget data - in real app this would come from budget settings
        const budgetCategories = {
            'Продукты': 500000,
            'Транспорт': 200000,
            'Развлечения': 300000,
            'Здоровье': 150000
        };

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthExpenses = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear &&
                   t.type === 'expense';
        });

        const categoryExpenses = {};
        monthExpenses.forEach(t => {
            categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
        });

        const overBudgetCategories = Object.entries(categoryExpenses)
            .filter(([category, amount]) => {
                const budget = budgetCategories[category];
                return budget && amount > budget;
            });

        if (overBudgetCategories.length > 0) {
            const [category, amount] = overBudgetCategories[0];
            const budget = budgetCategories[category];
            const overage = amount - budget;
            
            return {
                type: 'warning',
                title: 'Превышение бюджета',
                message: `Категория "${category}" превысила бюджет на ${this.app.formatCurrency(overage)}.`,
                icon: 'fas fa-exclamation-circle',
                priority: 'high'
            };
        }

        return null;
    }

    groupByMonth(transactions) {
        const monthly = {};
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthly[monthKey] = (monthly[monthKey] || 0) + t.amount;
        });
        
        return monthly;
    }

    renderAIRecommendations() {
        const container = document.getElementById('ai-recommendations');
        if (!container) return;

        if (this.insights.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <h3>Нет данных для анализа</h3>
                    <p>Добавьте больше транзакций для получения AI рекомендаций</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                    <span class="insight-priority ${insight.priority}">${this.getPriorityLabel(insight.priority)}</span>
                </div>
            </div>
        `).join('');
    }

    renderPatternAnalysis() {
        const container = document.getElementById('pattern-analysis');
        if (!container) return;

        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const patterns = this.analyzePatterns(transactions);

        if (patterns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Паттерны не найдены</h3>
                    <p>Добавьте больше данных для анализа паттернов</p>
                </div>
            `;
            return;
        }

        container.innerHTML = patterns.map(pattern => `
            <div class="pattern-item">
                <div class="pattern-icon">
                    <i class="${pattern.icon}"></i>
                </div>
                <div class="pattern-content">
                    <h4>${pattern.title}</h4>
                    <p>${pattern.description}</p>
                    <div class="pattern-stats">
                        <span class="stat">Частота: ${pattern.frequency}</span>
                        <span class="stat">Сумма: ${this.app.formatCurrency(pattern.total)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    analyzePatterns(transactions) {
        const patterns = [];

        // Analyze spending by day of week
        const dayOfWeekStats = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const day = new Date(t.date).getDay();
            const dayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][day];
            dayOfWeekStats[dayName] = (dayOfWeekStats[dayName] || 0) + t.amount;
        });

        const maxDay = Object.entries(dayOfWeekStats).reduce((max, [day, amount]) => 
            amount > max.amount ? { day, amount } : max, { day: '', amount: 0 });

        if (maxDay.amount > 0) {
            patterns.push({
                title: 'Пик расходов',
                description: `Больше всего вы тратите по ${maxDay.day.toLowerCase()}м`,
                frequency: 'Еженедельно',
                total: maxDay.amount,
                icon: 'fas fa-calendar-day'
            });
        }

        // Analyze category patterns
        const categoryStats = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
        });

        const topCategory = Object.entries(categoryStats).reduce((max, [category, amount]) => 
            amount > max.amount ? { category, amount } : max, { category: '', amount: 0 });

        if (topCategory.amount > 0) {
            patterns.push({
                title: 'Основная категория',
                description: `"${topCategory.category}" - ваша основная статья расходов`,
                frequency: 'Постоянно',
                total: topCategory.amount,
                icon: 'fas fa-tags'
            });
        }

        return patterns;
    }

    renderGoalsProgress() {
        const container = document.getElementById('goals-progress');
        if (!container) return;

        const goals = this.getFinancialGoals();
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>Цели не установлены</h3>
                    <p>Установите финансовые цели для отслеживания прогресса</p>
                    <button class="btn btn-primary" id="add-goal">Добавить цель</button>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="goal-amount">${this.app.formatCurrency(goal.target)}</span>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <span class="progress-text">${goal.progress}%</span>
                </div>
                <p class="goal-description">${goal.description}</p>
            </div>
        `).join('');
    }

    getFinancialGoals() {
        // Mock goals - in real app this would come from user settings
        return [
            {
                title: 'Накопления',
                description: 'Накопить на отпуск',
                target: 5000000,
                current: 2000000,
                progress: 40
            },
            {
                title: 'Экономия',
                description: 'Снизить расходы на 20%',
                target: 1000000,
                current: 600000,
                progress: 60
            }
        ];
    }

    renderAIForecastChart() {
        const ctx = document.getElementById('ai-forecast-chart');
        if (!ctx) return;

        const data = this.getAIForecastData();
        
        if (window.aiForecastChart) {
            window.aiForecastChart.destroy();
        }

        window.aiForecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Исторические данные',
                        data: data.historical,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'AI Прогноз',
                        data: data.forecast,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                const { locale, currency } = this.getCurrencyFormat();
                                return new Intl.NumberFormat(locale, {
                                    style: 'currency',
                                    currency: currency,
                                    minimumFractionDigits: 0
                                }).format(value);
                            }.bind(this)
                        }
                    }
                }
            }
        });
    }

    getAIForecastData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const months = this.getLastMonths(6);
        
        const historical = months.map(month => {
            return transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate.getMonth() === month.month && 
                           transactionDate.getFullYear() === month.year &&
                           t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0);
        });

        // AI-enhanced forecast with seasonal adjustments
        const forecast = this.calculateAIForecast(historical);

        return {
            labels: [...months.map(m => m.label), 'AI Прогноз 1', 'AI Прогноз 2', 'AI Прогноз 3'],
            historical: historical,
            forecast: [...Array(6).fill(null), ...forecast]
        };
    }

    calculateAIForecast(data) {
        if (data.length < 3) return Array(3).fill(0);
        
        // Enhanced forecasting with seasonal patterns
        const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
        const trend = this.calculateTrend(data);
        const seasonality = this.calculateSeasonality(data);
        
        const forecast = [];
        for (let i = 1; i <= 3; i++) {
            const prediction = avg + (trend * i) + (seasonality * Math.sin(i * Math.PI / 6));
            forecast.push(Math.max(0, prediction));
        }
        
        return forecast;
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = data.reduce((sum, val) => sum + val, 0);
        const sumXY = data.reduce((sum, val, index) => sum + (index * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    calculateSeasonality(data) {
        if (data.length < 6) return 0;
        
        // Simple seasonal factor
        const recent = data.slice(-3);
        const older = data.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        return (recentAvg - olderAvg) / 2;
    }

    getLastMonths(count) {
        const months = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            months.push({
                month: date.getMonth(),
                year: date.getFullYear(),
                label: date.toLocaleDateString('ru-RU', { month: 'short' })
            });
        }
        
        return months;
    }

    getPriorityLabel(priority) {
        const labels = {
            'high': 'Высокий',
            'medium': 'Средний',
            'low': 'Низкий'
        };
        return labels[priority] || 'Средний';
    }

    toggleAIAnalysis(enabled) {
        if (enabled) {
            this.loadAIInsights();
        } else {
            this.clearAIInsights();
        }
    }

    toggleAIRecommendations(enabled) {
        // Implementation for toggling AI recommendations
        console.log('AI recommendations:', enabled);
    }

    toggleAIForecast(enabled) {
        // Implementation for toggling AI forecast
        console.log('AI forecast:', enabled);
    }

    clearAIInsights() {
        const containers = ['ai-recommendations', 'pattern-analysis', 'goals-progress'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-robot"></i>
                        <h3>AI анализ отключен</h3>
                        <p>Включите AI анализ в настройках</p>
                    </div>
                `;
            }
        });
    }

    // Add these methods to the main app
    static extendApp(app) {
        app.loadAIInsights = () => {
            const aiManager = new AIInsightsManager(app);
        };

        app.generateAIInsights = () => {
            if (window.aiInsightsManager) {
                window.aiInsightsManager.generateInsights();
            }
        };
    }
}

// Extend the main app with AI insights methods
if (window.bugalterApp) {
    AIInsightsManager.extendApp(window.bugalterApp);
    window.aiInsightsManager = new AIInsightsManager(window.bugalterApp);
} 