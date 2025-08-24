import { Request, Response } from 'express';
import { RaceService } from '../services/raceService';

class RaceController {
    private raceService: RaceService;

    constructor() {
        this.raceService = new RaceService();
        
        // Привязываем методы к экземпляру для сохранения контекста this
        this.searchRaces = this.searchRaces.bind(this);
        this.getRaceInfo = this.getRaceInfo.bind(this);
        this.getAllRaces = this.getAllRaces.bind(this);
    }

    // Поиск рейсов по маршруту
    async searchRaces(req: Request, res: Response) {
        try {
            const { from, to, date } = req.query;

            if (!from || !to || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать: from, to, date'
                });
            }

            console.log('🔍 Поиск рейсов (ДЕМО):', { from, to, date });

            // ДЕМО ДАННЫЕ для тестирования
            const demoRaces = [
                {
                    id: 'demo_001',
                    from: from as string,
                    to: to as string,
                    departureTime: `${date}T08:00:00.000Z`,
                    arrivalTime: `${date}T12:30:00.000Z`,
                    duration: '4ч 30м',
                    price: 1500,
                    currency: 'руб',
                    availableSeats: 25,
                    carrier: 'Сахалинавтотранс',
                    source: 'api1',
                    sourceId: 'gds_demo_001'
                },
                {
                    id: 'demo_002',
                    from: from as string,
                    to: to as string,
                    departureTime: `${date}T14:15:00.000Z`,
                    arrivalTime: `${date}T18:45:00.000Z`,
                    duration: '4ч 30м',
                    price: 1650,
                    currency: 'руб',
                    availableSeats: 12,
                    carrier: 'Островные перевозки',
                    source: 'api2',
                    sourceId: 'paybilet_demo_002'
                },
                {
                    id: 'demo_003',
                    from: from as string,
                    to: to as string,
                    departureTime: `${date}T16:30:00.000Z`,
                    arrivalTime: `${date}T21:00:00.000Z`,
                    duration: '4ч 30м',
                    price: 1400,
                    currency: 'руб',
                    availableSeats: 8,
                    carrier: 'Экспресс-Сахалин',
                    source: 'api1',
                    sourceId: 'gds_demo_003'
                }
            ];

            console.log(`✅ Возвращаю ${demoRaces.length} демо-рейсов`);

            res.json({
                success: true,
                data: {
                    from,
                    to,
                    date,
                    races: demoRaces
                }
            });
        } catch (error) {
            console.error('❌ Ошибка поиска рейсов:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка поиска рейсов',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение информации о конкретном рейсе
    async getRaceInfo(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать ID рейса'
                });
            }

            const raceInfo = await this.raceService.getRaceInfo(id);

            if (!raceInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Рейс не найден'
                });
            }

            res.json({
                success: true,
                data: raceInfo
            });
        } catch (error) {
            console.error('Ошибка получения информации о рейсе:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения информации о рейсе',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение всех доступных рейсов
    async getAllRaces(req: Request, res: Response) {
        try {
            const races = await this.raceService.getAllRaces();

            res.json({
                success: true,
                data: races
            });
        } catch (error) {
            console.error('Ошибка получения всех рейсов:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения всех рейсов',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }
}

export const raceController = new RaceController();
