# Используем официальный Node.js образ
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Удаляем исходные TypeScript файлы
RUN rm -rf src

# Открываем порт
EXPOSE 10000

# Запускаем приложение
CMD ["npm", "start"]
