import { Router } from 'express';
import { stationController } from '../controllers/stationController';

const router = Router();

// Получение всех станций
router.get('/', stationController.getAllStations);

// Получение станций назначения из указанной станции отправления
router.get('/from', stationController.getStationsFrom);

// Получение сопоставлений станций
router.get('/mappings', stationController.getStationMappings);

// Создание сопоставления станций
router.post('/mappings', stationController.createStationMapping);

// Получение групп станций
router.get('/groups', stationController.getStationGroups);

// Создание группы станций
router.post('/groups', stationController.createStationGroup);

// Обновление группы станций
router.put('/groups/:id', stationController.updateStationGroup);

export default router;

