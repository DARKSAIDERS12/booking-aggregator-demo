import { Router } from 'express';
import { syncController } from '../controllers/syncController';

const router = Router();

// Синхронизация станций API 1
router.post('/api1-stations', syncController.syncApi1Stations);

// Синхронизация станций API 2
router.post('/api2-stations', syncController.syncApi2Stations);

// Автоматическое сопоставление станций
router.post('/auto-map', syncController.autoMapStations);

// Полная синхронизация
router.post('/all', syncController.syncAll);

export default router;
