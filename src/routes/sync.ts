import { Router } from 'express';
import syncController from '../controllers/syncController';

const router = Router();

// Синхронизация станций API 1
router.post('/stations/api1', syncController.syncApi1Stations);

// Синхронизация станций API 2
router.post('/stations/api2', syncController.syncApi2Stations);

// Автоматическое сопоставление станций
router.post('/stations/map', syncController.autoMapStations);

// Полная синхронизация
router.post('/full', syncController.fullSync);

// Статус синхронизации
router.get('/status', syncController.getSyncStatus);

// Проверка здоровья системы
router.get('/health', syncController.healthCheck);

export default router;
