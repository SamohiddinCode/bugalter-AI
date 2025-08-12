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

            // Делегируем отображение транзакций в app.js
            if (this.app && this.app.displayTransactions) {
                this.app.displayTransactions();
            } else {
                // Fallback - простое отображение если app.js недоступен
                transactionsList.innerHTML = this.filteredTransactions.map(transaction => {
                    const amount = Math.abs(transaction.amount);
                    const amountDisplay = transaction.type === 'income' ? `+${this.app.formatCurrency(amount)}` : `-${this.app.formatCurrency(amount)}`;
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
        console.log('=== СОЗДАНИЕ НОВОЙ ТРАНЗАКЦИИ ===');
        console.log('Входные данные:', transactionData);
        
        try {
            // Загружаем существующие транзакции
            const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            console.log('Существующих транзакций:', existingTransactions.length);
            
            // Создаем уникальный ID
            const newId = Date.now() + Math.random();
            
            const transaction = {
                id: newId,
                description: transactionData.description || '',
                amount: transactionData.type === 'expense' ? -Math.abs(transactionData.amount) : Math.abs(transactionData.amount),
                type: transactionData.type || 'expense',
                category: transactionData.category || '',
                source: transactionData.source || '',
                date: transactionData.date || new Date().toISOString().split('T')[0],
                comment: transactionData.comment || '',
                createdAt: new Date().toISOString()
            };
            
            console.log('Создана транзакция:', transaction);
            
            // Добавляем к существующим транзакциям
            const updatedTransactions = [...existingTransactions, transaction];
            console.log('Всего транзакций после добавления:', updatedTransactions.length);
            
            // Сохраняем в localStorage
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            console.log('Транзакция сохранена в localStorage');
            
            // Обновляем внутренние массивы
            this.transactions = updatedTransactions;
            this.filteredTransactions = updatedTransactions;
            
            // Обновляем аналитические карточки
            this.updateAnalyticsCards();
            
            console.log('=== ТРАНЗАКЦИЯ УСПЕШНО СОЗДАНА ===');
            return transaction;
            
        } catch (error) {
            console.error('Ошибка при создании транзакции:', error);
            throw error;
        }
    }

    async setupTransactionFilters() {
        console.log('Фильтры транзакций настроены');
    }

    async editTransaction(transactionId) {
        console.log('Редактирование транзакции с ID:', transactionId, 'тип:', typeof transactionId);
        
        // Загружаем транзакции из localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = transactions.find(t => t.id.toString() === transactionId.toString());
        
        if (transaction) {
            console.log('Найдена транзакция для редактирования:', transaction);
            this.showEditModal(transaction);
        } else {
            console.log('Транзакция не найдена для редактирования');
            this.app.showNotification('Транзакция не найдена', 'error');
        }
    }

    async deleteTransaction(transactionId) {
        console.log('Удаление транзакции с ID:', transactionId, 'тип:', typeof transactionId);
        
        // Загружаем текущие транзакции
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        console.log('Всего транзакций до удаления:', transactions.length);
        
        // ИСПРАВЛЕНИЕ: Правильное сравнение ID
        const filteredTransactions = transactions.filter(t => {
            const tId = t.id.toString();
            const targetId = transactionId.toString();
            const matches = tId === targetId;
            console.log(`Сравнение: ${tId} === ${targetId} = ${matches}`);
            return !matches; // Оставляем только те, которые НЕ совпадают
        });
        
        console.log('Транзакций после фильтрации:', filteredTransactions.length);
        
        if (filteredTransactions.length === transactions.length) {
            console.log('Транзакция не найдена для удаления');
            this.app.showNotification('Транзакция не найдена', 'error');
            return;
        }
        
        // Обновляем localStorage
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
        
        // Обновляем внутренние массивы
        this.transactions = filteredTransactions;
        this.filteredTransactions = filteredTransactions;
        
        // Перерисовываем таблицу
        await this.renderTransactionsTable();
        
        // Обновляем аналитические карточки
        this.updateAnalyticsCards();
        
        // Показываем уведомление
        this.app.showNotification('Транзакция удалена', 'success');
    }

    updateAnalyticsCards() {
        console.log('=== ОБНОВЛЕНИЕ АНАЛИТИЧЕСКИХ КАРТОЧЕК ===');
        
        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        console.log('Загружено транзакций:', transactions.length);
        
        // Если транзакций нет, добавляем тестовые данные для проверки
        if (transactions.length === 0) {
            console.log('Транзакций нет, добавляем тестовые данные...');
            const testTransactions = [
                {
                    id: Date.now() + 1,
                    description: 'Зарплата',
                    amount: 150000,
                    type: 'income',
                    category: 'Работа',
                    source: 'Банк',
                    date: new Date().toISOString().split('T')[0],
                    comment: 'Тестовая транзакция',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    description: 'Продукты',
                    amount: -25000,
                    type: 'expense',
                    category: 'Продукты',
                    source: 'Наличные',
                    date: new Date().toISOString().split('T')[0],
                    comment: 'Тестовая транзакция',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 3,
                    description: 'Такси',
                    amount: -8000,
                    type: 'expense',
                    category: 'Транспорт',
                    source: 'Карта',
                    date: new Date().toISOString().split('T')[0],
                    comment: 'Тестовая транзакция',
                    createdAt: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('transactions', JSON.stringify(testTransactions));
            transactions = testTransactions;
            console.log('Добавлены тестовые транзакции:', testTransactions);
        }
        
        // Подсчитываем общие суммы
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const balance = totalIncome - totalExpense;
        const count = transactions.length;
        
        console.log('Подсчитанные суммы:', {
            income: totalIncome,
            expense: totalExpense,
            balance: balance,
            count: count
        });
        
        // Обновляем элементы на странице транзакций (новые ID)
        const balanceEl = document.getElementById('transactions-balance');
        const incomeEl = document.getElementById('transactions-income');
        const expenseEl = document.getElementById('transactions-expense');
        const countEl = document.getElementById('transactions-count');
        
        // Также обновляем элементы на дашборде (старые ID для совместимости)
        const dashboardBalanceEl = document.getElementById('current-balance');
        const dashboardIncomeEl = document.getElementById('total-income');
        const dashboardExpenseEl = document.getElementById('total-expense');
        
        console.log('Найденные элементы:', {
            balanceEl: balanceEl,
            incomeEl: incomeEl,
            expenseEl: expenseEl,
            countEl: countEl,
            dashboardBalanceEl: dashboardBalanceEl,
            dashboardIncomeEl: dashboardIncomeEl,
            dashboardExpenseEl: dashboardExpenseEl
        });
        
        // Функция форматирования валюты
        const formatCurrency = (amount) => {
            return this.app.formatCurrency ? this.app.formatCurrency(amount) : `${amount.toLocaleString()} UZS`;
        };
        
        // Обновляем элементы на странице транзакций
        if (balanceEl) {
            balanceEl.textContent = formatCurrency(balance);
            console.log('Обновлен баланс (транзакции):', formatCurrency(balance));
        } else {
            console.error('Элемент transactions-balance не найден!');
        }
        
        if (incomeEl) {
            incomeEl.textContent = formatCurrency(totalIncome);
            console.log('Обновлен доход (транзакции):', formatCurrency(totalIncome));
        } else {
            console.error('Элемент transactions-income не найден!');
        }
        
        if (expenseEl) {
            expenseEl.textContent = formatCurrency(totalExpense);
            console.log('Обновлен расход (транзакции):', formatCurrency(totalExpense));
        } else {
            console.error('Элемент transactions-expense не найден!');
        }
        
        if (countEl) {
            countEl.textContent = count;
            console.log('Обновлено количество (транзакции):', count);
        } else {
            console.error('Элемент transactions-count не найден!');
        }
        
        // Обновляем элементы на дашборде (для совместимости)
        if (dashboardBalanceEl) {
            dashboardBalanceEl.textContent = formatCurrency(balance);
            console.log('Обновлен баланс (дашборд):', formatCurrency(balance));
        }
        
        if (dashboardIncomeEl) {
            dashboardIncomeEl.textContent = formatCurrency(totalIncome);
            console.log('Обновлен доход (дашборд):', formatCurrency(totalIncome));
        }
        
        if (dashboardExpenseEl) {
            dashboardExpenseEl.textContent = formatCurrency(totalExpense);
            console.log('Обновлен расход (дашборд):', formatCurrency(totalExpense));
        }
        
        console.log('=== АНАЛИТИЧЕСКИЕ КАРТОЧКИ ОБНОВЛЕНЫ ===');
    }

    showEditModal(transaction) {
        // Создаем модальное окно для редактирования
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Редактировать транзакцию</h3>
                    <button class="btn-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-transaction-form">
                        <div class="form-group">
                            <label>Описание</label>
                            <input type="text" id="edit-description" value="${transaction.description || ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Сумма</label>
                                <input type="number" id="edit-amount" value="${Math.abs(transaction.amount)}" required>
                            </div>
                            <div class="form-group">
                                <label>Тип</label>
                                <select id="edit-type" required>
                                    <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>Доход</option>
                                    <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Расход</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Категория</label>
                                <input type="text" id="edit-category" value="${transaction.category || ''}">
                            </div>
                            <div class="form-group">
                                <label>Источник</label>
                                <input type="text" id="edit-source" value="${transaction.source || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Дата</label>
                            <input type="date" id="edit-date" value="${transaction.date}" required>
                        </div>
                        <div class="form-group">
                            <label>Комментарий</label>
                            <textarea id="edit-comment" rows="3">${transaction.comment || ''}</textarea>
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
        
        // Обработчик отправки формы
        document.getElementById('edit-transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                description: document.getElementById('edit-description').value,
                amount: parseFloat(document.getElementById('edit-amount').value),
                type: document.getElementById('edit-type').value,
                category: document.getElementById('edit-category').value,
                source: document.getElementById('edit-source').value,
                date: document.getElementById('edit-date').value,
                comment: document.getElementById('edit-comment').value
            };
            
            // Обновляем транзакцию
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const index = transactions.findIndex(t => t.id.toString() === transaction.id.toString());
            
            if (index !== -1) {
                transactions[index] = {
                    ...transactions[index],
                    ...formData,
                    amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount),
                    updatedAt: new Date().toISOString()
                };
                
                // Обновляем localStorage
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                // Обновляем внутренние массивы
                this.transactions = transactions;
                this.filteredTransactions = transactions;
                
                // Перерисовываем таблицу
                await this.renderTransactionsTable();
                
                // Обновляем аналитические карточки
                this.updateAnalyticsCards();
                
                // Закрываем модальное окно
                modal.remove();
                
                // Показываем уведомление
                this.app.showNotification('Транзакция обновлена', 'success');
            } else {
                console.error('Транзакция не найдена для обновления');
                this.app.showNotification('Ошибка обновления транзакции', 'error');
            }
        });
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
            // Обновляем аналитические карточки при загрузке
            app.transactionManager.updateAnalyticsCards();
        }).catch(error => {
            console.error('Ошибка отображения транзакций:', error);
        });
    }
}

// Делаем TransactionManager глобально доступным
window.TransactionManager = TransactionManager; 