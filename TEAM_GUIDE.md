# 👥 Руководство команды Bugalter AI

Руководство для разработчиков по работе с проектом.

## 🎯 Обзор проекта

**Bugalter AI** — персональный бюджетный ассистент с AI-функциями для управления личными финансами.

### Основные компоненты
- **Frontend**: HTML/CSS/JavaScript (без фреймворков)
- **Backend**: Node.js + SQLite (опционально)
- **API**: Центральный банк Узбекистана (курсы валют)
- **Хранение**: localStorage (браузер)

## 🚀 Быстрый старт для команды

### 1. Настройка окружения
```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/bugalter_AI.git
cd bugalter_AI

# Установите зависимости (если используете backend)
cd backend && npm install && cd ..

# Запустите сервер
python3 -m http.server 8000
```

### 2. Откройте приложение
```
http://localhost:8000
```

## 📁 Структура проекта

```
bugalter_AI/
├── 📄 Основные файлы
│   ├── index.html              # Главное приложение
│   ├── auth-system.html        # Авторизация
│   ├── landing-page.html       # Лендинг
│   └── pricing-page.html       # Тарифы
├── 🎨 Стили
│   ├── css/style.css           # Основные стили
│   ├── css/components.css      # Компоненты
│   ├── css/auth.css           # Авторизация
│   ├── css/landing.css        # Лендинг
│   └── css/pricing.css        # Тарифы
├── ⚙️ JavaScript
│   ├── js/app.js              # Основное приложение
│   ├── js/auth.js             # Авторизация
│   ├── js/transactions.js     # Транзакции
│   ├── js/analytics.js        # Аналитика
│   ├── js/ai-insights.js      # AI анализ
│   ├── js/reports.js          # Отчеты
│   ├── js/utils.js            # Утилиты
│   └── js/landing.js          # Лендинг
├── 🔧 Backend (опционально)
│   ├── backend/server-sqlite.js
│   ├── backend/package.json
│   └── backend/bugalter_ai.db
└── 📚 Документация
    ├── README.md              # Основная документация
    ├── SETUP.md               # Установка и настройка
    ├── QUICK_START.md         # Быстрый старт
    ├── REQUIREMENTS.md         # Технические требования
    └── TEAM_GUIDE.md          # Это руководство
```

## 👨‍💻 Роли в команде

### Frontend разработчик
**Ответственность:**
- HTML структура
- CSS стили и адаптивность
- JavaScript функциональность
- UI/UX компоненты

**Файлы для работы:**
- `index.html`, `auth-system.html`
- `css/` папка
- `js/` папка

### Backend разработчик
**Ответственность:**
- API сервер
- База данных
- Аутентификация
- Интеграции

**Файлы для работы:**
- `backend/` папка
- `server-sqlite.js`
- `package.json`

### UI/UX дизайнер
**Ответственность:**
- Дизайн интерфейса
- Прототипы
- Адаптивность
- Анимации

**Файлы для работы:**
- `css/style.css`
- `css/components.css`
- `img/` папка

### QA тестировщик
**Ответственность:**
- Функциональное тестирование
- Кроссбраузерное тестирование
- Тестирование на мобильных устройствах
- Отчеты об ошибках

## 🔧 Рабочий процесс

### 1. Получение задачи
```bash
# Создайте ветку для задачи
git checkout -b feature/task-name

# Убедитесь, что у вас последняя версия
git pull origin main
```

### 2. Разработка
```bash
# Запустите сервер для разработки
python3 -m http.server 8000

# Откройте в браузере
# http://localhost:8000
```

### 3. Тестирование
```bash
# Проверьте в разных браузерах
# Chrome, Firefox, Safari, Edge

# Проверьте на мобильных устройствах
# Используйте DevTools для эмуляции
```

### 4. Коммит и Push
```bash
# Добавьте изменения
git add .

# Создайте коммит
git commit -m "feat: add new feature"

# Отправьте изменения
git push origin feature/task-name
```

### 5. Pull Request
1. Создайте Pull Request на GitHub
2. Опишите изменения
3. Добавьте скриншоты (если нужно)
4. Дождитесь ревью

## 📋 Стандарты кодирования

### JavaScript
```javascript
// Используйте camelCase для переменных
const userName = 'John';

// Используйте PascalCase для классов
class BugalterAIApp {
  constructor() {
    // Инициализация
  }
  
  // Используйте camelCase для методов
  loadDashboardData() {
    // Логика
  }
}

// Используйте const для неизменяемых переменных
const API_URL = 'https://cbu.uz/oz/arkhiv-kursov-valyut/json/';

// Используйте let для изменяемых переменных
let currentUser = null;
```

### CSS
```css
/* Используйте kebab-case для классов */
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
<header>
  <nav>
    <ul>
      <li><a href="#dashboard">Дашборд</a></li>
    </ul>
  </nav>
</header>

<main>
  <section id="dashboard">
    <!-- Контент -->
  </section>
</main>

<footer>
  <!-- Футер -->
</footer>
```

## 🐛 Отладка

### Консоль браузера
```javascript
// Откройте DevTools (F12)
// Перейдите на вкладку Console

// Проверьте localStorage
console.log(localStorage.getItem('transactions'));

// Проверьте курсы валют
console.log(localStorage.getItem('exchangeRates'));

// Проверьте ошибки
console.error('Ошибка:', error);
```

### Сетевые запросы
```javascript
// Откройте DevTools → Network
// Проверьте запросы к API

// Тестирование API
fetch('https://cbu.uz/oz/arkhiv-kursov-valyut/json/USD/')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('API Error:', error));
```

### Производительность
```javascript
// Откройте DevTools → Performance
// Запишите профиль производительности

// Проверьте использование памяти
console.log('Memory usage:', performance.memory);
```

## 📊 Тестирование

### Функциональное тестирование
- [ ] Регистрация и вход
- [ ] Добавление транзакций
- [ ] Редактирование транзакций
- [ ] Удаление транзакций
- [ ] Фильтрация и поиск
- [ ] Экспорт данных
- [ ] Импорт данных
- [ ] Настройки (язык, валюта, тема)
- [ ] Курсы валют
- [ ] AI ассистент

### Кроссбраузерное тестирование
- [ ] Chrome (основной)
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Мобильные браузеры

### Тестирование на устройствах
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Планшеты
- [ ] Десктопы

## 🚀 Деплой

### Тестовый деплой
```bash
# Создайте ветку для тестирования
git checkout -b staging/test-feature

# Отправьте на GitHub
git push origin staging/test-feature

# Настройте GitHub Pages для этой ветки
# Или используйте Netlify/Vercel
```

### Продакшн деплой
```bash
# Убедитесь, что все тесты пройдены
# Создайте Pull Request в main
# После ревью и одобрения

git checkout main
git pull origin main
git merge feature/new-feature

# Отправьте в продакшн
git push origin main
```

## 📞 Коммуникация

### Ежедневные встречи
- **Время**: 10:00 (местное время)
- **Длительность**: 15 минут
- **Формат**: Онлайн/офлайн

### Еженедельные ретроспективы
- **Время**: Пятница 16:00
- **Длительность**: 30 минут
- **Цель**: Обсуждение проблем и улучшений

### Каналы связи
- **Slack**: #bugalter-ai-dev
- **Email**: dev@bugalter-ai.com
- **GitHub**: Issues и Discussions

## 📈 Метрики

### Производительность
- Время загрузки страницы: < 3 сек
- Размер бандла: < 1 MB
- Оценка Lighthouse: > 90

### Качество кода
- Покрытие тестами: > 80%
- Количество багов: < 5 на релиз
- Время исправления багов: < 24 часа

### Пользовательский опыт
- Время до первого взаимодействия: < 5 сек
- Успешность основных операций: > 95%
- Оценка пользователей: > 4.5/5

## 🎯 Цели проекта

### Краткосрочные (1-2 месяца)
- [ ] Исправление всех критических багов
- [ ] Улучшение производительности
- [ ] Добавление новых функций
- [ ] Улучшение UI/UX

### Среднесрочные (3-6 месяцев)
- [ ] Мобильное приложение
- [ ] Интеграция с банками
- [ ] AI улучшения
- [ ] Масштабирование

### Долгосрочные (6+ месяцев)
- [ ] Международная экспансия
- [ ] Enterprise версия
- [ ] Партнерства
- [ ] IPO подготовка

---

**Удачной работы команде! 🚀** 