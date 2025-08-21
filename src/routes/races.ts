import { Router } from 'express';
import { raceController } from '../controllers/raceController';

const router = Router();

// Поиск рейсов по маршруту
router.get('/search', raceController.searchRaces);

// Получение всех доступных рейсов (должен быть перед /:id)
router.get('/', raceController.getAllRaces);

// Получение информации о конкретном рейсе
router.get('/:id', raceController.getRaceInfo);

export default router;
