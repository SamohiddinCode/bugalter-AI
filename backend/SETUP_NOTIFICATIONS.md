# Настройка уведомлений Gmail и Telegram

## 📧 Настройка Gmail

### 1. Включение двухфакторной аутентификации
1. Перейдите в [Google Account Settings](https://myaccount.google.com/)
2. Включите двухфакторную аутентификацию
3. Перейдите в раздел "Безопасность" → "Пароли приложений"

### 2. Создание пароля приложения
1. Выберите "Почта" в качестве приложения
2. Выберите "Другое (пользовательское имя)"
3. Введите название: "Bugalter AI"
4. Скопируйте сгенерированный пароль (16 символов)

### 3. Настройка переменных окружения
Создайте файл `.env` в папке `backend/`:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=Bugalter AI <noreply@bugalter-ai.com>

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🤖 Настройка Telegram Bot

### 1. Создание Telegram Bot
1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Введите название бота: "Bugalter AI"
4. Введите username бота: "bugalter_ai_bot" (должен заканчиваться на _bot)
5. Скопируйте токен бота

### 2. Получение Chat ID
1. Добавьте бота в чат или отправьте ему сообщение
2. Откройте в браузере: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Найдите `chat_id` в ответе

### 3. Добавление Telegram в .env
Добавьте в файл `.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## 🚀 Запуск с уведомлениями

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Запуск сервера
```bash
npm start
```

### 3. Проверка работы
1. Откройте `http://localhost:8000/auth-system.html`
2. Зарегистрируйтесь с реальным email
3. Проверьте email и Telegram на наличие кода

## 🔧 Тестирование

### Тест Gmail
- Код должен прийти на указанный email
- Проверьте папку "Спам" если письмо не пришло

### Тест Telegram
- Код должен прийти в Telegram чат
- Убедитесь, что бот добавлен в чат

## 🛠 Устранение проблем

### Gmail не работает
1. Проверьте правильность EMAIL_USER и EMAIL_PASS
2. Убедитесь, что включена двухфакторная аутентификация
3. Проверьте, что используется пароль приложения, а не обычный пароль

### Telegram не работает
1. Проверьте правильность TELEGRAM_BOT_TOKEN
2. Убедитесь, что TELEGRAM_CHAT_ID указан правильно
3. Проверьте, что бот добавлен в чат

### Логи
Проверьте консоль сервера для диагностики:
```bash
📧 Email result: { success: true, messageId: '...' }
🤖 Telegram result: { success: true, messageId: 123 }
```

## 📝 Примеры конфигурации

### Минимальная конфигурация (только Gmail)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-secret-key
```

### Полная конфигурация (Gmail + Telegram)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Bugalter AI <noreply@bugalter-ai.com>
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

## 🔒 Безопасность

### Важные моменты:
1. Никогда не коммитьте файл `.env` в git
2. Используйте сильный JWT_SECRET
3. Регулярно обновляйте пароли приложений
4. Ограничьте доступ к Telegram боту

### Рекомендации:
- Используйте отдельный Gmail аккаунт для уведомлений
- Создайте отдельный Telegram бот для продакшена
- Настройте мониторинг отправки уведомлений 