import { Router } from 'express';
import BookingController from '../controllers/bookingController';

const router = Router();
const bookingController = new BookingController();

// Основные маршруты
router.get('/routes/search', bookingController.searchRoutes.bind(bookingController));
router.get('/stations', bookingController.getAllStations.bind(bookingController));
router.get('/stations/from/:from', bookingController.getStationsFrom.bind(bookingController));
router.get('/races/:raceId', bookingController.getRaceInfo.bind(bookingController));

// Тестирование и статистика
router.get('/test-connections', bookingController.testConnections.bind(bookingController));
router.get('/api-stats', bookingController.getApiStats.bind(bookingController));

// Заказы
router.post('/register', bookingController.registerOrder.bind(bookingController));
router.post('/payment', bookingController.payOrder.bind(bookingController));
router.post('/cancel', bookingController.cancelOrder.bind(bookingController));

// Группировка станций
router.post('/stations/group/auto', bookingController.autoGroupStations.bind(bookingController));
router.post('/stations/group/manual', bookingController.manualGroupStations.bind(bookingController));
router.get('/stations/groups', bookingController.getStationGroups.bind(bookingController));
router.get('/stations/groups/:id', bookingController.getStationGroup.bind(bookingController));
router.put('/stations/groups/:id', bookingController.updateStationGroup.bind(bookingController));
router.delete('/stations/groups/:id', bookingController.deleteStationGroup.bind(bookingController));

// Статистика группировки
router.get('/stations/group/stats', bookingController.getGroupingStats.bind(bookingController));

export default router;
