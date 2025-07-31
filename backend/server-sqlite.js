const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { sendVerificationCode, sendResendCode } = require('./notifications');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SQLite Database
const db = new sqlite3.Database('./bugalter_ai.db');

// Initialize database
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT,
        account_type TEXT DEFAULT 'personal',
        role TEXT,
        company_name TEXT,
        verification_code TEXT,
        code_expiry TEXT,
        is_verified INTEGER DEFAULT 0,
        subscription_plan TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        subscription_expires TEXT,
        settings TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        organization_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'UZS',
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category_id TEXT,
        description TEXT,
        date TEXT NOT NULL,
        source TEXT DEFAULT 'manual',
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        organization_id TEXT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        parent_id TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default categories
    const defaultCategories = [
        ['Зарплата', '#10b981', 'income', 1],
        ['Фриланс', '#3b82f6', 'income', 1],
        ['Инвестиции', '#f59e0b', 'income', 1],
        ['Продажи', '#8b5cf6', 'income', 1],
        ['Другие доходы', '#6b7280', 'income', 1],
        ['Продукты', '#ef4444', 'expense', 1],
        ['Транспорт', '#f97316', 'expense', 1],
        ['Развлечения', '#ec4899', 'expense', 1],
        ['Здоровье', '#06b6d4', 'expense', 1],
        ['Образование', '#84cc16', 'expense', 1],
        ['Одежда', '#a855f7', 'expense', 1],
        ['Коммунальные услуги', '#64748b', 'expense', 1],
        ['Интернет и связь', '#0ea5e9', 'expense', 1],
        ['Другие расходы', '#6b7280', 'expense', 1]
    ];

    const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (id, name, color, type, is_default) 
                                     VALUES (?, ?, ?, ?, ?)`);
    
    defaultCategories.forEach(([name, color, type, isDefault]) => {
        const id = Math.random().toString(36).substr(2, 9);
        insertCategory.run(id, name, color, type, isDefault);
    });
    insertCategory.finalize();
});





// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Bugalter AI Backend API (SQLite)' });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            accountType, 
            role, 
            companyName 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ 
                error: 'Все обязательные поля должны быть заполнены' 
            });
        }

        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            if (row) {
                return res.status(400).json({ 
                    error: 'Пользователь с таким email уже существует' 
                });
            }

            // Generate verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000);
            const codeExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            const userId = Math.random().toString(36).substr(2, 9);

            // Create user record
            db.run(`INSERT INTO users (
                id, first_name, last_name, email, phone, 
                account_type, role, company_name, 
                verification_code, code_expiry, is_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, firstName, lastName, email, phone, accountType, role, companyName, verificationCode, codeExpiry, 0],
            async function(err) {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ error: 'Ошибка при создании пользователя' });
                }

                // Send verification code via email and Telegram
                const notificationResults = await sendVerificationCode(
                    email, 
                    firstName, 
                    verificationCode,
                    process.env.TELEGRAM_CHAT_ID
                );
                
                console.log('📧 Email result:', notificationResults.email);
                if (notificationResults.telegram) {
                    console.log('🤖 Telegram result:', notificationResults.telegram);
                }

                res.json({ 
                    success: true, 
                    message: 'Код подтверждения отправлен на ваш email',
                    userId: userId
                });
            });
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Ошибка при регистрации. Попробуйте еще раз.' 
        });
    }
});

// Verify code endpoint
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ 
                error: 'Необходимы ID пользователя и код подтверждения' 
            });
        }

        // Check user and code
        db.get('SELECT * FROM users WHERE id = ? AND verification_code = ? AND code_expiry > datetime("now")',
        [userId, code], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            if (!row) {
                return res.status(400).json({ 
                    error: 'Неверный код или код истек' 
                });
            }

            // Mark user as verified
            db.run('UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?',
            [userId], function(err) {
                if (err) {
                    console.error('Update error:', err);
                    return res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
                }

                res.json({ 
                    success: true, 
                    message: 'Email подтвержден. Теперь установите пароль.',
                    userId: userId
                });
            });
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            error: 'Ошибка при подтверждении кода' 
        });
    }
});

// Set password endpoint
app.post('/api/auth/set-password', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ 
                error: 'Необходимы ID пользователя и пароль' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Пароль должен содержать минимум 6 символов' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user with password
        db.run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
        [hashedPassword, userId], function(err) {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ error: 'Ошибка при обновлении пароля' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: userId },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({ 
                success: true, 
                message: 'Пароль установлен успешно',
                token: token
            });
        });

    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ 
            error: 'Ошибка при установке пароля' 
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Необходимы email и пароль' 
            });
        }

        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            if (!row) {
                return res.status(400).json({ 
                    error: 'Пользователь не найден' 
                });
            }

            // Check if user is verified
            if (!row.is_verified) {
                return res.status(400).json({ 
                    error: 'Email не подтвержден. Проверьте почту.' 
                });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, row.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({ 
                    error: 'Неверный пароль' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: row.id },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({ 
                success: true, 
                message: 'Вход выполнен успешно',
                token: token,
                user: {
                    id: row.id,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    email: row.email,
                    accountType: row.account_type,
                    role: row.role,
                    companyName: row.company_name
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Ошибка при входе' 
        });
    }
});

// Resend verification code
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { userId } = req.body;

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const codeExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Update user with new code
        db.get('UPDATE users SET verification_code = ?, code_expiry = ? WHERE id = ? RETURNING email, first_name',
        [verificationCode, codeExpiry, userId], async (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            if (!row) {
                return res.status(400).json({ 
                    error: 'Пользователь не найден' 
                });
            }

            // Send new verification code via email and Telegram
            const notificationResults = await sendResendCode(
                row.email, 
                row.first_name, 
                verificationCode,
                process.env.TELEGRAM_CHAT_ID
            );
            
            console.log('📧 Email result:', notificationResults.email);
            if (notificationResults.telegram) {
                console.log('🤖 Telegram result:', notificationResults.telegram);
            }

            res.json({ 
                success: true, 
                message: 'Новый код подтверждения отправлен' 
            });
        });

    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({ 
            error: 'Ошибка при отправке кода' 
        });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, first_name, last_name, email, phone, account_type, role, company_name, created_at FROM users WHERE id = ?',
    [req.user.userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ user: row });
    });
});

// ===== TRANSACTIONS API =====

// Get all transactions for user
app.get('/api/transactions', authenticateToken, (req, res) => {
    const { page = 1, limit = 20, type, category, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    let params = [req.user.userId];
    
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    
    if (category) {
        query += ' AND category_id = ?';
        params.push(category);
    }
    
    if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
    }
    
    if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
    }
    
    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        res.json({ transactions: rows });
    });
});

// Get transaction by ID
app.get('/api/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', 
    [id, req.user.userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }
        
        res.json({ transaction: row });
    });
});

// Create new transaction
app.post('/api/transactions', authenticateToken, (req, res) => {
    const { amount, type, category_id, description, date, currency = 'UZS' } = req.body;
    
    if (!amount || !type || !date) {
        return res.status(400).json({ error: 'Необходимы сумма, тип и дата' });
    }
    
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Тип должен быть income или expense' });
    }
    
    const transactionId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    db.run(`INSERT INTO transactions (
        id, user_id, amount, currency, type, category_id, 
        description, date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [transactionId, req.user.userId, amount, currency, type, category_id, description, date, now, now],
    function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка при создании транзакции' });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Транзакция создана',
            transactionId: transactionId
        });
    });
});

// Update transaction
app.put('/api/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { amount, type, category_id, description, date, currency } = req.body;
    
    if (!amount || !type || !date) {
        return res.status(400).json({ error: 'Необходимы сумма, тип и дата' });
    }
    
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Тип должен быть income или expense' });
    }
    
    const now = new Date().toISOString();
    
    db.run(`UPDATE transactions SET 
        amount = ?, currency = ?, type = ?, category_id = ?, 
        description = ?, date = ?, updated_at = ?
        WHERE id = ? AND user_id = ?`,
    [amount, currency, type, category_id, description, date, now, id, req.user.userId],
    function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка при обновлении транзакции' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }
        
        res.json({ 
            success: true, 
            message: 'Транзакция обновлена'
        });
    });
});

// Delete transaction
app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?',
    [id, req.user.userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка при удалении транзакции' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }
        
        res.json({ 
            success: true, 
            message: 'Транзакция удалена'
        });
    });
});

// Get transaction statistics
app.get('/api/transactions/stats', authenticateToken, (req, res) => {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT type, SUM(amount) as total FROM transactions WHERE user_id = ?';
    let params = [req.user.userId];
    
    if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
    }
    
    if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
    }
    
    query += ' GROUP BY type';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        const stats = {
            income: 0,
            expense: 0,
            balance: 0
        };
        
        rows.forEach(row => {
            if (row.type === 'income') {
                stats.income = row.total;
            } else if (row.type === 'expense') {
                stats.expense = row.total;
            }
        });
        
        stats.balance = stats.income - stats.expense;
        
        res.json({ stats });
    });
});

// ===== CATEGORIES API =====

// Get all categories for user
app.get('/api/categories', authenticateToken, (req, res) => {
    const { type } = req.query;
    
    let query = 'SELECT * FROM categories WHERE user_id = ? OR is_default = 1';
    let params = [req.user.userId];
    
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    
    query += ' ORDER BY name';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        res.json({ categories: rows });
    });
});

// Create new category
app.post('/api/categories', authenticateToken, (req, res) => {
    const { name, color, type, icon } = req.body;
    
    if (!name || !color || !type) {
        return res.status(400).json({ error: 'Необходимы название, цвет и тип' });
    }
    
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Тип должен быть income или expense' });
    }
    
    const categoryId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    db.run(`INSERT INTO categories (
        id, user_id, name, color, icon, type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, req.user.userId, name, color, icon, type, now],
    function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Ошибка при создании категории' });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Категория создана',
            categoryId: categoryId
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Bugalter AI Backend running on port ${PORT}`);
    console.log(`📧 Mock email mode enabled`);
    console.log(`🗄️ SQLite database: bugalter_ai.db`);
    console.log(`🔗 API: http://localhost:${PORT}`);
});

module.exports = app; 