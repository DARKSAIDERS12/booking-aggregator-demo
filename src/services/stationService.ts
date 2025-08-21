import { Api1Service } from './api1Service';
import { Api2Service } from './api2Service';

export interface Station {
    id: string;
    name: string;
    code?: string;
    city?: string;
    region?: string;
    country?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    source: 'api1' | 'api2';
    sourceId: string;
}

export interface StationMapping {
    id: string;
    api1_station?: Station;
    api2_station?: Station;
    display_name: string;
    is_auto_mapped: boolean;
    created_at: string;
}

export interface StationGroup {
    id: string;
    name: string;
    main_station: Station;
    child_stations: Station[];
    description?: string;
    created_at: string;
}

export class StationService {
    constructor() {
        console.log('StationService инициализирован');
    }

    // Получение всех станций
    async getAllStations(): Promise<Station[]> {
        try {
            console.log('Получение всех станций...');
            
            // Тестовые данные
            const testStations: Station[] = [
                {
                    id: 'gds_1',
                    name: 'Южно-Сахалинск',
                    code: 'YSS',
                    city: 'Южно-Сахалинск',
                    region: 'Сахалинская область',
                    country: 'Россия',
                    coordinates: { lat: 46.9641, lng: 142.7380 },
                    source: 'api1' as const,
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
                    source: 'api1' as const,
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
                    source: 'api2' as const,
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
                    source: 'api2' as const,
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
                    source: 'api2' as const,
                    sourceId: 'api2_pb_3'
                }
            ];

            console.log(`Возвращаю ${testStations.length} тестовых станций`);
            return testStations;

        } catch (error) {
            console.error('Ошибка получения всех станций:', error);
            throw error;
        }
    }

    // Получение станций назначения из указанной станции отправления
    async getStationsFrom(fromStationId: string): Promise<Station[]> {
        try {
            console.log('Получение станций назначения для станции:', fromStationId);
            
            const allStations = await this.getAllStations();
            const destinationStations = allStations.filter(station => 
                station.sourceId !== fromStationId && 
                station.id !== fromStationId
            );

            console.log(`Найдено ${destinationStations.length} станций назначения`);
            return destinationStations;

        } catch (error) {
            console.error('Ошибка получения станций назначения:', error);
            throw error;
        }
    }

    // Получение сопоставлений станций (заглушка)
    async getStationMappings(): Promise<StationMapping[]> {
        try {
            console.log('Получение сопоставлений станций...');
            return [];
        } catch (error) {
            console.error('Ошибка получения сопоставлений станций:', error);
            return [];
        }
    }

    // Создание сопоставления станций (заглушка)
    async createStationMapping(mappingData: any): Promise<any> {
        try {
            console.log('Создание сопоставления станций:', mappingData);
            return {
                id: `mapping_${Date.now()}`,
                ...mappingData,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка создания сопоставления станций:', error);
            throw error;
        }
    }

    // Получение групп станций (заглушка)
    async getStationGroups(): Promise<StationGroup[]> {
        try {
            console.log('Получение групп станций...');
            return [];
        } catch (error) {
            console.error('Ошибка получения групп станций:', error);
            return [];
        }
    }

    // Создание группы станций (заглушка)
    async createStationGroup(groupData: any): Promise<any> {
        try {
            console.log('Создание группы станций:', groupData);
            return {
                id: `group_${Date.now()}`,
                ...groupData,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка создания группы станций:', error);
            throw error;
        }
    }

    // Обновление группы станций (заглушка)
    async updateStationGroup(groupId: string, updateData: any): Promise<any> {
        try {
            console.log('Обновление группы станций:', groupId, updateData);
            return {
                id: groupId,
                ...updateData,
                updated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка обновления группы станций:', error);
            throw error;
        }
    }

    // Автоматическое сопоставление станций
    async autoMapStations(): Promise<StationMapping[]> {
        try {
            console.log('Запуск автоматического сопоставления станций...');
            
            // Пока возвращаем пустой массив
            return [];
            
        } catch (error) {
            console.error('Ошибка автоматического сопоставления станций:', error);
            throw error;
        }
    }
}
