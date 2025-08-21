import StrapiService from './strapiService';

export interface StationGroup {
  id?: number;
  name: string;
  main_station?: number;
  stations?: number[];
  is_active: boolean;
}

export interface StationMapping {
  id?: number;
  name: string;
  display_name: string;
  api1_station?: number;
  api2_station?: number;
  group?: number;
  is_main_station?: boolean;
  is_active?: boolean;
  mapping_type?: 'automatic' | 'manual';
  confidence_score?: number;
}

export class StationGroupingService {
  private strapiService: StrapiService;

  constructor(strapiService: StrapiService) {
    this.strapiService = strapiService;
  }

  /**
   * Группировка станций по названию
   */
  async groupStationsByName(): Promise<StationGroup[]> {
    try {
      // Получаем все станции из API 1 и API 2
      const api1Stations = await this.strapiService.getApi1Stations();
      const api2Stations = await this.strapiService.getApi2Stations();

      // Создаем группы по названию
      const groups: { [key: string]: StationGroup } = {};

      // Обрабатываем API 1 станции
      for (const station of api1Stations) {
        const stationName = station.attributes?.name || station.name;
        if (!stationName) continue;

        const normalizedName = this.normalizeStationName(stationName);
        
        if (!groups[normalizedName]) {
          groups[normalizedName] = {
            name: stationName,
            is_active: true,
            stations: []
          };
        }

        // Создаем сопоставление для API 1 станции
        const mapping = await this.strapiService.createStationMapping({
          name: stationName,
          display_name: stationName,
          api1_station: station.id,
          is_main_station: false,
          is_active: true,
          mapping_type: 'automatic',
          confidence_score: 0.8
        });

        if (mapping && mapping.id) {
          groups[normalizedName].stations = groups[normalizedName].stations || [];
          groups[normalizedName].stations!.push(mapping.id);
        }
      }

      // Обрабатываем API 2 станции
      for (const station of api2Stations) {
        const stationName = station.attributes?.name || station.name;
        if (!stationName) continue;

        const normalizedName = this.normalizeStationName(stationName);
        
        if (!groups[normalizedName]) {
          groups[normalizedName] = {
            name: stationName,
            is_active: true,
            stations: []
          };
        }

        // Создаем сопоставление для API 2 станции
        const mapping = await this.strapiService.createStationMapping({
          name: stationName,
          display_name: stationName,
          api2_station: station.id,
          is_main_station: false,
          is_active: true,
          mapping_type: 'automatic',
          confidence_score: 0.8
        });

        if (mapping && mapping.id) {
          groups[normalizedName].stations = groups[normalizedName].stations || [];
          groups[normalizedName].stations!.push(mapping.id);
        }
      }

      // Создаем группы в Strapi
      const createdGroups: StationGroup[] = [];
      for (const groupName in groups) {
        const group = groups[groupName];
        if (group.stations && group.stations.length > 0) {
          // Определяем главную станцию (первую в списке)
          group.main_station = group.stations[0];
          
          const createdGroup = await this.strapiService.createStationGroup(group);
          if (createdGroup) {
            createdGroups.push(createdGroup);
          }
        }
      }

      return createdGroups;
    } catch (error) {
      console.error('Ошибка группировки станций по названию:', error);
      throw error;
    }
  }

  /**
   * Автоматическая группировка станций
   */
  async autoGroupStations(): Promise<StationGroup[]> {
    try {
      console.log('🚀 Начинаем автоматическую группировку станций...');
      
      // Получаем существующие группы
      const existingGroups = await this.strapiService.getStationGroups();
      console.log(`📊 Найдено существующих групп: ${existingGroups.length}`);

      // Выполняем группировку по названию
      const groups = await this.groupStationsByName();
      console.log(`✅ Создано новых групп: ${groups.length}`);

      return groups;
    } catch (error) {
      console.error('❌ Ошибка автоматической группировки станций:', error);
      throw error;
    }
  }

  /**
   * Ручная группировка станций
   */
  async manualGroupStations(stationIds: number[], groupName: string): Promise<StationGroup> {
    try {
      console.log(`🔧 Ручная группировка станций: ${stationIds.join(', ')} в группу "${groupName}"`);

      // Создаем группу
      const group = await this.strapiService.createStationGroup({
        name: groupName,
        is_active: true,
        stations: stationIds
      });

      // Определяем главную станцию (первую в списке)
      if (group && group.id && stationIds.length > 0) {
        await this.strapiService.updateStationGroup(group.id, {
          main_station: stationIds[0]
        });
      }

      console.log(`✅ Группа "${groupName}" успешно создана`);
      return group;
    } catch (error) {
      console.error('❌ Ошибка ручной группировки станций:', error);
      throw error;
    }
  }

  /**
   * Получение сгруппированных станций
   */
  async getGroupedStations(): Promise<StationGroup[]> {
    try {
      return await this.strapiService.getStationGroups();
    } catch (error) {
      console.error('Ошибка получения сгруппированных станций:', error);
      throw error;
    }
  }

  /**
   * Получение деталей группы станций
   */
  async getStationGroupDetails(groupId: number): Promise<StationGroup | null> {
    try {
      const groups = await this.strapiService.getStationGroups();
      return groups.find(g => g.id === groupId) || null;
    } catch (error) {
      console.error(`Ошибка получения деталей группы ${groupId}:`, error);
      return null;
    }
  }

  /**
   * Нормализация названия станции для группировки
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

export default StationGroupingService;
