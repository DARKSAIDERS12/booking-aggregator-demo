# 🚀 Развертывание проекта для демонстрации заказчику

## 🌐 **Вариант 1: VPS/Облако (Рекомендуется)**

### **1. Создание VPS сервера:**
```bash
# DigitalOcean Droplet (самый простой)
# Ubuntu 22.04 LTS, 2GB RAM, 1 CPU
# Стоимость: ~$12/месяц

# Или AWS EC2 t3.micro (бесплатный tier)
# Ubuntu Server 22.04 LTS
```

### **2. Подготовка сервера:**
```bash
# Подключение к серверу
ssh root@your-server-ip

# Обновление системы
apt update && apt upgrade -y

# Установка необходимого ПО
apt install -y curl wget git nginx postgresql postgresql-contrib

# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Установка PM2 для управления процессами
npm install -g pm2
```

### **3. Развертывание проекта:**
```bash
# Клонирование проекта
git clone https://github.com/your-username/booking-aggregator.git
cd booking-aggregator

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
nano .env

# Настройка базы данных
npm run db:migrate
npm run db:generate

# Сборка проекта
npm run build
```

### **4. Настройка .env для продакшн:**
```env
# Основные настройки
PORT=3001
NODE_ENV=production

# База данных (PostgreSQL на том же сервере)
DATABASE_URL="postgresql://postgres:password@localhost:5432/booking_aggregator"

# Strapi CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_production_token

# Внешние API (ваши реальные ключи)
API1_BASE_URL=https://gds-api.example.com
API1_USERNAME=your_username
API1_PASSWORD=your_password

API2_BASE_URL=https://api.paybilet.ru
API2_API_KEY=your_paybilet_api_key

# CORS (разрешить доступ с любого домена для демо)
CORS_ORIGIN=*
```

### **5. Запуск Strapi CMS:**
```bash
# В отдельной сессии
cd ~/admin-panel
npm run build
npm run start

# Или через PM2
pm2 start npm --name "strapi" -- run start
```

### **6. Запуск основного сервера:**
```bash
# Через PM2
pm2 start npm --name "booking-api" -- run start

# Проверка статуса
pm2 status
pm2 logs
```

### **7. Настройка Nginx (Reverse Proxy):**
```bash
# Создание конфигурации
nano /etc/nginx/sites-available/booking-aggregator

# Содержимое файла:
server {
    listen 80;
    server_name your-server-ip;

    # Основной API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Strapi CMS
    location /admin/ {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location / {
        proxy_pass http://localhost:3001;
    }
}

# Активация конфигурации
ln -s /etc/nginx/sites-available/booking-aggregator /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### **8. Настройка firewall:**
```bash
# Открытие портов
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (если настроен SSL)
ufw enable
```

## 🔒 **Вариант 2: Бесплатный хостинг**

### **Render.com (бесплатно):**
```bash
# 1. Создать аккаунт на render.com
# 2. Подключить GitHub репозиторий
# 3. Настроить переменные окружения
# 4. Автоматический деплой при push
```

### **Railway.app (бесплатно):**
```bash
# 1. Подключить GitHub репозиторий
# 2. Автоматическое развертывание
# 3. Встроенная база данных PostgreSQL
```

## 📱 **Вариант 3: Локальная демонстрация**

### **Если заказчик может подключиться к вашему компьютеру:**
```bash
# 1. Настроить port forwarding на роутере
# 2. Использовать ngrok для туннелирования

# Установка ngrok
npm install -g ngrok

# Создание туннеля
ngrok http 3001

# Получить публичный URL (например: https://abc123.ngrok.io)
```

## 🌍 **Вариант 4: Демо-сервер на вашем VPS**

### **Быстрое развертывание:**
```bash
# 1. Создать VPS на DigitalOcean ($5-12/месяц)
# 2. Развернуть проект за 30 минут
# 3. Получить публичный IP адрес
# 4. Отправить заказчику ссылку
```

## 📋 **Что нужно для демонстрации:**

### **1. Публичный URL:**
- `http://your-server-ip/api/stations` - список станций
- `http://your-server-ip/api-test.html` - тестирование API
- `http://your-server-ip/race-search.html` - поиск рейсов

### **2. Демонстрация функций:**
- Создание групп станций
- Сопоставление станций
- Поиск рейсов
- Регистрация заказов
- Управление через Strapi CMS

### **3. Документация для заказчика:**
- README.md с описанием API
- Примеры использования
- Скриншоты интерфейса

## 💰 **Стоимость развертывания:**

- **DigitalOcean Droplet**: $12/месяц
- **AWS EC2 t3.micro**: $0/месяц (бесплатный tier)
- **Render.com**: $0/месяц (бесплатно)
- **Railway.app**: $0/месяц (бесплатно)

## 🚀 **Рекомендуемый план:**

1. **Создать VPS на DigitalOcean** ($12/месяц)
2. **Развернуть проект за 30 минут**
3. **Получить публичный IP адрес**
4. **Отправить заказчику ссылку для демонстрации**
5. **Провести онлайн презентацию**

**Проект будет доступен 24/7 для демонстрации!** 🎉
