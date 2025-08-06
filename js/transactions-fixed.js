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

    async apiRequest(endpoint, method = 'GET', data = null) {
        const apiBaseUrl = this.app.apiBaseUrl || 'http://localhost:3000/api';
        
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : null
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to localStorage
            throw error;
        }
    }

    async loadTransactions() {
        try {
            const response = await this.apiRequest('/transactions');
            this.transactions = response.transactions || [];
            this.filteredTransactions = this.transactions;
            return this.transactions;
        } catch (error) {
            console.log('API недоступен, загружаем из localStorage...');
            // Fallback to localStorage
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            this.transactions = transactions;
            this.filteredTransactions = transactions;
            return transactions;
        }
    }

    async createTransaction(transactionData) {
        try {
            const response = await this.apiRequest('/transactions', 'POST', transactionData);
            this.transactions.push(response.transaction);
            this.saveToLocalStorage();
            return response.transaction;
        } catch (error) {
            console.log('API недоступен, сохраняем в localStorage...');
            // Fallback to localStorage
            const transaction = {
                id: Date.now(),
                ...transactionData,
                createdAt: new Date().toISOString()
            };
            this.transactions.push(transaction);
            this.saveToLocalStorage();
            return transaction;
        }
    }

    async updateTransaction(id, transactionData) {
        try {
            const response = await this.apiRequest(`/transactions/${id}`, 'PUT', transactionData);
            const index = this.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                this.transactions[index] = response.transaction;
                this.saveToLocalStorage();
            }
            return response.transaction;
        } catch (error) {
            console.log('API недоступен, обновляем в localStorage...');
            // Fallback to localStorage
            const index = this.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                this.transactions[index] = { ...this.transactions[index], ...transactionData };
                this.saveToLocalStorage();
            }
            return this.transactions[index];
        }
    }

    async deleteTransaction(id) {
        try {
            await this.apiRequest(`/transactions/${id}`, 'DELETE');
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
        } catch (error) {
            console.log('API недоступен, удаляем из localStorage...');
            // Fallback to localStorage
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
        }
    }

    async loadCategories() {
        try {
            const response = await this.apiRequest('/categories');
            return response.categories || [];
        } catch (error) {
            console.log('API недоступен, используем стандартные категории...');
            // Fallback to default categories
            return [
                { id: 'salary', name: 'Зарплата', type: 'income' },
                { id: 'freelance', name: 'Фриланс', type: 'income' },
                { id: 'investment', name: 'Инвестиции', type: 'income' },
                { id: 'food', name: 'Продукты', type: 'expense' },
                { id: 'transport', name: 'Транспорт', type: 'expense' },
                { id: 'entertainment', name: 'Развлечения', type: 'expense' },
                { id: 'shopping', name: 'Покупки', type: 'expense' },
                { id: 'health', name: 'Здоровье', type: 'expense' }
            ];
        }
    }

    async loadStats() {
        try {
            const response = await this.apiRequest('/transactions/stats');
            return response.stats || {};
        } catch (error) {
            console.log('API недоступен, вычисляем статистику локально...');
            // Fallback to local calculation
            const transactions = this.transactions;
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const totalExpense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            return {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                count: transactions.length
            };
        }
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
            this.filteredTransactions = this.filterTransactions(transactions);
            console.log('Отфильтрованные транзакции:', this.filteredTransactions);
            
            // Применяем фильтр по периоду если мы на дашборде
            if (this.app.currentSection === 'dashboard' && this.app.currentPeriod) {
                this.filteredTransactions = this.app.filterTransactionsByPeriod(this.filteredTransactions, this.app.currentPeriod);
            }
            
            // Сортируем по дате (новые сначала)
            this.filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
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
                // Определяем примечание для транзакций в минусе
                let note = '';
                if (transaction.type === 'expense') {
                    note = 'Транзакция в минусе по доходности';
                }
                
                // Обрабатываем разные форматы категорий
                const categoryId = transaction.category_id || transaction.category;
                const categoryName = this.getCategoryName(categoryId);
                const categoryColor = this.getCategoryColor(categoryId);
                
                // Обрабатываем сумму
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
                            <div class="transaction-category">
                                <span class="category-badge" style="background-color: ${categoryColor}">
                                    ${categoryName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <div class="amount ${transaction.type}">
                            ${amountDisplay}
                        </div>
                        <div class="transaction-type">
                            <span class="type-badge ${transaction.type}">
                                ${transaction.type === 'income' ? 'Доход' : 'Расход'}
                            </span>
                        </div>
                        ${note ? `<div class="transaction-note"><span class="note-badge">${note}</span></div>` : ''}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn-sm btn-outline" data-action="edit" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" data-action="duplicate" title="Дублировать">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="delete" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-text" data-action="more" title="Еще">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                `;
            }).join('');
            
            // Обновляем аналитику
            this.updateAnalytics(this.filteredTransactions);
            
            // Инициализируем обработчики событий
            this.initializeTransactionHandlers();
            
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

    filterTransactions(transactions) {
        return transactions.filter(transaction => {
            const matchesSearch = !this.currentFilters.search || 
                (transaction.description && transaction.description.toLowerCase().includes(this.currentFilters.search.toLowerCase()));
            
            const matchesCategory = !this.currentFilters.category || 
                transaction.category_id === this.currentFilters.category;
            
            const matchesType = !this.currentFilters.type || 
                transaction.type === this.currentFilters.type;
            
            const matchesDate = !this.currentFilters.date || 
                transaction.date === this.currentFilters.date;
            
            return matchesSearch && matchesCategory && matchesType && matchesDate;
        });
    }

    async setupTransactionFilters() {
        const searchInput = document.getElementById('search-transactions');
        const categoryFilter = document.getElementById('category-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');

        // Populate category filter
        await this.populateCategoryFilter();

        // Setup filter event listeners
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.renderTransactionsTable();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.renderTransactionsTable();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.renderTransactionsTable();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilters.date = e.target.value;
                this.renderTransactionsTable();
            });
        }
    }

    async populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        try {
            const categories = await this.loadCategories();
            
            categoryFilter.innerHTML = `
                <option value="">Все категории</option>
                ${categories.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    getCategoryColor(categoryId) {
        if (!categoryId) return '#6c757d';
        
        // Генерируем цвет на основе ID категории
        const colors = [
            '#007bff', '#28a745', '#ffc107', '#dc3545',
            '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
        ];
        
        const hash = categoryId.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }

    getCategoryName(categoryId) {
        if (!categoryId) return 'Без категории';
        
        const categoryMap = {
            'salary': 'Зарплата',
            'freelance': 'Фриланс',
            'investment': 'Инвестиции',
            'food': 'Продукты',
            'transport': 'Транспорт',
            'entertainment': 'Развлечения',
            'shopping': 'Покупки',
            'health': 'Здоровье'
        };
        
        return categoryMap[categoryId] || categoryId;
    }

    async editTransaction(transactionId) {
        const transaction = this.filteredTransactions.find(t => t.id.toString() === transactionId);
        if (transaction) {
            // Здесь можно показать модальное окно редактирования
            console.log('Редактирование транзакции:', transaction);
            this.app.showNotification('Функция редактирования в разработке', 'info');
        }
    }

    async deleteTransaction(transactionId) {
        const transaction = this.filteredTransactions.find(t => t.id.toString() === transactionId);
        if (transaction) {
            if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
                await this.deleteTransaction(transaction.id);
                this.renderTransactionsTable();
                this.app.showNotification('Транзакция удалена', 'success');
            }
        }
    }

    async exportTransactions() {
        try {
            const csv = this.convertToCSV(this.filteredTransactions);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.app.showNotification('Ошибка экспорта', 'error');
        }
    }

    convertToCSV(transactions) {
        const headers = ['Дата', 'Описание', 'Категория', 'Тип', 'Сумма'];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('ru-RU'),
            t.description || '',
            this.getCategoryName(t.category),
            t.type === 'income' ? 'Доход' : 'Расход',
            Math.abs(t.amount)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    showSuccess(message) {
        this.app.showNotification(message, 'success');
    }

    showError(message) {
        this.app.showNotification(message, 'error');
    }

    updateAnalytics(transactions) {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const balance = totalIncome - totalExpense;
        const count = transactions.length;

        document.getElementById('total-income')?.textContent = this.app.formatCurrency(totalIncome);
        document.getElementById('total-expense')?.textContent = this.app.formatCurrency(totalExpense);
        document.getElementById('total-balance')?.textContent = this.app.formatCurrency(balance);
        document.getElementById('transactions-count')?.textContent = count;
    }

    initializeTransactionHandlers() {
        // Обработчики для кнопок действий в транзакциях
        document.querySelectorAll('.transaction-actions .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const transactionId = btn.closest('.transaction-item').dataset.transactionId;
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'edit':
                        this.editTransaction(transactionId);
                        break;
                    case 'delete':
                        this.deleteTransaction(transactionId);
                        break;
                    case 'duplicate':
                        this.duplicateTransaction(transactionId);
                        break;
                    case 'more':
                        this.showTransactionActions(transactionId);
                        break;
                }
            });
        });
    }

    editTransaction(transactionId) {
        // Найти транзакцию и показать форму редактирования
        const transaction = this.filteredTransactions.find(t => t.id.toString() === transactionId);
        if (transaction) {
            // Здесь можно показать модальное окно редактирования
            console.log('Редактирование транзакции:', transaction);
            this.app.showNotification('Функция редактирования в разработке', 'info');
        }
    }

    duplicateTransaction(transactionId) {
        const transaction = this.filteredTransactions.find(t => t.id.toString() === transactionId);
        if (transaction) {
            const duplicatedTransaction = {
                ...transaction,
                id: Date.now(),
                description: `${transaction.description} (копия)`,
                date: new Date().toISOString().split('T')[0]
            };
            
            this.createTransaction(duplicatedTransaction);
            this.app.showNotification('Транзакция продублирована', 'success');
        }
    }

    showTransactionActions(transactionId) {
        const transaction = this.filteredTransactions.find(t => t.id.toString() === transactionId);
        if (transaction) {
            // Показать модальное окно с действиями
            const modal = document.getElementById('transaction-actions-modal');
            const details = document.getElementById('transaction-details');
            
            if (modal && details) {
                details.innerHTML = `
                    <h4>${transaction.description || 'Без описания'}</h4>
                    <p><strong>Категория:</strong> ${this.getCategoryName(transaction.category)}</p>
                    <p><strong>Сумма:</strong> ${this.app.formatCurrency(Math.abs(transaction.amount))}</p>
                    <p><strong>Дата:</strong> ${new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                `;
                
                modal.classList.add('active');
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
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