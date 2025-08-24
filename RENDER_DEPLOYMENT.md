# 🚀 Развертывание на Render.com для демонстрации заказчику

## 🌟 **Почему Render.com идеален:**
- ✅ **Бесплатно** - 0$ в месяц
- ✅ **Автоматический деплой** - при каждом push
- ✅ **Встроенная PostgreSQL** - база данных включена
- ✅ **SSL сертификаты** - автоматически
- ✅ **Глобальный CDN** - быстрая загрузка
- ✅ **Простая настройка** - через веб-интерфейс

## 📋 **Пошаговая инструкция:**

### **1. Подготовка проекта:**

#### **Создать render.yaml для автоматического развертывания:**
```yaml
# render.yaml
services:
  # Основной API сервер
  - type: web
    name: booking-aggregator-api
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: booking-aggregator-db
          property: connectionString
      - key: STRAPI_URL
        value: https://booking-aggregator-strapi.onrender.com
      - key: CORS_ORIGIN
        value: "*"
      - key: API1_BASE_URL
        value: https://gds-api.example.com
      - key: API2_BASE_URL
        value: https://api.paybilet.ru

  # Strapi CMS
  - type: web
    name: booking-aggregator-strapi
    env: node
    plan: free
    buildCommand: cd admin-panel && npm install && npm run build
    startCommand: cd admin-panel && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: booking-aggregator-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ADMIN_JWT_SECRET
        generateValue: true
      - key: APP_KEYS
        generateValue: true
      - key: API_TOKEN_SALT
        generateValue: true

databases:
  - name: booking-aggregator-db
    databaseName: booking_aggregator
    user: booking_user
    plan: free
```

#### **Обновить package.json для Render:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### **Создать .env.production:**
```env
# Production настройки для Render
NODE_ENV=production
PORT=10000
DATABASE_URL=${DATABASE_URL}
STRAPI_URL=${STRAPI_URL}
CORS_ORIGIN=*
API1_BASE_URL=https://gds-api.example.com
API2_BASE_URL=https://api.paybilet.ru
```

### **2. Создание аккаунта на Render.com:**

#### **Регистрация:**
1. Перейти на [render.com](https://render.com)
2. Зарегистрироваться через GitHub
3. Подтвердить email

#### **Подключение репозитория:**
1. Нажать "New +"
2. Выбрать "Web Service"
3. Подключить GitHub репозиторий
4. Выбрать ветку `main`

### **3. Настройка переменных окружения:**

#### **Основные переменные:**
```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
```

#### **API ключи (если есть реальные):**
```
API1_USERNAME=your_username
API1_PASSWORD=your_password
API2_API_KEY=your_api_key
```

### **4. Настройка базы данных:**

#### **Создание PostgreSQL:**
1. "New +" → "PostgreSQL"
2. Имя: `booking-aggregator-db`
3. План: Free
4. Создать

#### **Получение connection string:**
```
postgresql://user:password@host:port/database
```

### **5. Автоматический деплой:**

#### **При первом push:**
1. Render автоматически обнаружит `render.yaml`
2. Создаст все сервисы
3. Настроит базу данных
4. Развернет приложение

#### **URL будут:**
- **API**: `https://booking-aggregator-api.onrender.com`
- **Strapi**: `https://booking-aggregator-strapi.onrender.com`
- **Тестовая страница**: `https://booking-aggregator-api.onrender.com/api-test.html`

## 🔧 **Альтернативная настройка (без render.yaml):**

### **1. Создать Web Service:**
- Имя: `booking-aggregator`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### **2. Создать PostgreSQL:**
- Имя: `booking-db`
- План: Free

### **3. Настроить переменные:**
```
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production
PORT=10000
```

## 📱 **Что получит заказчик:**

### **Публичные ссылки:**
- **API Endpoints**: `https://your-app.onrender.com/api/stations`
- **Тестирование**: `https://your-app.onrender.com/api-test.html`
- **Поиск рейсов**: `https://your-app.onrender.com/race-search.html`
- **Strapi Admin**: `https://your-app.onrender.com/admin`

### **Функции для демонстрации:**
- ✅ Создание групп станций
- ✅ Сопоставление станций
- ✅ Поиск рейсов
- ✅ Регистрация заказов
- ✅ Управление через Strapi CMS

## 🚀 **Преимущества Render.com для демо:**

### **Для заказчика:**
- **Доступ 24/7** - в любое время
- **Быстрая загрузка** - глобальный CDN
- **Безопасность** - SSL сертификаты
- **Профессионально** - выглядит как продакшн

### **Для разработчика:**
- **Бесплатно** - 0$ в месяц
- **Автоматизация** - деплой при push
- **Мониторинг** - логи и метрики
- **Масштабируемость** - легко перейти на платный план

## ⚠️ **Ограничения бесплатного плана:**

- **Сон после 15 минут** неактивности
- **750 часов** в месяц
- **512MB RAM** для приложения
- **1GB** для базы данных

### **Для демонстрации это идеально!**

## 🎯 **Итог:**

**Render.com - лучший выбор для демонстрации заказчику!**

✅ **Бесплатно**
✅ **Быстро настраивается**
✅ **Профессионально выглядит**
✅ **Автоматический деплой**
✅ **SSL и CDN включены**

**Проект будет доступен заказчику через 15 минут после настройки!** 🎉
