import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

export const config = {
  // Основные настройки
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // База данных
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/booking_aggregator'
  },
  
  // Strapi CMS
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    apiToken: process.env.STRAPI_API_TOKEN || ''
  },
  
  // GDS API 1 (SOAP) - ТЕСТОВЫЙ СЕРВЕР
  gdsApi1: {
    url: process.env.GDS_API1_URL || 'https://cluster.avtovokzal.ru/gdstest/soap/json',
    username: process.env.GDS_API1_USERNAME || 'sakhbus',
    password: process.env.GDS_API1_PASSWORD || 'Zxvghh4567!'
  },
  
  // Paybilet API 2
  paybiletApi2: {
    url: process.env.PAYBILET_API2_URL || 'https://api.paybilet.ru',
    token: process.env.PAYBILET_API2_TOKEN || ''
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
  }
};

// Проверяем обязательные переменные
export const validateConfig = () => {
  const required = [
    'GDS_API1_URL',
    'GDS_API1_USERNAME', 
    'GDS_API1_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Отсутствуют переменные окружения:', missing);
    console.warn('🔄 Используются значения по умолчанию');
  }
  
  return missing.length === 0;
};
