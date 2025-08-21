import { Api1Service } from './api1Service';
import { Api2Service } from './api2Service';
import StrapiService from './strapiService';

export interface RaceSearchParams {
    from: string;
    to: string;
    date: string;
}

export interface Race {
    id: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    currency: string;
    availableSeats: number;
    carrier: string;
    source: 'api1' | 'api2';
    sourceId: string;
}

export interface RaceInfo extends Race {
    stops: string[];
    busType: string;
    amenities: string[];
    cancellationPolicy: string;
    baggageAllowance: string;
}

export class RaceService {
    private api1Service: Api1Service;
    private api2Service: Api2Service;
    private strapiService: StrapiService;

    constructor() {
        this.api1Service = new Api1Service();
        this.api2Service = new Api2Service();
        this.strapiService = new StrapiService();
    }

    // Поиск рейсов по маршруту
    async searchRaces(params: RaceSearchParams): Promise<Race[]> {
        try {
            console.log('Поиск рейсов:', params);

            // Получаем сопоставленные станции
            const fromStations = await this.getMappedStations(params.from);
            const toStations = await this.getMappedStations(params.to);

            if (!fromStations.length || !toStations.length) {
                console.log('Станции не найдены для сопоставления');
                return [];
            }

            const allRaces: Race[] = [];

            // Поиск в API 1 (GDS)
            try {
                const api1Races = await this.searchApi1Races(params, fromStations, toStations);
                allRaces.push(...api1Races);
            } catch (error) {
                console.error('Ошибка поиска в API 1:', error);
            }

            // Поиск в API 2 (Paybilet)
            try {
                const api2Races = await this.searchApi2Races(params, fromStations, toStations);
                allRaces.push(...api2Races);
            } catch (error) {
                console.error('Ошибка поиска в API 2:', error);
            }

            // Сортируем по времени отправления
            allRaces.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());

            console.log(`Найдено ${allRaces.length} рейсов`);
            return allRaces;

        } catch (error) {
            console.error('Ошибка поиска рейсов:', error);
            throw error;
        }
    }

    // Получение информации о конкретном рейсе
    async getRaceInfo(raceId: string): Promise<RaceInfo | null> {
        try {
            // Определяем источник рейса по ID
            if (raceId.startsWith('api1_')) {
                return await this.getApi1RaceInfo(raceId.replace('api1_', ''));
            } else if (raceId.startsWith('api2_')) {
                return await this.getApi2RaceInfo(raceId.replace('api2_', ''));
            } else {
                // Пробуем найти в обоих API
                const api1Info = await this.getApi1RaceInfo(raceId);
                if (api1Info) return api1Info;

                const api2Info = await this.getApi2RaceInfo(raceId);
                if (api2Info) return api2Info;
            }

            return null;
        } catch (error) {
            console.error('Ошибка получения информации о рейсе:', error);
            throw error;
        }
    }

    // Получение всех доступных рейсов
    async getAllRaces(): Promise<Race[]> {
        try {
            const allRaces: Race[] = [];

            // Получаем рейсы из API 1
            try {
                const api1Races = await this.api1Service.getAllRaces();
                allRaces.push(...api1Races.map(race => ({
                    ...race,
                    source: 'api1' as const,
                    sourceId: `api1_${race.id}`
                })));
            } catch (error) {
                console.error('Ошибка получения рейсов из API 1:', error);
            }

            // Получаем рейсы из API 2
            try {
                const api2Races = await this.api2Service.getAllRaces();
                allRaces.push(...api2Races.map(race => ({
                    ...race,
                    source: 'api2' as const,
                    sourceId: `api2_${race.id}`
                })));
            } catch (error) {
                console.error('Ошибка получения рейсов из API 2:', error);
            }

            return allRaces;
        } catch (error) {
            console.error('Ошибка получения всех рейсов:', error);
            throw error;
        }
    }

    // Поиск в API 1 (GDS)
    private async searchApi1Races(params: RaceSearchParams, fromStations: any[], toStations: any[]): Promise<Race[]> {
        const races: Race[] = [];

        for (const fromStation of fromStations) {
            for (const toStation of toStations) {
                try {
                    const api1Races = await this.api1Service.searchRaces({
                        from: fromStation.station_id,
                        to: toStation.station_id,
                        date: params.date
                    });

                    races.push(...api1Races.map(race => ({
                        ...race,
                        source: 'api1' as const,
                        sourceId: `api1_${race.id}`,
                        from: fromStation.name,
                        to: toStation.name
                    })));
                } catch (error) {
                    console.error(`Ошибка поиска в API 1 для маршрута ${fromStation.name} - ${toStation.name}:`, error);
                }
            }
        }

        return races;
    }

    // Поиск в API 2 (Paybilet)
    private async searchApi2Races(params: RaceSearchParams, fromStations: any[], toStations: any[]): Promise<Race[]> {
        const races: Race[] = [];

        for (const fromStation of fromStations) {
            for (const toStation of toStations) {
                try {
                    const api2Races = await this.api2Service.searchRaces({
                        from: fromStation.station_id,
                        to: toStation.station_id,
                        date: params.date
                    });

                    races.push(...api2Races.map(race => ({
                        ...race,
                        source: 'api2' as const,
                        sourceId: `api2_${race.id}`,
                        from: fromStation.name,
                        to: toStation.name
                    })));
                } catch (error) {
                    console.error(`Ошибка поиска в API 2 для маршрута ${fromStation.name} - ${toStation.name}:`, error);
                }
            }
        }

        return races;
    }

    // Получение информации о рейсе из API 1
    private async getApi1RaceInfo(raceId: string): Promise<RaceInfo | null> {
        try {
            const raceInfo = await this.api1Service.getRaceInfo(raceId);
            if (!raceInfo) return null;

            return {
                ...raceInfo,
                source: 'api1' as const,
                sourceId: `api1_${raceId}`
            };
        } catch (error) {
            console.error('Ошибка получения информации о рейсе из API 1:', error);
            return null;
        }
    }

    // Получение информации о рейсе из API 2
    private async getApi2RaceInfo(raceId: string): Promise<RaceInfo | null> {
        try {
            const raceInfo = await this.api2Service.getRaceInfo(raceId);
            if (!raceInfo) return null;

            return {
                ...raceInfo,
                source: 'api2' as const,
                sourceId: `api2_${raceId}`
            };
        } catch (error) {
            console.error('Ошибка получения информации о рейсе из API 2:', error);
            return null;
        }
    }

    // Получение сопоставленных станций
    private async getMappedStations(stationName: string): Promise<any[]> {
        try {
            // Ищем станцию в сопоставлениях
            const mappings = await this.strapiService.getStationMappings();
            
            const mappedStations = mappings.filter(mapping => {
                const api1Station = mapping.api1_station;
                const api2Station = mapping.api2_station;
                
                return (api1Station && api1Station.name.toLowerCase().includes(stationName.toLowerCase())) ||
                       (api2Station && api2Station.name.toLowerCase().includes(stationName.toLowerCase()));
            });

            if (mappedStations.length > 0) {
                return mappedStations.map(mapping => ({
                    station_id: mapping.api1_station?.station_id || mapping.api2_station?.station_id,
                    name: mapping.display_name,
                    source: mapping.api1_station ? 'api1' : 'api2'
                }));
            }

            // Если сопоставлений нет, ищем по названию
            const api1Stations = await this.strapiService.getApi1Stations();
            const api2Stations = await this.strapiService.getApi2Stations();

            const foundStations = [
                ...api1Stations.filter(s => s.name.toLowerCase().includes(stationName.toLowerCase())),
                ...api2Stations.filter(s => s.name.toLowerCase().includes(stationName.toLowerCase()))
            ];

            return foundStations.map(station => ({
                station_id: station.station_id,
                name: station.name,
                source: 'api1' in station ? 'api1' : 'api2'
            }));

        } catch (error) {
            console.error('Ошибка получения сопоставленных станций:', error);
            return [];
        }
    }
}
