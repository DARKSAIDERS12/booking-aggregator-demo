import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();
const bookingController = new BookingController();

// Получение всех станций из двух API
router.get('/stations', bookingController.getStations.bind(bookingController));

// Получение станций назначения из конкретной станции
router.get('/stations/from/:from', bookingController.getStationsFrom.bind(bookingController));

// Поиск рейсов в двух API
router.get('/races', bookingController.searchRoutes.bind(bookingController));

// Получение детальной информации о рейсе
router.get('/races/:id', bookingController.getRouteInfo.bind(bookingController));

// Тест соединений с API
router.get('/test-connections', bookingController.testConnections.bind(bookingController));

// Получение статистики API
router.get('/api-stats', bookingController.getApiStats.bind(bookingController));

// Бронирование заказа (пока заглушка)
router.post('/register', bookingController.registerBooking.bind(bookingController));

// Оплата заказа (пока заглушка)
router.post('/payment', bookingController.processPayment.bind(bookingController));

// Отмена билетов (пока заглушка)
router.post('/cancel', bookingController.cancelTickets.bind(bookingController));

export default router;
