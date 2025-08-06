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
                const typeDisplay = transaction.type === 'income' ? 'Доход' : 'Расход';
                const categoryDisplay = transaction.category || 'Без категории';
                const sourceDisplay = transaction.source || 'Не указан';
                const commentDisplay = transaction.comment || '';
                
                return `
                <div class="transaction-item" data-transaction-id="${transaction.id}">
                    <div class="transaction-info">
                        <div class="transaction-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-description">
                                <strong>${transaction.description || 'Без описания'}</strong>
                            </div>
                            <div class="transaction-meta">
                                <span class="transaction-type-badge ${transaction.type}">
                                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                                    ${typeDisplay}
                                </span>
                                <span class="transaction-category">
                                    <i class="fas fa-tag"></i>
                                    ${categoryDisplay}
                                </span>
                                <span class="transaction-source">
                                    <i class="fas fa-building"></i>
                                    ${sourceDisplay}
                                </span>
                            </div>
                            ${commentDisplay ? `<div class="transaction-comment"><i class="fas fa-comment"></i> ${commentDisplay}</div>` : ''}
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <div class="amount ${transaction.type}">
                            ${amountDisplay}
                        </div>
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn-sm btn-outline" onclick="window.bugalterApp.transactionManager.editTransaction('${transaction.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.bugalterApp.transactionManager.deleteTransaction('${transaction.id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
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
        
        // Показываем уведомление
        this.app.showNotification('Транзакция удалена', 'success');
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
        }).catch(error => {
            console.error('Ошибка отображения транзакций:', error);
        });
    }
}

// Делаем TransactionManager глобально доступным
window.TransactionManager = TransactionManager; 