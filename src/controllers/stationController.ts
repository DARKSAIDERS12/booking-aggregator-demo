import { Request, Response } from 'express';

class StationController {
    constructor() {
        // Привязываем методы к экземпляру для сохранения контекста this
        this.getAllStations = this.getAllStations.bind(this);
        this.getStationsFrom = this.getStationsFrom.bind(this);
        this.getStationMappings = this.getStationMappings.bind(this);
        this.createStationMapping = this.createStationMapping.bind(this);
        this.getStationGroups = this.getStationGroups.bind(this);
        this.createStationGroup = this.createStationGroup.bind(this);
        this.updateStationGroup = this.updateStationGroup.bind(this);
    }

    // Получение всех станций
    async getAllStations(req: Request, res: Response) {
        try {
            console.log('StationController: получение всех станций');
            
            // Тестовые данные
            const testStations = [
                {
                    id: 'gds_1',
                    name: 'Южно-Сахалинск',
                    code: 'YSS',
                    city: 'Южно-Сахалинск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 46.9641, lng: 142.7380 },
                    source: 'api1',
                    sourceId: 'api1_gds_1'
                },
                {
                    id: 'gds_2',
                    name: 'Холмск',
                    code: 'KHM',
                    city: 'Холмск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 47.0406, lng: 142.0416 },
                    source: 'api1',
                    sourceId: 'api1_gds_2'
                },
                {
                    id: 'pb_1',
                    name: 'Южно-Сахалинск',
                    code: 'YSS',
                    city: 'Южно-Сахалинск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 46.9641, lng: 142.7380 },
                    source: 'api2',
                    sourceId: 'api2_pb_1'
                },
                {
                    id: 'pb_2',
                    name: 'Холмск',
                    code: 'KHM',
                    city: 'Холмск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 47.0406, lng: 142.0416 },
                    source: 'api2',
                    sourceId: 'api2_pb_2'
                },
                {
                    id: 'pb_3',
                    name: 'Корсаков',
                    code: 'KRS',
                    city: 'Корсаков',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 46.6333, lng: 142.7667 },
                    source: 'api2',
                    sourceId: 'api2_pb_3'
                }
            ];

            console.log(`StationController: возвращаю ${testStations.length} станций`);
            
            res.json({
                success: true,
                data: testStations
            });
        } catch (error) {
            console.error('StationController: ошибка получения станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение станций назначения из указанной станции отправления
    async getStationsFrom(req: Request, res: Response) {
        try {
            const { from } = req.query;
            console.log('StationController: получение станций назначения для станции:', from);

            if (!from) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать параметр from'
                });
            }

            // Тестовые данные
            const testStations = [
                {
                    id: 'gds_2',
                    name: 'Холмск',
                    code: 'KHM',
                    city: 'Холмск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 47.0406, lng: 142.0416 },
                    source: 'api1',
                    sourceId: 'api1_gds_2'
                },
                {
                    id: 'pb_3',
                    name: 'Корсаков',
                    code: 'KRS',
                    city: 'Корсаков',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 46.6333, lng: 142.7667 },
                    source: 'api2',
                    sourceId: 'api2_pb_3'
                }
            ];

            res.json({
                success: true,
                data: testStations
            });
        } catch (error) {
            console.error('StationController: ошибка получения станций назначения:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения станций назначения',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение сопоставлений станций
    async getStationMappings(req: Request, res: Response) {
        try {
            console.log('StationController: получение сопоставлений станций');
            
            res.json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error('StationController: ошибка получения сопоставлений станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения сопоставлений станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Создание сопоставления станций
    async createStationMapping(req: Request, res: Response) {
        try {
            const mappingData = req.body;
            console.log('StationController: создание сопоставления станций:', mappingData);

            if (!mappingData.api1_station_id && !mappingData.api2_station_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать хотя бы одну станцию'
                });
            }

            const mapping = {
                id: `mapping_${Date.now()}`,
                ...mappingData,
                created_at: new Date().toISOString()
            };

            res.json({
                success: true,
                data: mapping,
                message: 'Сопоставление станций создано'
            });
        } catch (error) {
            console.error('StationController: ошибка создания сопоставления станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка создания сопоставления станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение групп станций
    async getStationGroups(req: Request, res: Response) {
        try {
            console.log('StationController: получение групп станций');
            
            res.json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error('StationController: ошибка получения групп станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения групп станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Создание группы станций
    async createStationGroup(req: Request, res: Response) {
        try {
            const groupData = req.body;
            console.log('StationController: создание группы станций:', groupData);

            if (!groupData.name || !groupData.main_station_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать name и main_station_id'
                });
            }

            const group = {
                id: `group_${Date.now()}`,
                ...groupData,
                created_at: new Date().toISOString()
            };

            res.json({
                success: true,
                data: group,
                message: 'Группа станций создана'
            });
        } catch (error) {
            console.error('StationController: ошибка создания группы станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка создания группы станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Обновление группы станций
    async updateStationGroup(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log('StationController: обновление группы станций:', id, updateData);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать ID группы'
                });
            }

            const group = {
                id,
                ...updateData,
                updated_at: new Date().toISOString()
            };

            res.json({
                success: true,
                data: group,
                message: 'Группа станций обновлена'
            });
        } catch (error) {
            console.error('StationController: ошибка обновления группы станций:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления группы станций',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }
}

export const stationController = new StationController();
