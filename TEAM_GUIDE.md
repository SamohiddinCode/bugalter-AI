# 👥 Руководство команды Bugalter AI

Руководство для разработчиков, дизайнеров и менеджеров проекта.

## 🎯 Обзор проекта

**Bugalter AI** - это современное веб-приложение для управления личными финансами с AI-ассистентом. Проект состоит из frontend (HTML/CSS/JS) и backend (Node.js/Express/SQLite) компонентов.

### Основные цели
- Создать интуитивно понятное приложение для управления финансами
- Интегрировать AI для персональных финансовых рекомендаций
- Обеспечить безопасную аутентификацию и хранение данных
- Поддержать адаптивность для всех устройств

## 👨‍💻 Роли команды

### Frontend разработчик
- **Ответственность**: HTML, CSS, JavaScript, UI/UX
- **Технологии**: HTML5, CSS3, JavaScript ES6+, Chart.js
- **Файлы**: `index.html`, `auth-system.html`, `css/`, `js/`

### Backend разработчик
- **Ответственность**: API, база данных, аутентификация
- **Технологии**: Node.js, Express, SQLite3, JWT
- **Файлы**: `backend/server-sqlite.js`, `backend/notifications.js`

### DevOps инженер
- **Ответственность**: Развертывание, мониторинг, CI/CD
- **Технологии**: Git, GitHub Actions, Docker (планируется)
- **Файлы**: `.github/`, `docker-compose.yml` (планируется)

### QA инженер
- **Ответственность**: Тестирование, баг-репорты, документация
- **Инструменты**: Chrome DevTools, Postman, Lighthouse
- **Документы**: Тест-планы, баг-репорты

## 📁 Структура проекта

```
bugalter_AI/
├── 📄 HTML файлы
│   ├── index.html              # Главное приложение
│   ├── auth-system.html        # Авторизация
│   ├── landing-page.html       # Лендинг
│   └── pricing-page.html       # Тарифы
├── 🎨 CSS файлы
│   ├── style.css              # Основные стили
│   ├── components.css         # Компоненты
│   ├── auth.css              # Авторизация
│   ├── landing.css           # Лендинг
│   └── pricing.css           # Тарифы
├── ⚙️ JavaScript файлы
│   ├── app.js                # Основное приложение
│   ├── auth.js               # Авторизация
│   ├── transactions.js       # Транзакции
│   ├── analytics.js          # Аналитика
│   ├── ai-insights.js        # AI анализ
│   ├── budget.js             # Бюджет
│   ├── goals.js              # Цели
│   ├── reports.js            # Отчеты
│   └── utils.js              # Утилиты
├── 🔧 Backend
│   ├── server-sqlite.js      # Backend сервер
│   ├── notifications.js      # Уведомления
│   └── package.json          # Зависимости
├── 📚 Документация
│   ├── README.md             # Основная документация
│   ├── QUICK_START.md        # Быстрый старт
│   ├── SETUP.md              # Подробная установка
│   ├── REQUIREMENTS.md       # Технические требования
│   └── TEAM_GUIDE.md        # Это руководство
└── 🖼️ Ресурсы
    └── img/
        └── logo.svg          # Логотип
```

## 🔄 Рабочий процесс

### 1. Настройка окружения

```bash
# Клонирование проекта
git clone https://github.com/your-username/bugalter_AI.git
cd bugalter_AI

# Установка зависимостей
cd backend
npm install

# Запуск серверов
# Терминал 1: Backend
node server-sqlite.js

# Терминал 2: Frontend
cd ..
python3 -m http.server 8000
```

### 2. Разработка

#### Создание новой функции
```bash
# Создайте новую ветку
git checkout -b feature/new-feature

# Внесите изменения
# Протестируйте локально

# Создайте коммит
git add .
git commit -m "Add new feature: description"

# Отправьте изменения
git push origin feature/new-feature
```

#### Создание Pull Request
1. Перейдите на GitHub
2. Создайте Pull Request
3. Опишите изменения
4. Добавьте скриншоты (если применимо)
5. Дождитесь ревью

### 3. Тестирование

#### Автоматическое тестирование
```bash
# Проверка синтаксиса JavaScript
node -c js/*.js

# Проверка HTML
# Используйте онлайн валидатор W3C

# Проверка CSS
# Используйте онлайн валидатор W3C
```

#### Ручное тестирование
- [ ] Тестирование в Chrome, Firefox, Safari, Edge
- [ ] Тестирование на мобильных устройствах
- [ ] Проверка адаптивности
- [ ] Тестирование API endpoints
- [ ] Проверка безопасности

## 📋 Стандарты кода

### JavaScript
```javascript
// Используйте camelCase для переменных
const userName = 'John';

// Используйте PascalCase для классов
class BugalterAIApp {
  constructor() {
    // Инициализация
  }
  
  // Используйте snake_case для методов
  async load_user_data() {
    // Код метода
  }
}

// Используйте const для неизменяемых переменных
const API_BASE_URL = 'http://localhost:3000/api';

// Используйте let для изменяемых переменных
let currentUser = null;
```

### CSS
```css
/* Используйте snake_case для классов */
.modal-content {
  /* Стили */
}

/* Группируйте связанные стили */
.button {
  /* Базовые стили */
}

.button--primary {
  /* Модификаторы */
}

.button--large {
  /* Размеры */
}
```

### HTML
```html
<!-- Используйте семантические теги -->
<header class="header">
  <nav class="navbar">
    <!-- Навигация -->
  </nav>
</header>

<main class="main-content">
  <section class="dashboard">
    <!-- Контент -->
  </section>
</main>

<footer class="footer">
  <!-- Подвал -->
</footer>
```

## 🐛 Отладка

### Frontend отладка
```javascript
// Используйте console.log для отладки
console.log('Debug info:', data);

// Используйте debugger для точек останова
debugger;

// Проверьте localStorage
console.log('localStorage:', localStorage.getItem('transactions'));
```

### Backend отладка
```javascript
// Логирование в backend
console.log('API request:', req.body);

// Проверка базы данных
db.all("SELECT * FROM users", (err, rows) => {
  console.log('Users:', rows);
});
```

### Инструменты отладки
- **Chrome DevTools**: Для frontend отладки
- **Postman**: Для API тестирования
- **SQLite Browser**: Для просмотра базы данных
- **VS Code Debugger**: Для backend отладки

## 🔧 Конфигурация

### Переменные окружения
```bash
# Создайте .env файл в backend/
PORT=3000
JWT_SECRET=your-secret-key
TELEGRAM_CHAT_ID=123456789
```

### Настройки разработки
```json
// VS Code settings.json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "files.associations": {
    "*.html": "html",
    "*.css": "css",
    "*.js": "javascript"
  }
}
```

## 📊 Мониторинг

### Логи
- **Frontend**: Консоль браузера (F12)
- **Backend**: Терминал с сервером
- **Ошибки**: Автоматическое логирование

### Метрики
- Время загрузки страницы
- Количество API запросов
- Размер localStorage
- Ошибки JavaScript

## 🚀 Деплой

### Локальная разработка
```bash
# Frontend
python3 -m http.server 8000

# Backend
cd backend && node server-sqlite.js
```

### Продакшн
```bash
# Frontend (GitHub Pages)
git push origin main

# Backend (Heroku/Railway)
git push heroku main
```

## 📚 Ресурсы

### Документация
- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [Chart.js](https://www.chartjs.org/)
- [JWT](https://jwt.io/)

### Инструменты
- [Postman](https://www.postman.com/) - API тестирование
- [SQLite Browser](https://sqlitebrowser.org/) - Просмотр БД
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Аудит производительности

## 🤝 Коммуникация

### Каналы связи
- **GitHub Issues**: Для багов и предложений
- **GitHub Discussions**: Для обсуждений
- **Telegram**: @bugalter_ai_team
- **Email**: team@bugalter-ai.com

### Встречи
- **Еженедельные**: Обзор прогресса
- **Спринт планирование**: Каждые 2 недели
- **Ретроспектива**: В конце спринта

## 📈 Метрики успеха

### Технические метрики
- Время загрузки < 3 секунд
- Время ответа API < 500ms
- Покрытие тестами > 80%
- Количество багов < 5 на релиз

### Бизнес метрики
- Количество активных пользователей
- Время, проведенное в приложении
- Количество транзакций
- Удовлетворенность пользователей

## 🔄 Обновления

### Версионирование
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Changelog**: Автоматическое обновление
- **Release Notes**: Подробное описание изменений

### Миграции
- **База данных**: Автоматические миграции
- **Frontend**: Обратная совместимость
- **API**: Версионирование endpoints

---

**Удачной работы команде! 🚀** 