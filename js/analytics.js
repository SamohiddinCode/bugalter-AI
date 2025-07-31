// Analytics and Charts Management
class AnalyticsManager {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.currentPeriod = 'month';
        this.init();
    }

    init() {
        this.setupChartPeriods();
        this.loadAnalyticsData();
    }

    setupChartPeriods() {
        const periodButtons = document.querySelectorAll('[data-period]');
        
        periodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons in the same group
                const parent = e.target.closest('.period-selector');
                parent.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update current period
                this.currentPeriod = e.target.getAttribute('data-period');
                
                // Re-render charts
                this.updateCharts();
            });
        });
    }

    loadAnalyticsData() {
        this.renderIncomeExpenseChart();
        this.renderCategoryPieChart();
        this.renderTrendsChart();
        this.renderComparisonChart();
        this.renderBudgetChart();
        this.renderForecastChart();
    }

    updateCharts() {
        this.renderIncomeExpenseChart();
        this.renderTrendsChart();
        this.renderComparisonChart();
    }

    renderIncomeExpenseChart() {
        const ctx = document.getElementById('income-expense-chart');
        if (!ctx) return;

        const data = this.getIncomeExpenseData();
        
        if (this.charts.incomeExpense) {
            this.charts.incomeExpense.destroy();
        }

        this.charts.incomeExpense = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: data.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Расходы',
                        data: data.expense,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderCategoryPieChart() {
        const ctx = document.getElementById('category-pie-chart');
        if (!ctx) return;

        const data = this.getCategoryData();
        
        if (this.charts.categoryPie) {
            this.charts.categoryPie.destroy();
        }

        this.charts.categoryPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderTrendsChart() {
        const ctx = document.getElementById('trends-chart');
        if (!ctx) return;

        const data = this.getTrendsData();
        
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Расходы',
                        data: data.expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Прогноз',
                        data: data.forecast,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
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
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderComparisonChart() {
        const ctx = document.getElementById('comparison-chart');
        if (!ctx) return;

        const data = this.getComparisonData();
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }

        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Текущий период',
                        data: data.current,
                        backgroundColor: '#3b82f6',
                    },
                    {
                        label: 'Предыдущий период',
                        data: data.previous,
                        backgroundColor: '#94a3b8',
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
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderBudgetChart() {
        const ctx = document.getElementById('budget-chart');
        if (!ctx) return;

        const data = this.getBudgetData();
        
        if (this.charts.budget) {
            this.charts.budget.destroy();
        }

        this.charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Бюджет',
                        data: data.budget,
                        backgroundColor: '#10b981',
                    },
                    {
                        label: 'Факт',
                        data: data.actual,
                        backgroundColor: '#ef4444',
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
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderForecastChart() {
        const ctx = document.getElementById('forecast-chart');
        if (!ctx) return;

        const data = this.getForecastData();
        
        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        this.charts.forecast = new Chart(ctx, {
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
                        label: 'Прогноз',
                        data: data.forecast,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'UZS',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    getIncomeExpenseData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const periodData = this.getPeriodData(transactions);
        
        return {
            labels: periodData.labels,
            income: periodData.income,
            expense: periodData.expense
        };
    }

    getCategoryData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        const categoryStats = {};
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
            });

        const sortedCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: sortedCategories.map(([category]) => category),
            values: sortedCategories.map(([, amount]) => amount),
            colors: sortedCategories.map(([category]) => {
                const categoryData = categories.find(c => c.name === category);
                return categoryData ? categoryData.color : '#64748b';
            })
        };
    }

    getTrendsData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const months = this.getLastMonths(6);
        
        const expenses = months.map(month => {
            return transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate.getMonth() === month.month && 
                           transactionDate.getFullYear() === month.year &&
                           t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0);
        });

        // Simple forecast based on trend
        const forecast = this.calculateForecast(expenses);

        return {
            labels: months.map(m => m.label),
            expenses: expenses,
            forecast: forecast
        };
    }

    getComparisonData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const categories = ['Продукты', 'Транспорт', 'Развлечения', 'Здоровье', 'Одежда'];
        
        const currentPeriod = this.getCurrentPeriod();
        const previousPeriod = this.getPreviousPeriod();
        
        const current = categories.map(category => {
            return transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= currentPeriod.start && 
                           transactionDate <= currentPeriod.end &&
                           t.category === category &&
                           t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0);
        });

        const previous = categories.map(category => {
            return transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= previousPeriod.start && 
                           transactionDate <= previousPeriod.end &&
                           t.category === category &&
                           t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0);
        });

        return {
            labels: categories,
            current: current,
            previous: previous
        };
    }

    getBudgetData() {
        // Mock budget data - in real app this would come from budget settings
        const categories = ['Продукты', 'Транспорт', 'Развлечения', 'Здоровье'];
        const budget = [500000, 200000, 300000, 150000];
        
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const currentPeriod = this.getCurrentPeriod();
        
        const actual = categories.map(category => {
            return transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= currentPeriod.start && 
                           transactionDate <= currentPeriod.end &&
                           t.category === category &&
                           t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0);
        });

        return {
            labels: categories,
            budget: budget,
            actual: actual
        };
    }

    getForecastData() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const months = this.getLastMonths(12);
        
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

        // Generate forecast for next 3 months
        const forecast = this.calculateForecast(historical.slice(-6), 3);

        return {
            labels: [...months.map(m => m.label), 'Прогноз 1', 'Прогноз 2', 'Прогноз 3'],
            historical: historical,
            forecast: [...Array(9).fill(null), ...forecast]
        };
    }

    getPeriodData(transactions) {
        const now = new Date();
        let labels = [];
        let income = [];
        let expense = [];

        switch (this.currentPeriod) {
            case 'week':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
                    
                    const dayTransactions = transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate.toDateString() === date.toDateString();
                    });
                    
                    income.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                    expense.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
                }
                break;
                
            case 'month':
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    labels.push(date.getDate().toString());
                    
                    const dayTransactions = transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate.toDateString() === date.toDateString();
                    });
                    
                    income.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                    expense.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
                }
                break;
                
            case 'quarter':
                for (let i = 2; i >= 0; i--) {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - i);
                    labels.push(date.toLocaleDateString('ru-RU', { month: 'short' }));
                    
                    const monthTransactions = transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate.getMonth() === date.getMonth() && 
                               transactionDate.getFullYear() === date.getFullYear();
                    });
                    
                    income.push(monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                    expense.push(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
                }
                break;
        }

        return { labels, income, expense };
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

    getCurrentPeriod() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
    }

    getPreviousPeriod() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
    }

    calculateForecast(data, periods = 3) {
        if (data.length < 2) return Array(periods).fill(0);
        
        // Simple linear regression
        const n = data.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = data.reduce((sum, val) => sum + val, 0);
        const sumXY = data.reduce((sum, val, index) => sum + (index * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const forecast = [];
        for (let i = 1; i <= periods; i++) {
            const prediction = slope * (n + i - 1) + intercept;
            forecast.push(Math.max(0, prediction));
        }
        
        return forecast;
    }

    // Add these methods to the main app
    static extendApp(app) {
        app.loadAnalyticsData = () => {
            const analyticsManager = new AnalyticsManager(app);
        };

        app.updateCharts = () => {
            if (window.analyticsManager) {
                window.analyticsManager.updateCharts();
            }
        };
    }
}

// Extend the main app with analytics methods
if (window.bugalterApp) {
    AnalyticsManager.extendApp(window.bugalterApp);
    window.analyticsManager = new AnalyticsManager(window.bugalterApp);
} 