import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/booking';
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

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Маршруты
app.use('/api', bookingRoutes);
app.use('/admin', adminRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🚌 Booking Aggregator API v1.0',
    description: 'Агрегатор API для систем бронирования автобусных билетов',
    endpoints: {
      api: '/api/*',
      admin: '/admin/*',
      docs: 'https://github.com/your-repo/docs'
    }
  });
});

// Обработка ошибок
app.use(errorHandler);

export default app;
