class TransactionManager {
    constructor(app) {
        this.app = app;
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentFilters = {
            search: '',
            category: '',
            type: '',
            date: ''
        };
    }

    async renderTransactionsTable() {
        console.log('renderTransactionsTable вызван');
        const transactionsList = document.getElementById('transactions-list');
        console.log('transactionsList элемент:', transactionsList);
        
        if (!transactionsList) {
            console.error('Элемент transactions-list не найден');
            return;
        }

        try {
            // Загружаем транзакции напрямую из localStorage для отладки
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            console.log('Загруженные транзакции:', transactions);
            
            // Применяем фильтры
            this.filteredTransactions = transactions;
            console.log('Отфильтрованные транзакции:', this.filteredTransactions);
            
            if (this.filteredTransactions.length === 0) {
                transactionsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>Нет транзакций</h3>
                        <p>Добавьте первую транзакцию или измените фильтры</p>
                        <button class="btn btn-primary" onclick="window.bugalterApp.showQuickAddModal()">
                            <i class="fas fa-plus"></i>
                            Добавить транзакцию
                        </button>
                    </div>
                `;
                return;
            }

            transactionsList.innerHTML = this.filteredTransactions.map(transaction => {
                const amount = Math.abs(transaction.amount);
                const amountDisplay = transaction.type === 'income' ? `+${this.app.formatCurrency(amount)}` : `-${this.app.formatCurrency(amount)}`;
                
                return `
                <div class="transaction-item" data-transaction-id="${transaction.id}">
                    <div class="transaction-info">
                        <div class="transaction-date">
                            ${new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-description">
                                ${transaction.description || 'Без описания'}
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <div class="amount ${transaction.type}">
                            ${amountDisplay}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
            
            console.log('Транзакции успешно отображены');
        } catch (error) {
            console.error('Error rendering transactions:', error);
            transactionsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить транзакции: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.bugalterApp.transactionManager.renderTransactionsTable()">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    async createTransaction(transactionData) {
        const transaction = {
            id: Date.now(),
            ...transactionData,
            createdAt: new Date().toISOString()
        };
        this.transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        return transaction;
    }

    async setupTransactionFilters() {
        console.log('Фильтры транзакций настроены');
    }

    static extendApp(app) {
        console.log('Инициализация TransactionManager...');
        app.transactionManager = new TransactionManager(app);
        console.log('TransactionManager создан:', app.transactionManager);
        
        // Устанавливаем фильтры
        app.transactionManager.setupTransactionFilters().then(() => {
            console.log('Фильтры транзакций настроены');
        }).catch(error => {
            console.error('Ошибка настройки фильтров:', error);
        });
        
        // Отображаем транзакции
        app.transactionManager.renderTransactionsTable().then(() => {
            console.log('Транзакции отображены');
        }).catch(error => {
            console.error('Ошибка отображения транзакций:', error);
        });
    }
}

// Делаем TransactionManager глобально доступным
window.TransactionManager = TransactionManager; 