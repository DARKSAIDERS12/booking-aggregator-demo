import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/booking';
import orderRoutes from './routes/orders';
import syncRoutes from './routes/sync';
import raceRoutes from './routes/races';
import stationRoutes from './routes/stations';
import { adminRoutes } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы для тестового фронтенда
app.use(express.static('public'));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Маршруты
app.use('/api/stations', stationRoutes);  // ПЕРВЫЙ - более специфичный
app.use('/api/orders', orderRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/races', raceRoutes);
app.use('/api', bookingRoutes);  // ПОСЛЕДНИЙ - менее специфичный
app.use('/admin', adminRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🚌 Booking Aggregator API v1.0',
    description: 'Агрегатор API для систем бронирования автобусных билетов',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    config: {
      gdsApi1: {
        url: process.env.GDS_API1_URL || 'https://cluster.avtovokzal.ru/gdstest/soap/json',
        username: process.env.GDS_API1_USERNAME || 'sakhbus',
        password: process.env.GDS_API1_PASSWORD ? '***' : 'не указан'
      }
    },
    endpoints: {
      api: '/api/*',
      races: '/api/races/*',
      orders: '/api/orders/*',
      sync: '/api/sync/*',
      admin: '/admin/*',
      test: '/api/test/connections',
      stats: '/api/stats'
    }
  });
});

// Обработка ошибок
app.use(errorHandler);

export default app;
