// Reports and Analytics
class ReportsManager {
    constructor(app) {
        this.app = app;
        this.currentPeriod = 'quarter';
    }

    loadReportsData() {
        this.setupPeriodSelector();
        this.renderFinancialOverview();
        this.renderTopCategories();
    }

    setupPeriodSelector() {
        const periodButtons = document.querySelectorAll('[data-period]');
        
        periodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                periodButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update current period
                this.currentPeriod = e.target.getAttribute('data-period');
                
                // Re-render reports
                this.renderFinancialOverview();
                this.renderTopCategories();
            });
        });
    }

    renderFinancialOverview() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const periodData = this.getPeriodData(transactions);
        
        const container = document.getElementById('financial-chart');
        if (!container) return;

        // Simple chart using HTML/CSS for now
        // In a real app, you'd use Chart.js or similar
        container.innerHTML = this.createSimpleChart(periodData);
    }

    renderTopCategories() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        const categoryStats = {};
        
        // Calculate expenses by category for the current period
        const periodTransactions = this.getTransactionsForPeriod(transactions);
        
        periodTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
            });

        const container = document.getElementById('top-categories');
        if (!container) return;

        if (Object.keys(categoryStats).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Нет данных</h3>
                    <p>Добавьте расходы для анализа по категориям</p>
                </div>
            `;
            return;
        }

        const sortedCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const totalExpenses = Object.values(categoryStats).reduce((sum, amount) => sum + amount, 0);

        container.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            const categoryData = categories.find(c => c.name === category);
            
            return `
                <div class="category-item">
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${categoryData?.color || '#64748b'}"></div>
                        <div class="category-details">
                            <span class="category-name">${category}</span>
                            <span class="category-percentage">${percentage}%</span>
                        </div>
                    </div>
                    <span class="transaction-amount expense">${this.app.formatCurrency(amount)}</span>
                </div>
            `;
        }).join('');
    }

    getPeriodData(transactions) {
        const now = new Date();
        let startDate, endDate;
        
        switch (this.currentPeriod) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        const periodTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        return {
            income: periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
            expense: periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            balance: periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                     periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            transactions: periodTransactions.length
        };
    }

    getTransactionsForPeriod(transactions) {
        const now = new Date();
        let startDate, endDate;
        
        switch (this.currentPeriod) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    createSimpleChart(data) {
        const total = data.income + data.expense;
        const incomePercentage = total > 0 ? (data.income / total) * 100 : 0;
        const expensePercentage = total > 0 ? (data.expense / total) * 100 : 0;

        return `
            <div class="chart-container">
                <div class="chart-summary">
                    <div class="summary-item">
                        <h4>Доходы</h4>
                        <p class="amount income">${this.app.formatCurrency(data.income)}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Расходы</h4>
                        <p class="amount expense">${this.app.formatCurrency(data.expense)}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Баланс</h4>
                        <p class="amount ${data.balance >= 0 ? 'income' : 'expense'}">${this.app.formatCurrency(data.balance)}</p>
                    </div>
                </div>
                <div class="chart-bars">
                    <div class="chart-bar income" style="width: ${incomePercentage}%">
                        <span class="bar-label">Доходы ${incomePercentage.toFixed(1)}%</span>
                    </div>
                    <div class="chart-bar expense" style="width: ${expensePercentage}%">
                        <span class="bar-label">Расходы ${expensePercentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateReport() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const periodData = this.getPeriodData(transactions);
        const periodTransactions = this.getTransactionsForPeriod(transactions);
        
        const report = {
            period: this.currentPeriod,
            date: new Date().toLocaleDateString('ru-RU'),
            summary: periodData,
            transactions: periodTransactions,
            categories: this.getCategoryBreakdown(periodTransactions)
        };

        this.downloadReport(report);
    }

    getCategoryBreakdown(transactions) {
        const categories = {};
        
        transactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = {
                    income: 0,
                    expense: 0,
                    count: 0
                };
            }
            
            categories[transaction.category][transaction.type] += transaction.amount;
            categories[transaction.category].count++;
        });

        return categories;
    }

    downloadReport(report) {
        const reportText = this.formatReport(report);
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.txt`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    formatReport(report) {
        const periodNames = {
            'month': 'Месяц',
            'quarter': 'Квартал',
            'year': 'Год'
        };

        let reportText = `ФИНАНСОВЫЙ ОТЧЕТ\n`;
        reportText += `Период: ${periodNames[report.period]}\n`;
        reportText += `Дата: ${report.date}\n`;
        reportText += `\n`;
        reportText += `ОБЩАЯ СВОДКА:\n`;
        reportText += `Доходы: ${this.app.formatCurrency(report.summary.income)}\n`;
        reportText += `Расходы: ${this.app.formatCurrency(report.summary.expense)}\n`;
        reportText += `Баланс: ${this.app.formatCurrency(report.summary.balance)}\n`;
        reportText += `Количество транзакций: ${report.summary.transactions}\n`;
        reportText += `\n`;
        reportText += `ДЕТАЛИ ПО КАТЕГОРИЯМ:\n`;
        
        Object.entries(report.categories).forEach(([category, data]) => {
            reportText += `${category}:\n`;
            reportText += `  Доходы: ${this.app.formatCurrency(data.income)}\n`;
            reportText += `  Расходы: ${this.app.formatCurrency(data.expense)}\n`;
            reportText += `  Количество: ${data.count}\n`;
            reportText += `\n`;
        });

        return reportText;
    }

    // Add these methods to the main app
    static extendApp(app) {
        app.loadReportsData = () => {
            const reportsManager = new ReportsManager(app);
            reportsManager.loadReportsData();
        };

        app.generateReport = () => {
            const reportsManager = new ReportsManager(app);
            reportsManager.generateReport();
        };
    }
}

// Extend the main app with reports methods
if (window.bugalterApp) {
    ReportsManager.extendApp(window.bugalterApp);
} 