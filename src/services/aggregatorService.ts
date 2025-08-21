import { Api1Service } from './api1Service';
import { Api2Service } from './api2Service';
import { Station, Route } from '../types';

// Расширенный тип Route с источником API
type RouteWithSource = Route & { source: 'GDS API 1' | 'RF Bus API 2' };

export class AggregatorService {
  private api1: Api1Service;
  private api2: Api2Service;

  constructor() {
    this.api1 = new Api1Service();
    this.api2 = new Api2Service();
  }

  // Получение всех станций из обоих API
  async getAllStations(): Promise<Station[]> {
    try {
      console.log('🔍 Агрегация станций из двух API...');
      
      const [stationsApi1, stationsApi2] = await Promise.allSettled([
        this.api1.getStations(),
        this.api2.getStations()
      ]);

      let allStations: Station[] = [];

      // Добавляем станции из API 1
      if (stationsApi1.status === 'fulfilled') {
        console.log(`✅ Получено ${stationsApi1.value.length} станций из GDS API 1`);
        allStations.push(...stationsApi1.value);
      } else {
        console.warn('⚠️ Не удалось получить станции из GDS API 1:', stationsApi1.reason);
      }

      // Добавляем станции из API 2
      if (stationsApi2.status === 'fulfilled') {
        console.log(`✅ Получено ${stationsApi2.value.length} станций из RF Bus API 2`);
        allStations.push(...stationsApi2.value);
      } else {
        console.warn('⚠️ Не удалось получить станции из RF Bus API 2:', stationsApi2.reason);
      }

      // Убираем дубликаты по названию
      const uniqueStations = this.removeDuplicateStations(allStations);
      
      console.log(`📊 Итого уникальных станций: ${uniqueStations.length}`);
      return uniqueStations;
    } catch (error) {
      console.error('❌ Ошибка агрегации станций:', error);
      throw error;
    }
  }

  // Получение станций назначения из конкретной станции
  async getStationsFrom(fromStationId: string): Promise<Station[]> {
    try {
      console.log(`🔍 Агрегация станций назначения из ${fromStationId}...`);
      
      const [stationsApi1, stationsApi2] = await Promise.allSettled([
        this.api1.getStationsFrom(fromStationId),
        this.api2.getStationsFrom(fromStationId)
      ]);

      let allStations: Station[] = [];

      // Добавляем станции из API 1
      if (stationsApi1.status === 'fulfilled') {
        console.log(`✅ Получено ${stationsApi1.value.length} станций назначения из GDS API 1`);
        allStations.push(...stationsApi1.value);
      } else {
        console.warn('⚠️ Не удалось получить станции назначения из GDS API 1:', stationsApi1.reason);
      }

      // Добавляем станции из API 2
      if (stationsApi2.status === 'fulfilled') {
        console.log(`✅ Получено ${stationsApi2.value.length} станций назначения из RF Bus API 2`);
        allStations.push(...stationsApi2.value);
      } else {
        console.warn('⚠️ Не удалось получить станции назначения из RF Bus API 2:', stationsApi2.reason);
      }

      // Убираем дубликаты по названию
      const uniqueStations = this.removeDuplicateStations(allStations);
      
      console.log(`📊 Итого уникальных станций назначения: ${uniqueStations.length}`);
      return uniqueStations;
    } catch (error) {
      console.error('❌ Ошибка агрегации станций назначения:', error);
      throw error;
    }
  }

  // Поиск рейсов в обоих API
  async searchRoutes(params: { from: string; to: string; date: string }): Promise<RouteWithSource[]> {
    try {
      console.log('🔍 Агрегация поиска рейсов из двух API:', params);
      
      const [routesApi1, routesApi2] = await Promise.allSettled([
        this.api1.searchRoutes(params),
        this.api2.searchRoutes(params)
      ]);

      let allRoutes: RouteWithSource[] = [];

      // Добавляем рейсы из API 1
      if (routesApi1.status === 'fulfilled') {
        console.log(`✅ Найдено ${routesApi1.value.length} рейсов в GDS API 1`);
        // Добавляем источник API
        const routesWithSource = routesApi1.value.map(route => ({
          ...route,
          source: 'GDS API 1' as const
        }));
        allRoutes.push(...routesWithSource);
      } else {
        console.warn('⚠️ Не удалось найти рейсы в GDS API 1:', routesApi1.reason);
      }

      // Добавляем рейсы из API 2
      if (routesApi2.status === 'fulfilled') {
        console.log(`✅ Найдено ${routesApi2.value.length} рейсов в RF Bus API 2`);
        // Добавляем источник API
        const routesWithSource = routesApi2.value.map(route => ({
          ...route,
          source: 'RF Bus API 2' as const
        }));
        allRoutes.push(...routesWithSource);
      } else {
        console.warn('⚠️ Не удалось найти рейсы в RF Bus API 2:', routesApi2.reason);
      }

      // Убираем дубликаты рейсов
      const uniqueRoutes = this.removeDuplicateRoutes(allRoutes);
      
      // Сортируем по времени отправления
      const sortedRoutes = this.sortRoutesByDeparture(uniqueRoutes);
      
      console.log(`📊 Итого уникальных рейсов: ${sortedRoutes.length}`);
      return sortedRoutes;
    } catch (error) {
      console.error('❌ Ошибка агрегации поиска рейсов:', error);
      throw error;
    }
  }

  // Получение детальной информации о рейсе
  async getRouteInfo(routeId: string, source?: 'GDS API 1' | 'RF Bus API 2'): Promise<RouteWithSource> {
    try {
      console.log(`🔍 Получение информации о рейсе ${routeId}...`);
      
      // Если указан источник, используем конкретный API
      if (source === 'GDS API 1') {
        const route = await this.api1.getRouteInfo(routeId);
        return { ...route, source: 'GDS API 1' as const };
      } else if (source === 'RF Bus API 2') {
        const route = await this.api2.getRouteInfo(routeId);
        return { ...route, source: 'RF Bus API 2' as const };
      }

      // Иначе пробуем оба API
      try {
        const route = await this.api1.getRouteInfo(routeId);
        console.log('✅ Информация о рейсе получена из GDS API 1');
        return { ...route, source: 'GDS API 1' as const };
      } catch (error) {
        console.log('🔄 Пробуем RF Bus API 2...');
        const route = await this.api2.getRouteInfo(routeId);
        console.log('✅ Информация о рейсе получена из RF Bus API 2');
        return { ...route, source: 'RF Bus API 2' as const };
      }
    } catch (error) {
      console.error('❌ Ошибка получения информации о рейсе:', error);
      throw error;
    }
  }

  // Тест соединения с обоими API
  async testConnections(): Promise<{
    api1: boolean;
    api2: boolean;
    summary: string;
  }> {
    try {
      console.log('🔌 Тестирование соединений с API...');
      
      const [api1Result, api2Result] = await Promise.allSettled([
        this.api1.testConnection(),
        this.testApi2Connection()
      ]);

      const api1Status = api1Result.status === 'fulfilled' ? api1Result.value : false;
      const api2Status = api2Result.status === 'fulfilled' ? api2Result.value : false;

      let summary = '';
      if (api1Status && api2Status) {
        summary = '✅ Оба API доступны';
      } else if (api1Status) {
        summary = '⚠️ Только GDS API 1 доступен';
      } else if (api2Status) {
        summary = '⚠️ Только RF Bus API 2 доступен';
      } else {
        summary = '❌ Оба API недоступны';
      }

      console.log(`📊 Статус API: GDS API 1: ${api1Status ? '✅' : '❌'}, RF Bus API 2: ${api2Status ? '✅' : '❌'}`);
      
      return {
        api1: api1Status,
        api2: api2Status,
        summary
      };
    } catch (error) {
      console.error('❌ Ошибка тестирования соединений:', error);
      throw error;
    }
  }

  // Приватные методы

  // Удаление дубликатов станций
  private removeDuplicateStations(stations: Station[]): Station[] {
    const seen = new Set<string>();
    return stations.filter(station => {
      const key = station.name.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Удаление дубликатов рейсов
  private removeDuplicateRoutes(routes: RouteWithSource[]): RouteWithSource[] {
    const seen = new Set<string>();
    return routes.filter(route => {
      // Создаем ключ для сравнения: маршрут + время + перевозчик
      const key = `${route.from.name}-${route.to.name}-${route.departureTime}-${route.carrier}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Сортировка рейсов по времени отправления
  private sortRoutesByDeparture(routes: RouteWithSource[]): RouteWithSource[] {
    return routes.sort((a, b) => {
      const timeA = new Date(a.departureTime).getTime();
      const timeB = new Date(b.departureTime).getTime();
      return timeA - timeB;
    });
  }

  // Тест соединения с API 2 (заглушка)
  private async testApi2Connection(): Promise<boolean> {
    try {
      // Простой тест - попробуем получить станции
      await this.api2.getStations();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Получение статистики по API
  async getApiStats(): Promise<{
    totalStations: number;
    totalRoutes: number;
    api1Status: boolean;
    api2Status: boolean;
    lastUpdate: Date;
  }> {
    try {
      const connections = await this.testConnections();
      const stations = await this.getAllStations();
      
      return {
        totalStations: stations.length,
        totalRoutes: 0, // Будет обновляться при поиске
        api1Status: connections.api1,
        api2Status: connections.api2,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики API:', error);
      throw error;
    }
  }
}
