import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';

const router = Router();

// Поиск маршрутов
router.get('/routes/search', bookingController.searchRoutes);

// Получение всех станций
router.get('/stations', bookingController.getAllStations);

// Получение станций назначения
router.get('/stations/from/:from', bookingController.getStationsFrom);

// Получение информации о маршруте
router.get('/routes/:id', bookingController.getRouteInfo);

// Тест соединений
router.get('/test/connections', bookingController.testConnections);

// Получение статистики API
router.get('/stats', bookingController.getApiStats);

export default router;
