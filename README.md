# Booking Aggregator API

API сервер-агрегатор для систем бронирования автобусных билетов.

## Описание

Сервер интегрируется с двумя внешними API систем бронирования:
- **API 1**: GDS (Global Distribution System) 1.14.12 - SOAP API
- **API 2**: Paybilet RF Bus - REST API

Предоставляет единый API для фронтенда, объединяя данные из обеих систем.

## Функциональность

### Основные возможности:
- 🔍 Поиск рейсов по маршруту
- 📍 Управление станциями (загрузка, сопоставление, группировка)
- 🎫 Бронирование и оплата билетов
- ❌ Отмена билетов
- 🔄 Автоматическое и ручное сопоставление станций

### Административные функции:
- 📊 Просмотр всех таблиц станций
- 📁 Загрузка станций из файлов (CSV, Excel)
- 🔗 Сопоставление станций между API
- 📋 Группировка станций (например, "Холмск" + "Холмск ЖД")

## Технологии

- **Backend**: Node.js + Express + TypeScript
- **База данных**: PostgreSQL + Prisma ORM
- **Кэш**: Redis
- **Валидация**: Joi
- **CMS**: Strapi (для админ панели)
- **Frontend**: React + TypeScript + HeroUI

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
Скопируйте `.env.example` в `.env` и заполните необходимые переменные:
```bash
cp .env.example .env
```

### 3. Настройка базы данных
```bash
# Создание миграций
npm run db:migrate

# Генерация Prisma клиента
npm run db:generate
```

### 4. Запуск сервера
```bash
# Режим разработки
npm run dev

# Продакшн
npm run build
npm start
```

## API Endpoints

### Публичные endpoints:
- `GET /api/stations` - список всех станций
- `GET /api/stations/from` - станции назначения
- `GET /api/races` - поиск рейсов
- `GET /api/race` - информация о рейсе
- `POST /api/register` - бронирование
- `POST /api/payment` - оплата
- `POST /api/cancel` - отмена

### Административные endpoints:
- `GET /admin/stations` - просмотр станций
- `POST /admin/stations/upload` - загрузка файла
- `POST /admin/stations/load-from-apis` - загрузка из API
- `POST /admin/stations/auto-map` - автосопоставление
- `POST /admin/stations/manual-map` - ручное сопоставление
- `POST /admin/stations/group` - создание группы
- `GET /admin/stations/mapped` - сопоставленные станции

## Структура проекта

```
src/
├── controllers/     # Контроллеры для обработки запросов
├── services/        # Бизнес-логика и интеграция с внешними API
├── middleware/      # Middleware (валидация, обработка ошибок)
├── routes/          # Маршруты API
├── types/           # TypeScript типы и интерфейсы
├── utils/           # Вспомогательные функции
├── app.ts           # Конфигурация Express приложения
└── index.ts         # Точка входа

prisma/
└── schema.prisma    # Схема базы данных

admin/               # Strapi CMS (админ панель)
frontend/            # React приложение
```

## Интеграция с внешними API

### API 1 (GDS):
- **Протокол**: SOAP
- **Основные методы**: getDispatchPoints, getArrivalPoints, getRaces, getRace
- **Формат данных**: XML

### API 2 (Paybilet):
- **Протокол**: REST
- **Основные методы**: GET /stations, GET /races, POST /register
- **Формат данных**: JSON

## Разработка

### Добавление новых endpoints:
1. Создайте контроллер в `src/controllers/`
2. Добавьте маршрут в `src/routes/`
3. Обновите типы в `src/types/`

### Тестирование:
```bash
# Запуск тестов
npm test

# Линтинг
npm run lint
```

## Лицензия

MIT
