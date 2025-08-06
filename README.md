# Bugalter AI — Персональный бюджетный ассистент

Современное веб-приложение для управления личными финансами с AI-ассистентом.

## 🚀 Быстрый старт

```bash
# Клонируйте проект
git clone https://github.com/your-username/bugalter_AI.git
cd bugalter_AI

# Запустите frontend сервер
python3 -m http.server 8000

# В новом терминале запустите backend сервер
cd backend
npm install
node server-sqlite.js

# Откройте в браузере
# http://localhost:8000
```

## 📁 Структура проекта

```
bugalter_AI/
├── index.html              # Главное приложение
├── auth-system.html        # Авторизация
├── landing-page.html       # Лендинг
├── pricing-page.html       # Тарифы
├── css/
│   ├── style.css          # Основные стили
│   ├── components.css     # Компоненты
│   ├── auth.css          # Авторизация
│   ├── landing.css       # Лендинг
│   └── pricing.css       # Тарифы
├── js/
│   ├── app.js            # Основное приложение
│   ├── auth.js           # Авторизация
│   ├── transactions.js   # Транзакции
│   ├── analytics.js      # Аналитика
│   ├── ai-insights.js    # AI анализ
│   ├── budget.js         # Бюджет
│   ├── goals.js          # Цели
│   ├── reports.js        # Отчеты
│   └── utils.js          # Утилиты
├── backend/
│   ├── server-sqlite.js  # Backend сервер
│   ├── notifications.js  # Уведомления
│   └── package.json      # Зависимости
└── img/
    └── logo.svg          # Логотип
```

## 🎯 Основные функции

- **💰 Быстрое добавление транзакций** - Простая форма для доходов и расходов
- **📊 Аналитика** - Графики и отчеты по периодам
- **💱 Курсы валют** - Актуальные курсы ЦБ Узбекистана
- **🤖 AI Ассистент** - Персональные финансовые рекомендации
- **🎯 Цели** - Планирование и отслеживание финансовых целей
- **⚙️ Настройки** - Язык, валюта, тема
- **🔐 Авторизация** - Регистрация и вход в систему

## 🛠 Технологии

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Графики**: Chart.js
- **Иконки**: Font Awesome 6
- **Хранение**: localStorage

### Backend
- **Node.js + Express**
- **База данных**: SQLite3
- **Аутентификация**: JWT
- **API**: RESTful endpoints

## 📖 Использование

1. **Запустите серверы**:
   ```bash
   # Frontend (порт 8000)
   python3 -m http.server 8000
   
   # Backend (порт 3000)
   cd backend && node server-sqlite.js
   ```

2. **Откройте приложение**: `http://localhost:8000`

3. **Зарегистрируйтесь**: Перейдите на страницу авторизации

4. **Добавьте транзакции**: Используйте "Быстрое добавление"

5. **Просматривайте аналитику**: Графики и отчеты

## 🔧 Разработка

### Установка зависимостей
```bash
# Backend зависимости
cd backend
npm install

# Frontend не требует установки зависимостей
# Все библиотеки загружаются через CDN
```

### Запуск в режиме разработки
```bash
# Frontend сервер
python3 -m http.server 8000

# Backend сервер
cd backend
node server-sqlite.js
```

### API Endpoints

#### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/verify` - Подтверждение email
- `POST /api/auth/resend-code` - Повторная отправка кода

#### Транзакции
- `GET /api/transactions` - Получить транзакции
- `POST /api/transactions` - Создать транзакцию
- `PUT /api/transactions/:id` - Обновить транзакцию
- `DELETE /api/transactions/:id` - Удалить транзакцию

## 📚 Документация

- `QUICK_START.md` - Быстрый старт
- `SETUP.md` - Подробная установка
- `REQUIREMENTS.md` - Технические требования
- `TEAM_GUIDE.md` - Руководство команды

## 🚀 Деплой

### Локальная разработка
```bash
# Frontend
python3 -m http.server 8000

# Backend
cd backend && node server-sqlite.js
```

### Продакшн
- **Frontend**: GitHub Pages, Netlify, Vercel
- **Backend**: Heroku, Railway, DigitalOcean

## 🐛 Устранение неполадок

### Ошибка "Failed to fetch"
1. Убедитесь, что backend сервер запущен на порту 3000
2. Проверьте, что все зависимости установлены
3. Проверьте консоль браузера на ошибки CORS

### Проблемы с авторизацией
1. Проверьте, что база данных создана
2. Убедитесь, что JWT_SECRET настроен
3. Проверьте логи backend сервера

### Курсы валют не загружаются
1. Проверьте интернет соединение
2. API может быть временно недоступен
3. Используются fallback данные

## 🤝 Вклад в проект

1. **Fork** репозитория
2. **Создайте** ветку для новой функции
3. **Внесите** изменения
4. **Создайте** Pull Request

## 📞 Поддержка

- **Issues**: GitHub Issues
- **Email**: support@bugalter-ai.com
- **Telegram**: @bugalter_ai_support

---

**Bugalter AI** - Умный помощник для управления личными финансами 💰 