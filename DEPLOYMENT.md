# 🚀 Развертывание на Render.com

## 📋 Предварительные требования

1. **Аккаунт на Render.com** (бесплатный)
2. **Git репозиторий** с вашим кодом
3. **Node.js 18+** для локальной сборки

## 🔧 Шаги развертывания

### 1. Подготовка репозитория

```bash
# Убедитесь, что все файлы добавлены в git
git add .
git commit -m "Подготовка к развертыванию на Render"
git push origin main
```

### 2. Создание сервиса на Render

1. **Войдите в Render.com**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите ваш Git репозиторий**
4. **Настройте параметры:**

```
Name: booking-aggregator-demo
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. Переменные окружения

В настройках сервиса добавьте:

```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
API1_BASE_URL=https://cluster.avtovokzal.ru/gdstest/soap/json
API1_USERNAME=sakhbus
API1_PASSWORD=sakhbus123
API2_BASE_URL=https://api.paybilet.ru
API2_API_KEY=your_api_key_here
```

### 4. Автоматическое развертывание

- **Auto-Deploy**: Включено
- **Branch**: main
- **Health Check Path**: `/api/test-connections`

## 🌐 Доступ к приложению

После успешного развертывания:
- **URL**: `https://your-app-name.onrender.com`
- **API**: `https://your-app-name.onrender.com/api/`
- **Веб-интерфейс**: `https://your-app-name.onrender.com/`

## 📱 Демонстрация заказчику

### Основные функции для показа:

1. **Поиск маршрутов** - главная страница
2. **Выбор рейса** - переход на страницу заказа
3. **Бронирование** - заполнение данных пассажира
4. **Оплата** - страница завершения заказа

### Тестовые данные:

- **Откуда**: Южно-Сахалинск
- **Куда**: Холмск
- **Дата**: любая будущая дата

## 🔍 Мониторинг

- **Логи**: Доступны в панели Render
- **Статус**: Автоматические проверки здоровья
- **Метрики**: Время отклика и доступность

## 🚨 Устранение неполадок

### Если приложение не запускается:

1. **Проверьте логи** в панели Render
2. **Убедитесь в правильности переменных окружения**
3. **Проверьте порт** (должен быть 10000)
4. **Убедитесь в успешной сборке** TypeScript

### Частые проблемы:

- **Port already in use**: Измените порт в переменных окружения
- **Build failed**: Проверьте package.json и зависимости
- **Runtime errors**: Проверьте логи приложения

## 💰 Стоимость

- **Бесплатный план**: До 750 часов в месяц
- **Платный план**: От $7/месяц для 24/7 работы

## 📞 Поддержка

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com


