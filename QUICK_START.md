# 🚀 Быстрый старт Bugalter AI

Минимальная инструкция для запуска проекта за 5 минут.

## 📋 Требования

- **Python 3.7+** (для frontend сервера)
- **Node.js 18+** (для backend сервера)
- **Git** (для клонирования)

## ⚡ Быстрый запуск

### 1. Клонирование проекта
```bash
git clone https://github.com/your-username/bugalter_AI.git
cd bugalter_AI
```

### 2. Запуск backend сервера
```bash
cd backend
npm install
node server-sqlite.js
```

**Результат**: Backend запущен на `http://localhost:3000`

### 3. Запуск frontend сервера
```bash
# В новом терминале
cd /path/to/bugalter_AI
python3 -m http.server 8000
```

**Результат**: Frontend запущен на `http://localhost:8000`

### 4. Открытие приложения
Откройте браузер и перейдите на:
- **Главная страница**: `http://localhost:8000`
- **Авторизация**: `http://localhost:8000/auth-system.html`

## ✅ Проверка работоспособности

### Backend API
```bash
curl http://localhost:3000
# Должен вернуть: {"message":"Bugalter AI API is running"}
```

### Frontend
- Откройте `http://localhost:8000`
- Должна загрузиться главная страница
- Проверьте консоль браузера (F12) на ошибки

## 🔧 Устранение проблем

### Ошибка "Failed to fetch"
```bash
# Проверьте, что backend запущен
curl http://localhost:3000

# Если не работает, перезапустите:
cd backend
node server-sqlite.js
```

### Порт занят
```bash
# Найдите процесс
lsof -i :3000
lsof -i :8000

# Завершите процесс
kill -9 <PID>
```

### Зависимости не установлены
```bash
cd backend
npm install
```

## 📱 Первые шаги

1. **Регистрация**: Перейдите на страницу авторизации
2. **Вход**: Используйте созданные данные
3. **Добавление транзакций**: Используйте "Быстрое добавление"
4. **Аналитика**: Просматривайте графики и отчеты

## 🎯 Что дальше?

- Изучите `SETUP.md` для подробной настройки
- Прочитайте `REQUIREMENTS.md` для технических деталей
- Ознакомьтесь с `TEAM_GUIDE.md` для работы в команде

---

**Готово! 🎉** Ваш Bugalter AI работает и готов к использованию. 