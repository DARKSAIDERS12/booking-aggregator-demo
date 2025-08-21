import { Router } from 'express';
import orderController from '../controllers/orderController';

const router = Router();

// Создание нового заказа
router.post('/', orderController.createOrder);

// Получение списка всех заказов
router.get('/', orderController.getOrders);

// Получение заказа по ID
router.get('/:id', orderController.getOrder);

// Обновление заказа
router.put('/:id', orderController.updateOrder);

// Получение статистики заказов
router.get('/stats/summary', orderController.getOrderStats);

// Проверка соединения со Strapi
router.get('/health/strapi', orderController.testStrapiConnection);

export default router;
