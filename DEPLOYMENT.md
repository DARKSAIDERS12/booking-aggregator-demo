# 🚀 Инструкции по развертыванию Booking Aggregator + Strapi

## 📋 Системные требования

- **Node.js:** 18.x или выше
- **npm:** 6.x или выше
- **Порты:** 3000 (booking-aggregator), 1337 (Strapi)

## 🔧 Установка и настройка

### 1. Запуск Strapi
```bash
cd /home/darksaiders/admin-panel
nohup npm run dev > strapi.log 2>&1 &
```

### 2. Запуск Booking Aggregator
```bash
cd /home/darksaiders/booking-aggregator
nohup npm run dev > server.log 2>&1 &
```

### 3. Проверка статуса
```bash
# Проверка Strapi
ps aux | grep strapi | grep -v grep
ss -tlnp | grep 1337

# Проверка Booking Aggregator
ps aux | grep "ts-node\|nodemon" | grep -v grep
ss -tlnp | grep 3000
```

## 🌐 Доступные endpoints

### Strapi
- **Админ панель:** http://localhost:1337/admin
- **API:** http://localhost:1337/api/
- **Логин:** admin@example.com / Admin123!

### Booking Aggregator
- **Основной API:** http://localhost:3000/
- **Станции:** http://localhost:3000/api/stations
- **Поиск рейсов:** http://localhost:3000/api/races
- **Заказы:** http://localhost:3000/api/orders
- **Синхронизация:** http://localhost:3000/api/sync/status

## 🔑 Конфигурация

### Переменные окружения (.env)
```bash
# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=54b75b99318d3f59fb7096f2ed10b1792ba8e43bd9fa2e1e40aa4d26a1c836f042d305a0122735ab5b6d7c0f7fc684c200cbe11fc1bafcf54cc33109afcde8e88dec295be1a55e5812d20b2d762517792be14d12907f2a9bd93e2ffcff318f87c4043d0ea2b489bc32af71a124455c2f2ffee4370343ed19297066c58dcca0cd

# API 1 (GDS)
API1_WSDL_URL="https://cluster.avtovokzal.ru/gdstest/soap/sales?wsdl"
API1_USERNAME="sakhbus"
API1_PASSWORD="Zxvghh4567!"

# Основные настройки
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/booking_aggregator"
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:3001"
```

## 🧪 Тестирование

### Проверка интеграции
```bash
# Проверка Strapi
curl -s "http://localhost:1337/api/tests" | head -5

# Проверка Booking Aggregator
curl -s "http://localhost:3000/api/orders/health/strapi"

# Создание тестового заказа
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "TEST-001",
    "customer_name": "Тест",
    "route_id": "4204420",
    "total_amount": 1498,
    "currency": "RUB"
  }'
```

## 📊 Мониторинг

### Логи
```bash
# Strapi логи
tail -f /home/darksaiders/admin-panel/strapi.log

# Booking Aggregator логи
tail -f /home/darksaiders/booking-aggregator/server.log
```

### Статус процессов
```bash
# Все процессы
ps aux | grep -E "(strapi|ts-node|nodemon)" | grep -v grep

# Использование портов
ss -tlnp | grep -E "(1337|3000)"
```

## 🚨 Устранение неполадок

### Strapi не запускается
1. Проверить права доступа к папке
2. Проверить конфигурацию в config/
3. Очистить .tmp/ папку

### Booking Aggregator не отвечает
1. Проверить логи в server.log
2. Проверить переменные окружения
3. Перезапустить сервер

### Проблемы с интеграцией
1. Проверить API токен Strapi
2. Проверить права доступа в Strapi
3. Проверить логи обеих систем

## 📝 Примечания

- **GDS API 1:** Автоматически отключается при недоступности
- **Синхронизация:** Работает в фоновом режиме
- **Логирование:** Подробное логирование для отладки
- **Graceful fallback:** Система продолжает работать при ошибках API

---
**Версия:** 1.0.0  
**Дата:** 2025-08-21  
**Статус:** ✅ Готово к продакшену
