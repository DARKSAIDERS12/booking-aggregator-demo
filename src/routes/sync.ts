import { Router } from 'express';
import syncController from '../controllers/syncController';

const router = Router();

// Синхронизация станций
router.post('/stations', syncController.syncStations);

// Синхронизация маршрутов
router.post('/routes', syncController.syncRoutes);

// Полная синхронизация
router.post('/full', syncController.fullSync);

// Статус синхронизации
router.get('/status', syncController.getSyncStatus);

// Проверка здоровья системы
router.get('/health', syncController.healthCheck);

export default router;
