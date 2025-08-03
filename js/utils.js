// Utility Functions
class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('ru-RU');
    }

    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateAmount(amount) {
        return !isNaN(amount) && amount > 0;
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }

    static getRandomColor() {
        const colors = [
            '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#059669', '#dc2626', '#7c3aed', '#0891b2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static exportToCSV(data, filename) {
        const csvContent = this.convertArrayToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    static convertArrayToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    static importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    const data = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                            const row = {};
                            
                            headers.forEach((header, index) => {
                                row[header] = values[index] || '';
                            });
                            
                            data.push(row);
                        }
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    static showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
    }

    static hideLoading(element, content) {
        element.innerHTML = content;
    }

    static showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    static showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    static showWarning(message) {
        const notification = document.createElement('div');
        notification.className = 'notification warning';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    static showInfo(message) {
        const notification = document.createElement('div');
        notification.className = 'notification info';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    static confirmAction(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Подтверждение</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <div class="form-actions">
                            <button class="btn btn-secondary" id="cancel-action">Отмена</button>
                            <button class="btn btn-primary" id="confirm-action">Подтвердить</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const cancelBtn = modal.querySelector('#cancel-action');
            const confirmBtn = modal.querySelector('#confirm-action');
            
            const cleanup = () => {
                modal.remove();
            };
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }

    static promptInput(message, defaultValue = '') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Ввод</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <div class="form-group">
                            <input type="text" id="prompt-input" class="input" value="${defaultValue}" placeholder="Введите значение">
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-secondary" id="cancel-prompt">Отмена</button>
                            <button class="btn btn-primary" id="confirm-prompt">OK</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const input = modal.querySelector('#prompt-input');
            const cancelBtn = modal.querySelector('#cancel-prompt');
            const confirmBtn = modal.querySelector('#confirm-prompt');
            
            const cleanup = () => {
                modal.remove();
            };
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(null);
            });
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(input.value);
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    cleanup();
                    resolve(input.value);
                }
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cleanup();
                    resolve(null);
                }
            });
            
            input.focus();
        });
    }

    static getMonthName(month) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month];
    }

    static getQuarterName(quarter) {
        const quarters = ['I квартал', 'II квартал', 'III квартал', 'IV квартал'];
        return quarters[quarter];
    }

    static getCurrentPeriod() {
        const now = new Date();
        return {
            month: now.getMonth(),
            quarter: Math.floor(now.getMonth() / 3),
            year: now.getFullYear()
        };
    }

    static calculatePercentage(value, total) {
        return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, direction = 'asc') {
        return array.sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    static filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = item[key];
                
                if (filterValue === null || filterValue === undefined || filterValue === '') {
                    return true;
                }
                
                if (typeof filterValue === 'string') {
                    return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                }
                
                return itemValue === filterValue;
            });
        });
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static mergeObjects(target, source) {
        return { ...target, ...source };
    }

    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static formatNumber(number, locale = 'ru-RU') {
        return new Intl.NumberFormat(locale).format(number);
    }

    static formatCurrency(amount, currency = null, locale = null) {
        // Get currency and language from localStorage if not provided
        if (!currency) {
            currency = localStorage.getItem('currency') || 'RUB';
        }
        if (!locale) {
            const language = localStorage.getItem('language') || 'ru';
            if (language === 'en') locale = 'en-US';
            else if (language === 'uz') locale = 'uz-UZ';
            else locale = 'ru-RU';
        }
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    static getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'Только что';
    }

    static isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    static parseDate(dateString) {
        const date = new Date(dateString);
        return this.isValidDate(date) ? date : null;
    }

    static getDateRange(period) {
        const now = new Date();
        let start, end;

        switch (period) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                start = new Date(now.getFullYear(), now.getMonth(), diff);
                end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                end = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        return { start, end };
    }
}

// Make Utils available globally
window.Utils = Utils; 