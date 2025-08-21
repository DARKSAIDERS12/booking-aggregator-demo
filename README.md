# 🚌 Booking Aggregator

Система агрегации API для бронирования автобусных билетов с автоматической группировкой и сопоставлением станций.

## 🌟 Возможности

- **🔍 Поиск маршрутов** - единый интерфейс для поиска по всем API
- **🚉 Управление станциями** - автоматическая и ручная группировка станций
- **📋 Система заказов** - полный цикл: регистрация, оплата, отмена
- **🔄 Синхронизация данных** - автоматическое обновление из внешних API
- **💚 Мониторинг** - отслеживание состояния системы
- **⚙️ Гибкая настройка** - ручное управление группировкой

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Booking API    │    │   Strapi CMS    │
│   (Dashboard)   │◄──►│  (Express.js)   │◄──►│   (Content     │
│                 │    │                 │    │    Types)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  External APIs  │
                       │                 │
                       │ GDS API 1.14.12 │
                       │ Paybilet RF Bus │
                       └─────────────────┘
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Установка зависимостей для основного API
npm install

# Установка зависимостей для Strapi CMS
cd admin-panel
npm install
```

### 2. Настройка окружения

Создайте файл `.env` в корневой папке:

```env
# Основные настройки
PORT=3000
NODE_ENV=development

# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/booking_aggregator"

# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here

# GDS API 1
GDS_API1_URL=./gds_api1.wsdl
GDS_API1_USERNAME=your_username
GDS_API1_PASSWORD=your_password

# Paybilet API 2
PAYBILET_API2_URL=https://api.paybilet.ru
PAYBILET_API2_TOKEN=your_token_here
```

### 3. Запуск системы

```bash
# Терминал 1: Запуск основного API
npm run dev

# Терминал 2: Запуск Strapi CMS
cd admin-panel
npm run develop
```

### 4. Доступ к интерфейсам

- **Главная страница**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard.html
- **Управление станциями**: http://localhost:3000/station-management.html
- **Strapi Admin**: http://localhost:1337/admin

## 📚 API Endpoints

### Основные маршруты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/routes/search` | Поиск маршрутов |
| `GET` | `/api/stations` | Получение всех станций |
| `GET` | `/api/stations/from/:from` | Станции по направлению |
| `GET` | `/api/races/:raceId` | Информация о маршруте |

### Заказы

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/register` | Регистрация заказа |
| `POST` | `/api/payment` | Оплата заказа |
| `POST` | `/api/cancel` | Отмена заказа |

### Группировка станций

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/stations/group/auto` | Автоматическая группировка |
| `POST` | `/api/stations/group/manual` | Ручная группировка |
| `GET` | `/api/stations/groups` | Все группы |
| `GET` | `/api/stations/groups/:id` | Конкретная группа |
| `PUT` | `/api/stations/groups/:id` | Обновление группы |
| `DELETE` | `/api/stations/groups/:id` | Удаление группы |
| `GET` | `/api/stations/group/stats` | Статистика группировки |

### Синхронизация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/sync/stations/api1` | Синхронизация API 1 |
| `POST` | `/api/sync/stations/api2` | Синхронизация API 2 |
| `POST` | `/api/sync/stations/map` | Автоматическое сопоставление |
| `POST` | `/api/sync/full` | Полная синхронизация |
| `GET` | `/api/sync/status` | Статус синхронизации |
| `GET` | `/api/sync/health` | Проверка здоровья |

### Мониторинг

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/test-connections` | Проверка соединений |
| `GET` | `/api/api-stats` | Статистика API |

## 🎯 Использование

### 1. Поиск маршрутов

```bash
curl "http://localhost:3000/api/routes/search?from=Южно-Сахалинск&to=Холмск&date=2025-08-22"
```

### 2. Автоматическая группировка станций

```bash
curl -X POST "http://localhost:3000/api/stations/group/auto"
```

### 3. Создание ручной группы

```bash
curl -X POST "http://localhost:3000/api/stations/group/manual" \
  -H "Content-Type: application/json" \
  -d '{
    "station_ids": [1, 2, 3],
    "group_name": "Холмск (все станции)"
  }'
```

### 4. Синхронизация данных

```bash
# Синхронизация станций из GDS API
curl -X POST "http://localhost:3000/api/sync/stations/api1"

# Полная синхронизация
curl -X POST "http://localhost:3000/api/sync/full"
```

## 🏗️ Content Types в Strapi

### API1 Station
Станции из GDS API 1.14.12
- `station_id` - уникальный ID станции
- `name` - название станции
- `code` - код станции
- `region` - регион
- `country` - страна
- `coordinates` - координаты (JSON)
- `is_active` - активна ли станция
- `last_sync` - время последней синхронизации

### API2 Station
Станции из Paybilet RF Bus API
- `station_id` - уникальный ID станции
- `name` - название станции
- `code` - код станции
- `region` - регион
- `country` - страна
- `latitude` - широта
- `longitude` - долгота
- `is_active` - активна ли станция
- `last_sync` - время последней синхронизации

### Station Mapping
Сопоставление станций между API
- `name` - название сопоставления
- `display_name` - отображаемое название
- `api1_station` - связь с API1 Station
- `api2_station` - связь с API2 Station
- `group` - связь с группой станций
- `is_main_station` - главная станция в группе
- `mapping_type` - тип сопоставления (automatic/manual)
- `confidence_score` - уровень уверенности (0-1)

### Station Group
Группы станций
- `name` - название группы
- `main_station` - главная станция группы
- `stations` - все станции в группе
- `is_active` - активна ли группа

## 🔧 Разработка

### Структура проекта

```
booking-aggregator/
├── src/
│   ├── controllers/          # Контроллеры API
│   ├── services/            # Бизнес-логика
│   ├── routes/              # Маршруты API
│   ├── middleware/          # Промежуточное ПО
│   ├── types/               # TypeScript типы
│   └── app.ts               # Основное приложение
├── public/                  # Статические файлы
│   ├── index.html           # Главная страница
│   ├── dashboard.html       # Dashboard управления
│   └── station-management.html # Управление станциями
├── admin-panel/             # Strapi CMS
├── prisma/                  # Схема базы данных
└── package.json
```

### Команды разработки

```bash
# Сборка проекта
npm run build

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start

# Проверка типов TypeScript
npm run type-check

# Линтинг
npm run lint
```

### Добавление новых API

1. Создайте сервис в `src/services/`
2. Добавьте контроллер в `src/controllers/`
3. Создайте маршруты в `src/routes/`
4. Зарегистрируйте маршруты в `src/app.ts`

## 📊 Мониторинг и логирование

### Логи

- **API логи**: `server.log`
- **Strapi логи**: `admin-panel/strapi.log`

### Проверка здоровья системы

```bash
curl "http://localhost:3000/api/sync/health"
```

### Статистика API

```bash
curl "http://localhost:3000/api/api-stats"
```

## 🔒 Безопасность

### Настройка прав доступа в Strapi

1. Откройте Strapi Admin: http://localhost:1337/admin
2. Перейдите в Settings → Users & Permissions Plugin → Roles
3. Выберите роль "Public"
4. Настройте права для новых Content Types:
   - `api1-station`: find, findOne
   - `api2-station`: find, findOne
   - `station-mapping`: find, findOne
   - `station-group`: find, findOne

### Переменные окружения

- Никогда не коммитьте `.env` файлы
- Используйте `.env.example` как шаблон
- Храните секреты в безопасном месте

## 🚀 Развертывание

### Docker (рекомендуется)

```bash
# Сборка образов
docker-compose build

# Запуск
docker-compose up -d
```

### Ручное развертывание

```bash
# Установка зависимостей
npm ci --only=production

# Сборка проекта
npm run build

# Запуск
npm start
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🆘 Поддержка

- **Документация**: [Wiki проекта](wiki-link)
- **Issues**: [GitHub Issues](issues-link)
- **Discussions**: [GitHub Discussions](discussions-link)

## 🎉 Благодарности

Спасибо всем участникам проекта за вклад в развитие системы!

---

**🚌 Booking Aggregator v1.0** - Система агрегации API для автобусных перевозок
