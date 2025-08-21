import StrapiService from './strapiService';
import { Api1Service } from './api1Service';
import { Api2Service } from './api2Service';

export class SyncService {
  private strapi: StrapiService;
  private api1: Api1Service;
  private api2: Api2Service;

  constructor() {
    this.strapi = new StrapiService();
    this.api1 = new Api1Service();
    this.api2 = new Api2Service();
  }

  /**
   * Синхронизация станций из API 1 (GDS)
   */
  async syncApi1Stations(): Promise<void> {
    try {
      console.log('🚀 Начинаем синхронизацию станций из API 1 (GDS)...');
      
      // Получаем станции из API 1
      const stations = await this.api1.getStations();
      console.log(`📊 Получено ${stations.length} станций из API 1`);

      // Получаем существующие станции из Strapi
      const existingStations = await this.strapi.getApi1Stations();
      console.log(`📊 Найдено ${existingStations.length} существующих станций в Strapi`);

      let created = 0;
      let updated = 0;

      for (const station of stations) {
        try {
          // Проверяем, существует ли станция
          const existingStation = existingStations.find(s => 
            s.attributes?.station_id === station.id.toString()
          );

          if (existingStation) {
            // Обновляем существующую станцию
            await this.strapi.updateApi1Station(existingStation.id, {
              name: station.name,
              code: station.code,
              region: station.region,
              country: station.country,
              coordinates: station.latitude && station.longitude ? {
                lat: station.latitude,
                lng: station.longitude
              } : null,
              last_sync: new Date().toISOString()
            });
            updated++;
          } else {
            // Создаем новую станцию
            await this.strapi.createApi1Station({
              station_id: station.id.toString(),
              name: station.name,
              code: station.code,
              region: station.region,
              country: station.country,
              coordinates: station.latitude && station.longitude ? {
                lat: station.latitude,
                lng: station.longitude
              } : null,
              is_active: true,
              last_sync: new Date().toISOString()
            });
            created++;
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки станции ${station.name}:`, error);
        }
      }

      console.log(`✅ Синхронизация API 1 завершена. Создано: ${created}, обновлено: ${updated}`);
    } catch (error) {
      console.error('❌ Ошибка синхронизации API 1 станций:', error);
      throw error;
    }
  }

  /**
   * Синхронизация станций из API 2 (Paybilet)
   */
  async syncApi2Stations(): Promise<void> {
    try {
      console.log('🚀 Начинаем синхронизацию станций из API 2 (Paybilet)...');
      
      // Получаем станции из API 2
      const stations = await this.api2.getStations();
      console.log(`📊 Получено ${stations.length} станций из API 2`);

      // Получаем существующие станции из Strapi
      const existingStations = await this.strapi.getApi2Stations();
      console.log(`📊 Найдено ${existingStations.length} существующих станций в Strapi`);

      let created = 0;
      let updated = 0;

      for (const station of stations) {
        try {
          // Проверяем, существует ли станция
          const existingStation = existingStations.find(s => 
            s.attributes?.station_id === station.id.toString()
          );

          if (existingStation) {
            // Обновляем существующую станцию
            await this.strapi.updateApi2Station(existingStation.id, {
              name: station.name,
              code: station.code,
              region: station.region,
              country: station.country,
              latitude: station.latitude,
              longitude: station.longitude,
              last_sync: new Date().toISOString()
            });
            updated++;
          } else {
            // Создаем новую станцию
            await this.strapi.createApi2Station({
              station_id: station.id.toString(),
              name: station.name,
              code: station.code,
              region: station.region,
              country: station.country,
              latitude: station.latitude,
              longitude: station.longitude,
              is_active: true,
              last_sync: new Date().toISOString()
            });
            created++;
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки станции ${station.name}:`, error);
        }
      }

      console.log(`✅ Синхронизация API 2 завершена. Создано: ${created}, обновлено: ${updated}`);
    } catch (error) {
      console.error('❌ Ошибка синхронизации API 2 станций:', error);
      throw error;
    }
  }

  /**
   * Автоматическое сопоставление станций
   */
  async autoMapStations(): Promise<void> {
    try {
      console.log('🚀 Начинаем автоматическое сопоставление станций...');
      
      // Получаем все станции
      const api1Stations = await this.strapi.getApi1Stations();
      const api2Stations = await this.strapi.getApi2Stations();
      
      console.log(`📊 API 1 станций: ${api1Stations.length}, API 2 станций: ${api2Stations.length}`);

      // Получаем существующие сопоставления
      const existingMappings = await this.strapi.getStationMappings();
      console.log(`📊 Найдено ${existingMappings.length} существующих сопоставлений`);

      let created = 0;

      for (const api1Station of api1Stations) {
        const api1Name = api1Station.attributes?.name || api1Station.name;
        if (!api1Name) continue;

        // Ищем похожие станции в API 2
        for (const api2Station of api2Stations) {
          const api2Name = api2Station.attributes?.name || api2Station.name;
          if (!api2Name) continue;

          // Простое сравнение по названию
          if (this.normalizeStationName(api1Name) === this.normalizeStationName(api2Name)) {
            // Проверяем, не существует ли уже сопоставление
            const existingMapping = existingMappings.find(m => 
              m.attributes?.api1_station?.id === api1Station.id &&
              m.attributes?.api2_station?.id === api2Station.id
            );

            if (!existingMapping) {
              try {
                // Создаем сопоставление
                await this.strapi.createStationMapping({
                  name: `${api1Name} ↔ ${api2Name}`,
                  display_name: api1Name,
                  api1_station: api1Station.id,
                  api2_station: api2Station.id,
                  is_main_station: false,
                  is_active: true,
                  mapping_type: 'automatic',
                  confidence_score: 0.8
                });
                created++;
                console.log(`✅ Сопоставление создано: ${api1Name} ↔ ${api2Name}`);
              } catch (error) {
                console.error(`❌ Ошибка создания сопоставления ${api1Name} ↔ ${api2Name}:`, error);
              }
            }
          }
        }
      }

      console.log(`✅ Автоматическое сопоставление завершено. Создано: ${created} сопоставлений`);
    } catch (error) {
      console.error('❌ Ошибка автоматического сопоставления станций:', error);
      throw error;
    }
  }

  /**
   * Полная синхронизация
   */
  async syncAll(): Promise<void> {
    try {
      console.log('🚀 Начинаем полную синхронизацию...');
      
      // Синхронизируем станции
      await this.syncApi1Stations();
      await this.syncApi2Stations();
      
      // Сопоставляем станции
      await this.autoMapStations();
      
      console.log('✅ Полная синхронизация завершена');
    } catch (error) {
      console.error('❌ Ошибка полной синхронизации:', error);
      throw error;
    }
  }

  /**
   * Нормализация названия станции для сравнения
   */
  private normalizeStationName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[ёе]/g, 'е')
      .replace(/[йи]/g, 'и')
      .replace(/[ъь]/g, '')
      .replace(/[^а-яa-z0-9\s]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }
}

export default SyncService;
