# Пользовательский путь Bugalter AI

## 🎯 Структура продукта

### **1. Маркетинговый сайт (Landing Page)**
```
Доменная структура:
├── bugalter-ai.com (основной домен)
├── landing.bugalter-ai.com (маркетинговый сайт)
├── app.bugalter-ai.com (веб-приложение)
└── api.bugalter-ai.com (API)
```

## 📱 Пользовательский путь

### **Этап 1: Маркетинговый сайт**
```
Пользователь → Landing Page → Узнает о продукте → Кнопка "Начать бесплатно"
```

#### **Страницы маркетингового сайта:**
1. **Главная страница** - О продукте, преимущества, демо
2. **О нас** - История компании, команда, миссия
3. **Сотрудничество** - Партнерские программы, API для разработчиков
4. **Блог** - Статьи о финансах, новости продукта
5. **Поддержка** - FAQ, контакты, документация

### **Этап 2: Аутентификация**
```
Кнопка "Начать бесплатно" → Страница входа/регистрации → Выбор тарифа
```

#### **Форма аутентификации:**
```javascript
const authFields = {
    'Регистрация': {
        'firstName': 'Имя *',
        'lastName': 'Фамилия *',
        'phone': 'Номер телефона *',
        'email': 'Email *',
        'accountType': 'Тип аккаунта *',
        'role': 'Должность (для бизнеса)',
        'companyName': 'Название компании (для бизнеса)'
    },
    
    'Вход': {
        'email': 'Email',
        'phone': 'Номер телефона',
        'verificationCode': 'Код подтверждения *'
    }
};
```

### **Этап 3: Выбор тарифа**
```
После аутентификации → Страница выбора тарифа → Оплата (если платный)
```

## 💰 Тарифные планы

### **1. Бесплатная версия (Free)**
```javascript
const freePlan = {
    price: 'Бесплатно',
    features: [
        '100 транзакций в месяц',
        'Базовые отчеты',
        '3 категории',
        'Email поддержка',
        'Реклама в интерфейсе'
    ],
    limitations: [
        'Ограниченная аналитика',
        'Нет экспорта в PDF',
        'Нет интеграций с банками',
        'Нет AI-рекомендаций'
    ]
};
```

### **2. Plus версия**
```javascript
const plusPlan = {
    price: '$9/месяц',
    features: [
        '1000 транзакций в месяц',
        'Расширенная аналитика',
        'Неограниченные категории',
        'Экспорт в PDF/Excel',
        'Без рекламы',
        'Приоритетная поддержка',
        'Базовые AI-рекомендации'
    ],
    additional: [
        'Telegram бот',
        'Импорт банковских выписок',
        'Мобильная версия'
    ]
};
```

### **3. Pro версия**
```javascript
const proPlan = {
    price: '$29/месяц',
    features: [
        'Неограниченные транзакции',
        'Полная AI-аналитика',
        'Прогнозирование расходов',
        'Интеграции с банками',
        'Многопользовательский режим',
        'API доступ',
        'Персональный менеджер'
    ],
    business: [
        'Налоговые отчеты',
        'Интеграция с Soliq.uz',
        'Командная аналитика',
        'Кастомизация'
    ]
};
```

## 💳 Система оплаты

### **Онлайн платежи:**
```javascript
const paymentMethods = {
    'UzCard': {
        enabled: true,
        commission: '2.5%',
        processing: 'UzCard API'
    },
    
    'Humo': {
        enabled: true,
        commission: '2.5%',
        processing: 'Humo API'
    },
    
    'Visa/Mastercard': {
        enabled: true,
        commission: '3%',
        processing: 'Stripe'
    },
    
    'Click': {
        enabled: true,
        commission: '2%',
        processing: 'Click API'
    },
    
    'Payme': {
        enabled: true,
        commission: '2%',
        processing: 'Payme API'
    }
};
```

### **Процесс оплаты:**
```javascript
const paymentFlow = {
    'Выбор тарифа': 'Пользователь выбирает Plus или Pro',
    'Ввод данных': 'Email, имя, номер карты',
    'Безопасность': '3D Secure, SSL шифрование',
    'Подтверждение': 'SMS код от банка',
    'Активация': 'Мгновенная активация тарифа'
};
```

## 🏗️ Архитектура сайтов

### **1. Маркетинговый сайт (Landing)**
```html
<!-- Структура landing.bugalter-ai.com -->
├── index.html (Главная страница)
├── about.html (О нас)
├── partnership.html (Сотрудничество)
├── blog.html (Блог)
├── support.html (Поддержка)
├── pricing.html (Тарифы)
└── contact.html (Контакты)
```

### **2. Веб-приложение (App)**
```html
<!-- Структура app.bugalter-ai.com -->
├── auth.html (Аутентификация)
├── pricing.html (Выбор тарифа)
├── payment.html (Оплата)
├── dashboard.html (Основное приложение)
└── settings.html (Настройки)
```

## 🎨 Дизайн и UX

### **Маркетинговый сайт:**
```css
/* Современный дизайн */
.landing-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 4rem 0;
}

.pricing-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin: 4rem 0;
}
```

### **Веб-приложение:**
```css
/* Профессиональный интерфейс */
.app-container {
    background: #f8fafc;
    min-height: 100vh;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
}

.sidebar {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
```

## 📊 Аналитика и конверсия

### **Метрики для отслеживания:**
```javascript
const conversionMetrics = {
    'Landing Page': {
        'Visitors': 'Количество посетителей',
        'Bounce Rate': 'Процент отказов',
        'Time on Page': 'Время на странице',
        'CTR': 'Клик по кнопке "Начать бесплатно"'
    },
    
    'Auth Flow': {
        'Registration Rate': 'Процент регистраций',
        'Email Verification': 'Подтверждение email',
        'Drop-off Points': 'Точки отказов'
    },
    
    'Pricing': {
        'Plan Selection': 'Выбор тарифов',
        'Payment Success': 'Успешные оплаты',
        'Churn Rate': 'Отток пользователей'
    }
};
```

## 🔄 Пользовательский сценарий

### **Полный путь пользователя:**

#### **1. Первый визит**
```
Google Search → Landing Page → Изучение продукта → Регистрация
```

#### **2. Регистрация**
```
Форма регистрации → Подтверждение email → Выбор тарифа
```

#### **3. Выбор тарифа**
```
Сравнение планов → Выбор Free/Plus/Pro → Оплата (если платный)
```

#### **4. Использование продукта**
```
Активация тарифа → Основное приложение → Первые транзакции
```

#### **5. Удержание**
```
Регулярное использование → Обновление тарифа → Рекомендации друзьям
```

## 🚀 Техническая реализация

### **Frontend технологии:**
```javascript
const techStack = {
    'Landing Page': {
        'Framework': 'React/Next.js',
        'Styling': 'Tailwind CSS',
        'Analytics': 'Google Analytics',
        'SEO': 'Next.js SEO'
    },
    
    'Web App': {
        'Framework': 'React/Vue.js',
        'State Management': 'Redux/Vuex',
        'UI Library': 'Material-UI/Vuetify',
        'Charts': 'Chart.js/D3.js'
    },
    
    'Payment': {
        'Gateway': 'Stripe + UzCard API',
        'Security': 'PCI DSS compliance',
        'Encryption': 'AES-256'
    }
};
```

### **Backend API:**
```javascript
const apiEndpoints = {
    'Auth': {
        'POST /api/auth/register': 'Регистрация',
        'POST /api/auth/login': 'Вход',
        'POST /api/auth/verify': 'Подтверждение email'
    },
    
    'Pricing': {
        'GET /api/pricing/plans': 'Получение тарифов',
        'POST /api/pricing/subscribe': 'Подписка на тариф',
        'POST /api/payment/process': 'Обработка платежа'
    },
    
    'App': {
        'GET /api/transactions': 'Получение транзакций',
        'POST /api/transactions': 'Создание транзакции',
        'GET /api/analytics': 'Аналитические данные'
    }
};
```

## 📈 Планы развития

### **Phase 1: MVP (3 месяца)**
- [ ] Маркетинговый сайт
- [ ] Система аутентификации
- [ ] Базовые тарифы (Free/Plus)
- [ ] Простая система оплаты

### **Phase 2: Growth (6 месяцев)**
- [ ] Pro тариф
- [ ] Расширенные интеграции
- [ ] Мобильное приложение
- [ ] AI функции

### **Phase 3: Scale (12 месяцев)**
- [ ] Enterprise решения
- [ ] Международная экспансия
- [ ] Партнерские программы
- [ ] API для разработчиков

Хотите, чтобы я создал конкретные страницы для маркетингового сайта и системы тарифов? 