# Bugalter AI Backend - Документация

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка базы данных
```bash
# Установите PostgreSQL
# Создайте базу данных
psql -U postgres
CREATE DATABASE bugalter_ai;
\q

# Запустите миграции
npm run db:migrate
```

### 3. Настройка переменных окружения
```bash
cp env.example .env
# Отредактируйте .env файл с вашими данными
```

### 4. Запуск сервера
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 📋 API Endpoints

### Аутентификация

#### POST `/api/auth/register`
Регистрация нового пользователя

**Request Body:**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+998 90 123 45 67",
  "accountType": "personal",
  "role": "owner",
  "companyName": "ООО Рога и Копыта"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Код подтверждения отправлен на ваш email",
  "userId": "uuid"
}
```

#### POST `/api/auth/verify`
Подтверждение email кода

**Request Body:**
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email подтвержден. Теперь установите пароль.",
  "userId": "uuid"
}
```

#### POST `/api/auth/set-password`
Установка пароля

**Request Body:**
```json
{
  "userId": "uuid",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Пароль установлен успешно",
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Вход в систему

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Вход выполнен успешно",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "firstName": "Иван",
    "lastName": "Иванов",
    "email": "ivan@example.com",
    "accountType": "personal",
    "role": "owner",
    "companyName": "ООО Рога и Копыта"
  }
}
```

#### POST `/api/auth/resend-code`
Повторная отправка кода

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Новый код подтверждения отправлен"
}
```

### Защищенные маршруты

#### GET `/api/user/profile`
Получение профиля пользователя

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "firstName": "Иван",
    "lastName": "Иванов",
    "email": "ivan@example.com",
    "phone": "+998 90 123 45 67",
    "accountType": "personal",
    "role": "owner",
    "companyName": "ООО Рога и Копыта",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🗄️ Структура базы данных

### Таблица `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    account_type VARCHAR(20) DEFAULT 'personal',
    role VARCHAR(50),
    company_name VARCHAR(255),
    verification_code VARCHAR(6),
    code_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    subscription_plan VARCHAR(20) DEFAULT 'free',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expires TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `transactions`
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID,
    description TEXT,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `categories`
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    parent_id UUID REFERENCES categories(id),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Безопасность

### JWT токены
- Срок действия: 7 дней
- Алгоритм: HS256
- Секретный ключ настраивается в `.env`

### Хеширование паролей
- Алгоритм: bcrypt
- Соль: 10 раундов

### Валидация данных
- Email формат
- Телефон (+998 XX XXX XX XX)
- Минимальная длина пароля: 6 символов
- Обязательные поля

### Rate Limiting
- Ограничение запросов: 100 в 15 минут
- Настраивается в `.env`

## 📧 Email интеграция

### Настройка Gmail
1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения
3. Добавьте в `.env`:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Шаблоны писем
- Код подтверждения
- Сброс пароля
- Уведомления

## 🚀 Развертывание

### Локальная разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Мониторинг

### Логи
- Регистрация пользователей
- Попытки входа
- Ошибки валидации
- Email отправки

### Метрики
- Количество регистраций
- Успешные входы
- Ошибки API
- Время ответа

## 🔧 Конфигурация

### Переменные окружения
```bash
# База данных
DB_USER=postgres
DB_HOST=localhost
DB_NAME=bugalter_ai
DB_PASSWORD=password
DB_PORT=5432

# JWT
JWT_SECRET=your_secret_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Сервер
PORT=3000
NODE_ENV=development
```

## 🧪 Тестирование

### Запуск тестов
```bash
npm test
```

### Тестовые данные
```bash
npm run db:seed
```

## 📝 Логирование

### Уровни логирования
- `error`: Ошибки
- `warn`: Предупреждения
- `info`: Информация
- `debug`: Отладка

### Формат логов
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User registered",
  "userId": "uuid",
  "email": "user@example.com"
}
```

## 🔄 Процесс пользователя

### 1. Регистрация
```
Пользователь → Заполняет форму → Отправляется POST /api/auth/register
→ Генерируется код → Отправляется email → Пользователь вводит код
→ POST /api/auth/verify → Устанавливает пароль → POST /api/auth/set-password
→ Получает JWT токен → Перенаправляется на выбор тарифа
```

### 2. Вход
```
Пользователь → Вводит email/пароль → POST /api/auth/login
→ Проверяется пароль → Генерируется JWT токен → Перенаправляется в приложение
```

### 3. Защищенные маршруты
```
Запрос → Проверяется JWT токен → Middleware authenticateToken
→ Если валидный → Доступ к API → Если невалидный → 401 Unauthorized
```

## 🛠️ Устранение неполадок

### Проблемы с базой данных
```bash
# Проверка подключения
psql -U postgres -d bugalter_ai -c "SELECT 1"

# Сброс базы данных
npm run db:migrate
```

### Проблемы с email
```bash
# Проверка настроек Gmail
# Убедитесь, что включена двухфакторная аутентификация
# Используйте пароль приложения, а не обычный пароль
```

### Проблемы с JWT
```bash
# Проверьте JWT_SECRET в .env
# Убедитесь, что токен не истек
# Проверьте формат Authorization header
```

## 📞 Поддержка

### Логи ошибок
```bash
# Просмотр логов
tail -f logs/error.log

# Поиск ошибок
grep "ERROR" logs/app.log
```

### Мониторинг производительности
```bash
# Использование памяти
node --inspect server.js

# Профилирование
node --prof server.js
``` 