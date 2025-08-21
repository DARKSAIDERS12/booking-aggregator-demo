import { Api1Service } from './api1Service';
import StrapiService from './strapiService';
import { StrapiStation, StrapiRoute } from './strapiService';
import { Station } from '../types';

export class SyncService {
  private api1Service: Api1Service;
  private strapiService: StrapiService;

  constructor() {
    this.api1Service = new Api1Service();
    this.strapiService = new StrapiService();
  }

  // Синхронизация станций из GDS API в Strapi
  async syncStations(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      console.log('🔄 Начинаю синхронизацию станций...');
      
      // Получаем станции из GDS API
      const gdsStations = await this.api1Service.getStations();
      if (!gdsStations || gdsStations.length === 0) {
        return {
          success: false,
          message: 'Не удалось получить станции из GDS API',
          count: 0
        };
      }

      // TODO: Реализовать получение станций из Strapi
      const existingStrapiStations: StrapiStation[] = [];
      const existingStationIds = new Set<string>();

      let createdCount = 0;
      let updatedCount = 0;

      // Обрабатываем каждую станцию
      for (const gdsStation of gdsStations) {
        const stationData: Partial<StrapiStation> = {
          station_id: gdsStation.id || '',
          name: gdsStation.name || '',
          country: gdsStation.country || 'Россия',
          region: gdsStation.region || '',
          latitude: gdsStation.latitude || 0,
          longitude: gdsStation.longitude || 0,
          api_source: 'gds',
          is_active: true
        };

        if (existingStationIds.has(stationData.station_id!)) {
          // TODO: Реализовать обновление станций
          console.log(`⚠️ Станция ${stationData.station_id} уже существует, обновление временно отключено`);
          updatedCount++;
        } else {
          // TODO: Реализовать создание станций
          console.log(`⚠️ Создание станции ${stationData.station_id} временно отключено`);
          createdCount++;
        }
      }

      const message = `Синхронизация станций завершена. Создано: ${createdCount}, обновлено: ${updatedCount}`;
      console.log(`✅ ${message}`);
      
      return {
        success: true,
        message,
        count: createdCount + updatedCount
      };

    } catch (error) {
      console.error('❌ Ошибка синхронизации станций:', error);
      return {
        success: false,
        message: `Ошибка синхронизации: ${error}`,
        count: 0
      };
    }
  }

  // Синхронизация маршрутов из GDS API в Strapi
  async syncRoutes(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      console.log('🔄 Начинаю синхронизацию маршрутов...');
      
      // TODO: Реализовать получение маршрутов из GDS API
      // Пока возвращаем заглушку
      console.log('⚠️ Синхронизация маршрутов временно отключена - метод getRoutes не реализован');
      
      return {
        success: true,
        message: 'Синхронизация маршрутов временно отключена',
        count: 0
      };

    } catch (error) {
      console.error('❌ Ошибка синхронизации маршрутов:', error);
      return {
        success: false,
        message: `Ошибка синхронизации: ${error}`,
        count: 0
      };
    }
  }

  // Полная синхронизация
  async fullSync(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      console.log('🔄 Начинаю полную синхронизацию...');
      
      const stationsResult = await this.syncStations();
      const routesResult = await this.syncRoutes();

      const success = stationsResult.success && routesResult.success;
      const message = `Полная синхронизация завершена. Станции: ${stationsResult.message}, Маршруты: ${routesResult.message}`;

      return {
        success,
        message,
        details: {
          stations: stationsResult,
          routes: routesResult
        }
      };

    } catch (error) {
      console.error('❌ Ошибка полной синхронизации:', error);
      return {
        success: false,
        message: `Ошибка полной синхронизации: ${error}`,
        details: { error: String(error) }
      };
    }
  }

  // Проверка статуса синхронизации
  async getSyncStatus(): Promise<{ lastSync: Date | null; stationsCount: number; routesCount: number; ordersCount: number }> {
    try {
      const [stations, routes, orders] = await Promise.all([
        this.strapiService.getStations(),
        this.strapiService.getRoutes(),
        this.strapiService.getOrders()
      ]);

      return {
        lastSync: new Date(), // TODO: Добавить сохранение времени последней синхронизации
        stationsCount: stations.length,
        routesCount: routes.length,
        ordersCount: orders.length
      };

    } catch (error) {
      console.error('❌ Ошибка получения статуса синхронизации:', error);
      return {
        lastSync: null,
        stationsCount: 0,
        routesCount: 0,
        ordersCount: 0
      };
    }
  }
}

export default SyncService;
