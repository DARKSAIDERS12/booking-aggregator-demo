import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Запуск Booking Aggregator API...');
    
    // Проверяем переменные окружения
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL не настроен, запуск в режиме разработки без БД');
    }
    
    if (!process.env.REDIS_URL) {
      console.log('⚠️ REDIS_URL не настроен, запуск в режиме разработки без Redis');
    }
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📱 API доступен по адресу: http://localhost:${PORT}`);
      console.log(`🔍 Тест соединений: http://localhost:${PORT}/api/test-connections`);
      console.log(`📊 Статистика API: http://localhost:${PORT}/api/api-stats`);
      console.log(`🚌 Поиск рейсов: http://localhost:${PORT}/api/races?from=1&to=2&date=27.6.25`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  process.exit(0);
});

startServer();
