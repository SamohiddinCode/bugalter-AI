# 🚀 Установка и настройка Bugalter AI

Подробная инструкция по установке и запуску проекта для разработчиков.

## 📋 Требования

### Системные требования
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: Минимум 2GB (рекомендуется 4GB+)
- **Диск**: 100MB свободного места
- **Браузер**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Программное обеспечение
- **Python**: 3.7+ (для HTTP сервера)
- **Node.js**: 14+ (опционально, для backend)
- **Git**: 2.20+ (для клонирования)

## 🔧 Установка

### 1. Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/bugalter_AI.git

# Перейдите в директорию проекта
cd bugalter_AI

# Проверьте структуру проекта
ls -la
```

### 2. Проверка файлов

Убедитесь, что все необходимые файлы присутствуют:

```bash
# Основные файлы
ls -la index.html auth-system.html landing-page.html

# Папки
ls -la css/ js/ backend/ img/

# Проверьте наличие всех JS файлов
ls -la js/
```

### 3. Установка зависимостей (опционально)

#### Для Backend (если планируете использовать)
```bash
# Перейдите в папку backend
cd backend

# Установите зависимости
npm install

# Проверьте package.json
cat package.json
```

#### Для Frontend (нет зависимостей)
Frontend использует только CDN ресурсы:
- Chart.js (графики)
- Font Awesome (иконки)
- Google Fonts (шрифты)

## 🚀 Запуск

### Вариант 1: Python HTTP Server (рекомендуется)

```bash
# Python 3
python3 -m http.server 8000

# Или Python 2
python -m SimpleHTTPServer 8000

# Проверьте, что сервер запущен
curl http://localhost:8000
```

### Вариант 2: Node.js

```bash
# Установите serve глобально
npm install -g serve

# Запустите сервер
serve . -p 8000

# Или используя npx
npx serve . -p 8000
```

### Вариант 3: PHP

```bash
# PHP встроенный сервер
php -S localhost:8000

# Проверьте версию PHP
php --version
```

### Вариант 4: Live Server (VS Code)

1. Установите расширение "Live Server" в VS Code
2. Откройте проект в VS Code
3. Правый клик на `index.html` → "Open with Live Server"

## 🔍 Проверка работоспособности

### 1. Откройте приложение
```
http://localhost:8000
```

### 2. Проверьте основные функции

#### Авторизация
- Откройте `http://localhost:8000/auth-system.html`
- Попробуйте зарегистрироваться
- Проверьте вход в систему

#### Основное приложение
- Откройте `http://localhost:8000/index.html`
- Проверьте дашборд
- Попробуйте добавить транзакцию

#### Курсы валют
- Проверьте виджет "Курсы валют"
- Нажмите "Обновить" для проверки API

### 3. Проверьте консоль браузера

```javascript
// Откройте DevTools (F12)
// Перейдите на вкладку Console
// Проверьте наличие ошибок

// Проверьте localStorage
localStorage.getItem('transactions')
localStorage.getItem('exchangeRates')
```

## 🐛 Устранение неполадок

### Проблема: "Порт уже занят"
```bash
# Найдите процесс, использующий порт
lsof -i :8000

# Завершите процесс
kill -9 <PID>

# Или используйте другой порт
python3 -m http.server 8001
```

### Проблема: "CORS ошибки"
```bash
# Убедитесь, что используете HTTP сервер
# Не открывайте файлы напрямую в браузере

# Проверьте настройки браузера
# Отключите расширения, блокирующие CORS
```

### Проблема: "Курсы валют не загружаются"
```bash
# Проверьте интернет соединение
curl https://cbu.uz/oz/arkhiv-kursov-valyut/json/USD/

# Проверьте API в браузере
# Откройте DevTools → Network → XHR
# Обновите курсы валют
```

### Проблема: "Данные не сохраняются"
```bash
# Проверьте localStorage
localStorage.setItem('test', 'value')
localStorage.getItem('test')

# Очистите кэш браузера
# Проверьте режим инкогнито
```

### Проблема: "Графики не отображаются"
```bash
# Проверьте загрузку Chart.js
# Откройте DevTools → Network
# Найдите chart.js в списке загруженных файлов

# Проверьте консоль на ошибки JavaScript
```

## 🔧 Настройка разработки

### 1. Настройка редактора

#### VS Code (рекомендуется)
```json
// settings.json
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

#### Полезные расширения
- **Live Server**: Автоматический перезапуск сервера
- **Prettier**: Форматирование кода
- **ESLint**: Проверка JavaScript
- **Auto Rename Tag**: Автоматическое переименование HTML тегов

### 2. Настройка Git

```bash
# Инициализируйте Git (если не инициализирован)
git init

# Добавьте файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/your-username/bugalter_AI.git

# Отправьте изменения
git push -u origin main
```

### 3. Настройка .gitignore

```bash
# Создайте .gitignore
cat > .gitignore << EOF
# Зависимости
node_modules/
npm-debug.log*

# Временные файлы
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Логи
*.log

# База данных (если используется)
*.db
*.sqlite

# Конфигурационные файлы
config.local.js
.env
EOF
```

## 📊 Тестирование

### 1. Функциональное тестирование

```bash
# Создайте тестовые данные
# Добавьте несколько транзакций разных типов
# Проверьте все разделы приложения
```

### 2. Тестирование в разных браузерах

- **Chrome**: Основной браузер для разработки
- **Firefox**: Проверка совместимости
- **Safari**: Тестирование на macOS
- **Edge**: Тестирование на Windows

### 3. Тестирование на мобильных устройствах

```bash
# Используйте DevTools для эмуляции мобильных устройств
# Проверьте адаптивность на разных размерах экрана
```

## 🚀 Деплой

### 1. GitHub Pages

```bash
# Создайте репозиторий на GitHub
# Загрузите код
git push origin main

# В настройках репозитория включите GitHub Pages
# Выберите ветку main и папку root
```

### 2. Netlify

```bash
# Подключите GitHub репозиторий к Netlify
# Настройте автоматический деплой
# Получите URL для доступа
```

### 3. Vercel

```bash
# Подключите GitHub репозиторий к Vercel
# Настройте автоматический деплой
# Получите URL для доступа
```

## 📝 Документация API

### Курсы валют (CBU API)

```javascript
// Получение курса USD
fetch('https://cbu.uz/oz/arkhiv-kursov-valyut/json/USD/')
  .then(response => response.json())
  .then(data => console.log(data));

// Формат ответа
{
  "id": 1,
  "Code": "840",
  "Ccy": "USD",
  "Rate": "12725.16",
  "Diff": "32.74",
  "Date": "04.08.2025"
}
```

### localStorage структура

```javascript
// Транзакции
localStorage.setItem('transactions', JSON.stringify([
  {
    id: 1234567890,
    amount: 50000,
    type: 'expense',
    category: 'Продукты',
    description: 'Продукты',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:30:00.000Z'
  }
]));

// Курсы валют
localStorage.setItem('exchangeRates', JSON.stringify({
  rates: { USD: 12725, EUR: 14508, RUB: 159 },
  changes: { USD: 32.74, EUR: -3.29, RUB: 0.21 },
  timestamp: Date.now()
}));
```

## 🤝 Вклад в проект

### 1. Создание ветки

```bash
# Создайте новую ветку для функции
git checkout -b feature/new-feature

# Внесите изменения
# Добавьте файлы
git add .

# Создайте коммит
git commit -m "Add new feature"

# Отправьте изменения
git push origin feature/new-feature
```

### 2. Создание Pull Request

1. Перейдите на GitHub
2. Создайте Pull Request из вашей ветки в main
3. Опишите изменения
4. Дождитесь ревью

### 3. Стиль кода

```javascript
// Используйте camelCase для переменных
const userName = 'John';

// Используйте PascalCase для классов
class BugalterAIApp {
  constructor() {
    // Инициализация
  }
}

// Используйте snake_case для CSS классов
.modal-content {
  /* Стили */
}
```

## 📞 Поддержка

- **Issues**: Создайте issue в GitHub
- **Discussions**: Используйте Discussions для вопросов
- **Email**: support@bugalter-ai.com
- **Telegram**: @bugalter_ai_support

---

**Удачной разработки! 🚀** 