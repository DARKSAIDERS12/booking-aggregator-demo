import StrapiService from './strapiService';
import { Api1Service } from './api1Service';
import { Api2Service } from './api2Service';

export interface Station {
    id: string;
    name: string;
    code: string;
    city: string;
    region: string;
    country: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    source: 'api1' | 'api2';
    sourceId: string;
}

export interface StationMapping {
    id: string;
    api1_station_id?: string;
    api2_station_id?: string;
    created_date: string;
}

export interface StationGroup {
    id: string;
    name: string;
    main_station_id: string;
    child_station_ids: string[];
    created_at: string;
}

export class StationService {
    private strapiService: StrapiService;
    private api1Service: Api1Service;
    private api2Service: Api2Service;

    constructor() {
        this.strapiService = new StrapiService();
        this.api1Service = new Api1Service();
        this.api2Service = new Api2Service();
        console.log('StationService инициализирован');
    }

    // Получение всех станций
    async getAllStations(): Promise<Station[]> {
        try {
            console.log('🚉 Получение всех станций...');
            
            // Получаем станции из Strapi
            console.log('🔧 StrapiService инициализирован:', !!this.strapiService);
            
            // Принудительно вызываем Strapi
            console.log('🔧 Принудительно вызываем Strapi...');
            
            const api1Stations: any = await this.strapiService.getApi1Stations();
            console.log('📡 Вызываем StrapiService.getApi1Stations()...');
            console.log('📊 Структура api1Stations:', JSON.stringify(api1Stations, null, 2));
            
            const api2Stations: any = await this.strapiService.getApi2Stations();
            console.log('📡 Вызываем StrapiService.getApi2Stations()...');
            console.log('📊 Структура api2Stations:', JSON.stringify(api2Stations, null, 2));
            
            // Объединяем станции
            const stations: Station[] = [];
            
            // Добавляем станции из API1
            if (api1Stations && api1Stations.data && Array.isArray(api1Stations.data)) {
                api1Stations.data.forEach((station: any) => {
                    if (station && station.name) {
                        stations.push({
                            id: station.station_id || station.id || `api1_${Date.now()}_${Math.random()}`,
                            name: station.name,
                            code: station.code || station.name.substring(0, 3).toUpperCase(),
                            city: station.name, // В Strapi нет поля city, используем name
                            region: station.region || 'Неизвестно',
                            country: station.country || 'Россия',
                            coordinates: station.coordinates || { lat: 0, lng: 0 },
                            source: 'api1' as const,
                            sourceId: `api1_${station.station_id || station.id || station.name}`
                        });
                    }
                });
            }
            
            // Добавляем станции из API2
            if (api2Stations && api2Stations.data && Array.isArray(api2Stations.data)) {
                api2Stations.data.forEach((station: any) => {
                    if (station && station.name) {
                        stations.push({
                            id: station.station_id || station.id || `api2_${Date.now()}_${Math.random()}`,
                            name: station.name,
                            code: station.code || station.name.substring(0, 3).toUpperCase(),
                            city: station.name, // В Strapi нет поля city, используем name
                            region: station.region || 'Неизвестно',
                            country: station.country || 'Россия',
                            coordinates: station.coordinates || { lat: 0, lng: 0 },
                            source: 'api2' as const,
                            sourceId: `api2_${station.station_id || station.id || station.name}`
                        });
                    }
                });
            }
            
            // Если в Strapi нет данных, возвращаем пустой массив
            if (stations.length === 0) {
                console.log('⚠️ В Strapi нет данных, возвращаем пустой массив');
                return [];
            }
            
            console.log(`✅ Получено ${stations.length} станций`);
            return stations;
            
        } catch (error) {
            console.error('❌ Ошибка получения всех станций:', error);
            // Возвращаем пустой массив в случае ошибки
            return [];
        }
    }

    // Получение станций назначения из указанной станции отправления
    async getStationsFrom(fromStationId: string): Promise<Station[]> {
        try {
            console.log('🚉 Получение станций назначения для станции:', fromStationId);
            
            // Получаем все станции
            const allStations = await this.getAllStations();
            
            // Фильтруем станции назначения (исключаем станцию отправления)
            const destinationStations = allStations.filter(station => 
                station.id !== fromStationId && station.source !== 'api1'
            );
            
            console.log(`Найдено ${destinationStations.length} станций назначения`);
            return destinationStations;
            
        } catch (error) {
            console.error('❌ Ошибка получения станций назначения:', error);
            return [];
        }
    }

    // Получение сопоставлений станций
    async getStationMappings(): Promise<StationMapping[]> {
        try {
            const mappings = await this.strapiService.getStationMappings();
            return mappings || [];
        } catch (error) {
            console.error('❌ Ошибка получения сопоставлений станций:', error);
            return [];
        }
    }

    // Создание сопоставления станций
    async createStationMapping(mappingData: Partial<StationMapping>): Promise<StationMapping> {
        try {
            const mapping = await this.strapiService.createStationMapping(mappingData);
            return mapping;
        } catch (error) {
            console.error('❌ Ошибка получения сопоставлений станций:', error);
            throw error;
        }
    }

    // Получение групп станций
    async getStationGroups(): Promise<StationGroup[]> {
        try {
            const groups = await this.strapiService.getStationGroups();
            return groups || [];
        } catch (error) {
            console.error('❌ Ошибка получения групп станций:', error);
            throw error;
        }
    }

    // Создание группы станций
    async createStationGroup(name: string, mainStationId: string, childStationIds: string[]): Promise<any> {
        try {
            console.log(`🏗️ Создание группы станций: ${name}`);
            
            // Проверяем, что главная станция существует
            const allStations = await this.getAllStations();
            const mainStation = allStations.find(s => s.id === mainStationId);
            
            if (!mainStation) {
                throw new Error(`Главная станция с ID ${mainStationId} не найдена`);
            }
            
            // Проверяем, что дочерние станции существуют
            for (const childId of childStationIds) {
                const childStation = allStations.find(s => s.id === childId);
                if (!childStation) {
                    throw new Error(`Дочерняя станция с ID ${childId} не найдена`);
                }
            }
            
            // Создаем группу
            const group = await this.strapiService.createStationGroupWithData(name, mainStationId, childStationIds);
            console.log(`✅ Группа станций создана: ${name} (главная: ${mainStation.name})`);
            
            return group;
        } catch (error) {
            console.error('❌ Ошибка создания группы станций:', error);
            throw error;
        }
    }

    // Обновление группы станций
    async updateStationGroup(id: string, updateData: Partial<StationGroup>): Promise<StationGroup> {
        try {
            const group = await this.strapiService.updateStationGroup(id, updateData);
            return group;
        } catch (error) {
            console.error('❌ Ошибка обновления группы станций:', error);
            throw error;
        }
    }

    // Автоматическое сопоставление станций
    async autoMapStations(): Promise<StationMapping[]> {
        try {
            console.log('🔄 Запуск автоматического сопоставления станций...');
            
            const allStations = await this.getAllStations();
            const api1Stations = allStations.filter(s => s.source === 'api1');
            const api2Stations = allStations.filter(s => s.source === 'api2');
            
            console.log(`📊 Станций API1: ${api1Stations.length}, API2: ${api2Stations.length}`);
            
            const mappings: StationMapping[] = [];
            
            // 1. Точное сопоставление по названию
            for (const api1Station of api1Stations) {
                for (const api2Station of api2Stations) {
                    if (api1Station.name.toLowerCase() === api2Station.name.toLowerCase()) {
                        const mapping = {
                            id: `mapping_${Date.now()}_${Math.random()}`,
                            api1_station_id: api1Station.id,
                            api2_station_id: api2Station.id,
                            created_date: new Date().toISOString()
                        };
                        mappings.push(mapping);
                        console.log(`✅ Точное совпадение: "${api1Station.name}" <-> "${api2Station.name}"`);
                    }
                }
            }
            
            // 2. Нечеткое сопоставление (содержит ключевые слова)
            const usedApi1 = new Set(mappings.map(m => m.api1_station_id));
            const usedApi2 = new Set(mappings.map(m => m.api2_station_id));
            
            for (const api1Station of api1Stations) {
                if (usedApi1.has(api1Station.id)) continue;
                
                for (const api2Station of api2Stations) {
                    if (usedApi2.has(api2Station.id)) continue;
                    
                    const name1 = api1Station.name.toLowerCase().replace(/\s+/g, ' ').trim();
                    const name2 = api2Station.name.toLowerCase().replace(/\s+/g, ' ').trim();
                    
                    // Проверяем, содержит ли одно название другое
                    if (name1.includes(name2) || name2.includes(name1)) {
                        const mapping = {
                            id: `mapping_${Date.now()}_${Math.random()}`,
                            api1_station_id: api1Station.id,
                            api2_station_id: api2Station.id,
                            created_date: new Date().toISOString()
                        };
                        mappings.push(mapping);
                        usedApi1.add(api1Station.id);
                        usedApi2.add(api2Station.id);
                        console.log(`🔍 Нечеткое совпадение: "${api1Station.name}" <-> "${api2Station.name}"`);
                        break;
                    }
                }
            }
            
            // 3. Сохраняем сопоставления в Strapi
            for (const mapping of mappings) {
                try {
                    await this.strapiService.createStationMapping(mapping);
                    console.log(`💾 Сопоставление сохранено в Strapi: ${mapping.api1_station_id} <-> ${mapping.api2_station_id}`);
                } catch (error) {
                    console.error(`❌ Ошибка сохранения сопоставления:`, error);
                }
            }
            
            console.log(`🎯 Создано ${mappings.length} сопоставлений`);
            return mappings;
        } catch (error) {
            console.error('❌ Ошибка автоматического сопоставления станций:', error);
            return [];
        }
    }

    // Ручное сопоставление станций
    async createManualStationMapping(api1StationId: string, api2StationId: string): Promise<StationMapping> {
        try {
            console.log(`🔗 Создание ручного сопоставления: ${api1StationId} <-> ${api2StationId}`);
            
            // Проверяем, что станции существуют
            const allStations = await this.getAllStations();
            const api1Station = allStations.find(s => s.id === api1StationId && s.source === 'api1');
            const api2Station = allStations.find(s => s.id === api2StationId && s.source === 'api2');
            
            if (!api1Station) {
                throw new Error(`Станция API1 с ID ${api1StationId} не найдена`);
            }
            if (!api2Station) {
                throw new Error(`Станция API2 с ID ${api2StationId} не найдена`);
            }
            
            // Проверяем, что сопоставление еще не существует
            const existingMappingsResponse = await this.strapiService.getStationMappings();
            const existingMappings = (existingMappingsResponse as any).data || existingMappingsResponse || [];
            
            if (!Array.isArray(existingMappings)) {
                console.warn('⚠️ existingMappings не является массивом:', typeof existingMappings, existingMappings);
                // Если не массив, считаем что сопоставлений нет
            } else {
                const exists = existingMappings.some(m => 
                    m.api1_station_id === api1StationId && m.api2_station_id === api2StationId
                );
                
                if (exists) {
                    throw new Error(`Сопоставление ${api1StationId} <-> ${api2StationId} уже существует`);
                }
            }
            
            // Создаем сопоставление
            const mapping = await this.strapiService.createManualStationMapping(api1StationId, api2StationId);
            console.log(`✅ Ручное сопоставление создано: ${api1Station.name} <-> ${api2Station.name}`);
            
            return {
                id: mapping.id || `manual_${Date.now()}`,
                api1_station_id: api1StationId,
                api2_station_id: api2StationId,
                created_date: mapping.created_date || new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Ошибка создания ручного сопоставления:', error);
            throw error;
        }
    }
}

