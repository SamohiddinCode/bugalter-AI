# 📋 Технические требования Bugalter AI

Подробная спецификация технических требований для разработки и развертывания проекта.

## 🖥️ Системные требования

### Минимальные требования
- **Операционная система**: Windows 10, macOS 10.15+, Ubuntu 18.04+
- **Процессор**: Intel Core i3 / AMD Ryzen 3 или выше
- **Оперативная память**: 2GB RAM
- **Свободное место**: 100MB на диске
- **Интернет**: Стабильное подключение для API запросов

### Рекомендуемые требования
- **Операционная система**: Windows 11, macOS 12+, Ubuntu 20.04+
- **Процессор**: Intel Core i5 / AMD Ryzen 5 или выше
- **Оперативная память**: 4GB RAM
- **Свободное место**: 500MB на диске
- **Интернет**: Высокоскоростное подключение

## 🛠️ Программные требования

### Обязательные компоненты

#### Python
- **Версия**: 3.7 или выше
- **Назначение**: HTTP сервер для frontend
- **Проверка**: `python3 --version`

#### Node.js
- **Версия**: 18.0.0 или выше
- **Назначение**: Backend сервер
- **Проверка**: `node --version`

#### npm
- **Версия**: 8.0.0 или выше
- **Назначение**: Управление зависимостями
- **Проверка**: `npm --version`

#### Git
- **Версия**: 2.20.0 или выше
- **Назначение**: Контроль версий
- **Проверка**: `git --version`

### Браузеры

#### Поддерживаемые браузеры
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

#### Рекомендуемый браузер
- **Chrome**: 100+ (для лучшей производительности)

## 📦 Зависимости

### Backend зависимости (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.7",
    "dotenv": "^17.2.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend зависимости (CDN)

```html
<!-- Chart.js для графиков -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Font Awesome для иконок -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## 🗄️ База данных

### SQLite3
- **Тип**: Встроенная база данных
- **Файл**: `bugalter_ai.db`
- **Размер**: Автоматическое управление
- **Резервное копирование**: Ручное копирование файла

### Схема базы данных

#### Таблица users
```sql
CREATE TABLE users (
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
);
```

#### Таблица transactions
```sql
CREATE TABLE transactions (
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
);
```

#### Таблица categories
```sql
CREATE TABLE categories (
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
);
```

## 🌐 API требования

### Внешние API

#### Центральный банк Узбекистана
- **URL**: `https://cbu.uz/oz/arkhiv-kursov-valyut/json/`
- **Назначение**: Курсы валют
- **Формат**: JSON
- **Лимиты**: Нет ограничений

#### Exchange Rate API (fallback)
- **URL**: `https://api.exchangerate-api.com/v4/latest/UZS`
- **Назначение**: Резервные курсы валют
- **Формат**: JSON
- **Лимиты**: 1000 запросов в месяц

### Внутренние API

#### Аутентификация
- **Base URL**: `http://localhost:3000/api`
- **Методы**: POST, GET
- **Аутентификация**: JWT токены

#### Транзакции
- **Base URL**: `http://localhost:3000/api/transactions`
- **Методы**: GET, POST, PUT, DELETE
- **Аутентификация**: JWT токены

## 🔐 Безопасность

### Аутентификация
- **Метод**: JWT (JSON Web Tokens)
- **Алгоритм**: HS256
- **Срок действия**: 24 часа
- **Обновление**: Автоматическое

### Хеширование паролей
- **Алгоритм**: bcrypt
- **Соль**: Автоматическая
- **Раунды**: 12

### CORS
- **Настройки**: Разрешены все источники для разработки
- **Продакшн**: Ограничение по доменам

## 📱 Адаптивность

### Разрешения экрана
- **Мобильные**: 320px - 768px
- **Планшеты**: 768px - 1024px
- **Десктопы**: 1024px+

### Поддерживаемые устройства
- **Смартфоны**: iOS 12+, Android 8+
- **Планшеты**: iOS 12+, Android 8+
- **Компьютеры**: Windows, macOS, Linux

## 🚀 Производительность

### Frontend
- **Время загрузки**: < 3 секунды
- **Размер бандла**: < 2MB
- **Оптимизация**: Минификация CSS/JS

### Backend
- **Время ответа API**: < 500ms
- **Память**: < 100MB
- **CPU**: < 10% при обычной нагрузке

### База данных
- **Размер**: < 50MB для 1000 пользователей
- **Запросы**: < 100ms для простых операций
- **Индексы**: Автоматическое создание

## 🔧 Разработка

### Инструменты разработки
- **Редактор**: VS Code (рекомендуется)
- **Отладка**: Chrome DevTools
- **Версионирование**: Git
- **Пакетный менеджер**: npm

### Тестирование
- **Браузеры**: Chrome, Firefox, Safari, Edge
- **Устройства**: Мобильные, планшеты, десктопы
- **Скорость**: Lighthouse тесты

### Мониторинг
- **Логи**: Консоль браузера + серверные логи
- **Ошибки**: JavaScript ошибки + API ошибки
- **Производительность**: Network tab в DevTools

## 📊 Масштабируемость

### Пользователи
- **Текущая архитектура**: До 1000 пользователей
- **Масштабирование**: Переход на PostgreSQL/MySQL
- **Кэширование**: Redis для сессий

### Данные
- **Транзакции**: Неограниченно
- **Хранение**: Локальное + облачное
- **Резервное копирование**: Ежедневно

## 🔄 Обновления

### Автоматические обновления
- **Frontend**: При обновлении страницы
- **Backend**: Перезапуск сервера
- **База данных**: Миграции

### Ручные обновления
- **Зависимости**: `npm update`
- **Код**: Git pull
- **Конфигурация**: Изменение переменных окружения

## 📋 Чек-лист развертывания

### Локальная разработка
- [ ] Python 3.7+ установлен
- [ ] Node.js 18+ установлен
- [ ] Git установлен
- [ ] Проект клонирован
- [ ] Backend зависимости установлены
- [ ] Backend сервер запущен
- [ ] Frontend сервер запущен
- [ ] Приложение открывается в браузере
- [ ] API запросы работают
- [ ] База данных создана

### Продакшн развертывание
- [ ] Сервер настроен
- [ ] Доменное имя настроено
- [ ] SSL сертификат установлен
- [ ] База данных настроена
- [ ] Переменные окружения настроены
- [ ] Мониторинг настроен
- [ ] Резервное копирование настроено
- [ ] Тестирование проведено

---

**Технические требования обновлены для версии 2.0** 🚀 