import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

// Регистрация/бронирование билетов
router.post('/register', orderController.registerOrder);

// Оплата забронированного заказа
router.post('/payment', orderController.payOrder);

// Отмена билетов
router.post('/cancel', orderController.cancelOrder);

// Получение информации о заказе
router.get('/:id', orderController.getOrderInfo);

// Получение всех заказов
router.get('/', orderController.getAllOrders);

export default router;
