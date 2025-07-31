// Transactions Management
class TransactionManager {
    constructor(app) {
        this.app = app;
        this.filteredTransactions = [];
        this.currentFilters = {
            search: '',
            category: '',
            type: '',
            date: ''
        };
        this.apiBaseUrl = 'http://localhost:3000/api';
    }

    // API Helper Methods
    async apiRequest(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async loadTransactions() {
        try {
            const params = new URLSearchParams();
            if (this.currentFilters.type) params.append('type', this.currentFilters.type);
            if (this.currentFilters.category) params.append('category', this.currentFilters.category);
            if (this.currentFilters.date) params.append('startDate', this.currentFilters.date);
            
            const result = await this.apiRequest(`/transactions?${params.toString()}`);
            return result.transactions || [];
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showError('Ошибка при загрузке транзакций');
            return [];
        }
    }

    async createTransaction(transactionData) {
        try {
            const result = await this.apiRequest('/transactions', 'POST', transactionData);
            this.showSuccess('Транзакция создана успешно');
            return result.transactionId;
        } catch (error) {
            console.error('Error creating transaction:', error);
            this.showError(error.message || 'Ошибка при создании транзакции');
            throw error;
        }
    }

    async updateTransaction(id, transactionData) {
        try {
            await this.apiRequest(`/transactions/${id}`, 'PUT', transactionData);
            this.showSuccess('Транзакция обновлена успешно');
        } catch (error) {
            console.error('Error updating transaction:', error);
            this.showError(error.message || 'Ошибка при обновлении транзакции');
            throw error;
        }
    }

    async deleteTransaction(id) {
        try {
            await this.apiRequest(`/transactions/${id}`, 'DELETE');
            this.showSuccess('Транзакция удалена успешно');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showError(error.message || 'Ошибка при удалении транзакции');
            throw error;
        }
    }

    async loadCategories() {
        try {
            const result = await this.apiRequest('/categories');
            return result.categories || [];
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    async loadStats() {
        try {
            const result = await this.apiRequest('/transactions/stats');
            return result.stats || { income: 0, expense: 0, balance: 0 };
        } catch (error) {
            console.error('Error loading stats:', error);
            return { income: 0, expense: 0, balance: 0 };
        }
    }

    async renderTransactionsTable() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        try {
            const transactions = await this.loadTransactions();
            this.filteredTransactions = this.filterTransactions(transactions);

            if (this.filteredTransactions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h3>Нет транзакций</h3>
                            <p>Добавьте первую транзакцию или измените фильтры</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = this.filteredTransactions.map(transaction => `
                <tr>
                    <td>${new Date(transaction.date).toLocaleDateString('ru-RU')}</td>
                    <td>${transaction.description || 'Без описания'}</td>
                    <td>
                        <span class="category-badge" style="background-color: ${this.getCategoryColor(transaction.category_id)}">
                            ${this.getCategoryName(transaction.category_id)}
                        </span>
                    </td>
                    <td class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.app.formatCurrency(transaction.amount)}
                    </td>
                    <td>
                        <span class="type-badge ${transaction.type}">
                            ${transaction.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-text" onclick="window.bugalterApp.editTransaction('${transaction.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-text" onclick="window.bugalterApp.deleteTransaction('${transaction.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error rendering transactions:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка загрузки</h3>
                        <p>Не удалось загрузить транзакции</p>
                    </td>
                </tr>
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
            console.error('Error populating category filter:', error);
        }
    }

    getCategoryColor(categoryId) {
        // This would need to be implemented with actual category data
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
        return colors[Math.abs(categoryId.hashCode()) % colors.length];
    }

    getCategoryName(categoryId) {
        // This would need to be implemented with actual category data
        return 'Категория';
    }

    async editTransaction(transactionId) {
        try {
            const result = await this.apiRequest(`/transactions/${transactionId}`);
            const transaction = result.transaction;
            
            // Populate edit form
            document.getElementById('edit-transaction-id').value = transaction.id;
            document.getElementById('edit-amount').value = transaction.amount;
            document.getElementById('edit-type').value = transaction.type;
            document.getElementById('edit-category').value = transaction.category_id || '';
            document.getElementById('edit-description').value = transaction.description || '';
            document.getElementById('edit-date').value = transaction.date;
            
            // Show edit modal
            document.getElementById('edit-transaction-modal').style.display = 'block';
        } catch (error) {
            console.error('Error loading transaction for edit:', error);
            this.showError('Ошибка при загрузке транзакции');
        }
    }

    async deleteTransaction(transactionId) {
        if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            return;
        }

        try {
            await this.deleteTransaction(transactionId);
            this.renderTransactionsTable();
            this.app.updateDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    async exportTransactions() {
        try {
            const transactions = await this.loadTransactions();
            const csv = this.convertToCSV(transactions);
            
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
            console.error('Error exporting transactions:', error);
            this.showError('Ошибка при экспорте транзакций');
        }
    }

    convertToCSV(transactions) {
        const headers = ['Дата', 'Описание', 'Категория', 'Сумма', 'Тип'];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('ru-RU'),
            t.description || '',
            this.getCategoryName(t.category_id),
            t.amount,
            t.type === 'income' ? 'Доход' : 'Расход'
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    showSuccess(message) {
        // Implement success notification
        console.log('Success:', message);
    }

    showError(message) {
        // Implement error notification
        console.error('Error:', message);
    }

    static extendApp(app) {
        app.transactionManager = new TransactionManager(app);
        app.transactionManager.setupTransactionFilters();
        app.transactionManager.renderTransactionsTable();
    }
} 