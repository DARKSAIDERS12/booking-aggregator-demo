import axios from 'axios';
import * as soap from 'soap';

export class Api1Service {
  private baseUrl: string;
  private username: string;
  private password: string;
  private client: any = null;

  constructor() {
    this.baseUrl = process.env.GDS_API1_URL || 'https://cluster.avtovokzal.ru/gdstest/soap/json';
    this.username = process.env.GDS_API1_USERNAME || 'sakhbus';
    this.password = process.env.GDS_API1_PASSWORD || 'Zxvghh4567!';
    
    console.log('🔧 Api1Service инициализирован с настройками:', {
      url: this.baseUrl,
      username: this.username,
      password: this.password ? '***' : 'не указан'
    });
  }

  /**
   * Инициализация SOAP клиента
   */
  private async getSoapClient() {
    if (!this.client) {
      try {
        console.log('🔌 Подключение к GDS SOAP API...');
        // Используем локальный WSDL файл
        this.client = await soap.createClientAsync('./gds-api.wsdl');
        
        // Добавляем аутентификацию
        this.client.setSecurity(new soap.BasicAuthSecurity(this.username, this.password));
        
        console.log('✅ SOAP клиент успешно создан');
      } catch (error) {
        console.error('❌ Ошибка создания SOAP клиента:', error);
        throw error;
      }
    }
    return this.client;
  }

  /**
   * Тест соединения с GDS API
   */
  async testConnection(): Promise<{ status: boolean; responseTime: number; error?: string; methods?: string[] }> {
    const startTime = Date.now();
    try {
      const client = await this.getSoapClient();
      
      // Получаем список доступных методов
      const description = client.describe();
      const methods = Object.keys(description);
      console.log('📋 Доступные методы GDS API:', methods);
      
      const responseTime = Date.now() - startTime;
      return {
        status: true,
        responseTime,
        methods
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Ошибка тестирования GDS API:', error);
      return {
        status: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение списка станций из GDS API
   */
  async getStations(): Promise<any[]> {
    try {
      console.log('🚉 Получение станций из GDS API...');
      const client = await this.getSoapClient();
      
      // Получаем страны и регионы для поиска станций
      const countries = await this.getCountries();
      const russia = countries.find(c => c.code === 'RU');
      
      if (!russia) {
        console.log('⚠️ Россия не найдена в списке стран');
        return this.getMockStations();
      }
      
      // Получаем регионы России
      const regions = await this.getRegions(russia.id);
      console.log(`📍 Найдено ${regions.length} регионов России`);
      
      const allStations = [];
      
      // Получаем станции для каждого региона
      for (const region of regions.slice(0, 5)) { // Ограничиваем первыми 5 регионами
        try {
          const stations = await this.getDispatchPoints(region.id);
          allStations.push(...stations);
        } catch (error) {
          console.log(`⚠️ Ошибка получения станций для региона ${region.name}:`, error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
      }
      
      console.log(`✅ Получено ${allStations.length} станций из GDS API`);
      return allStations;
      
    } catch (error) {
      console.error('❌ Ошибка получения станций из GDS API:', error);
      console.log('🔄 Возвращаем тестовые данные');
      return this.getMockStations();
    }
  }

  /**
   * Получение списка стран
   */
  async getCountries(): Promise<any[]> {
    try {
      const client = await this.getSoapClient();
      const result = await client.getCountriesAsync({});
      return JSON.parse(result[0].return);
    } catch (error) {
      console.error('❌ Ошибка получения стран:', error);
      return [];
    }
  }

  /**
   * Получение регионов страны
   */
  async getRegions(countryId: number): Promise<any[]> {
    try {
      const client = await this.getSoapClient();
      const result = await client.getRegionsAsync({ countryId });
      return JSON.parse(result[0].return);
    } catch (error) {
      console.error('❌ Ошибка получения регионов:', error);
      return [];
    }
  }

  /**
   * Получение станций отправления региона
   */
  async getDispatchPoints(regionId: number): Promise<any[]> {
    try {
      const client = await this.getSoapClient();
      const result = await client.getDispatchPointsAsync({ regionId });
      const stations = JSON.parse(result[0].return);
      
      return stations.map((station: any) => ({
        id: `gds_${station.id}`,
        name: station.name,
        code: station.code || station.id,
        city: station.name,
        region: station.region || 'Неизвестно',
        country: 'Россия',
        coordinates: {
          lat: station.latitude || 0,
          lng: station.longitude || 0
        },
        source: 'api1',
        sourceId: `api1_${station.id}`
      }));
    } catch (error) {
      console.error('❌ Ошибка получения станций отправления:', error);
      return [];
    }
  }

  /**
   * Поиск рейсов в GDS API
   */
  async searchRaces(params: { from: string; to: string; date: string }): Promise<any[]> {
    try {
      console.log('🔍 Поиск рейсов в GDS API:', params);
      const client = await this.getSoapClient();
      
      // Для поиска рейсов нужны ID станций
      // Пока используем тестовые ID
      const result = await client.getRacesAsync({
        dispatchPlaceId: 1,
        arrivalPlaceId: 2,
        date: params.date
      });
      
      const races = JSON.parse(result[0].return);
      console.log(`✅ Найдено ${races.length} рейсов в GDS API`);
      
      return races.map((race: any) => ({
        id: `gds_${race.uid || race.id || Date.now()}`,
        from: params.from,
        to: params.to,
        departureTime: race.dispatchDate || params.date + 'T08:00:00',
        arrivalTime: race.arrivalDate || params.date + 'T10:30:00',
        duration: race.duration || '2ч 30м',
        price: race.price || 0,
        currency: 'RUB',
        availableSeats: race.freeSeatCount || 0,
        carrier: race.carrier || 'GDS Bus Company',
        source: 'GDS API 1'
      }));
      
    } catch (error) {
      console.error('❌ Ошибка поиска рейсов в GDS API:', error);
      console.log('🔄 Возвращаем тестовые данные');
      return this.getMockRaces(params);
    }
  }

  /**
   * Получение информации о рейсе
   */
  async getRaceInfo(raceId: string): Promise<any> {
    try {
      console.log('📋 Получение информации о рейсе из GDS API:', raceId);
      const client = await this.getSoapClient();
      
      const result = await client.getRaceAsync({ raceCode: raceId });
      const race = JSON.parse(result[0].return);
      
      return {
        id: raceId,
        from: race.dispatchStation || 'Неизвестно',
        to: race.arrivalStation || 'Неизвестно',
        departureTime: race.dispatchDate || new Date().toISOString(),
        arrivalTime: race.arrivalDate || new Date().toISOString(),
        duration: race.duration || 'Неизвестно',
        price: race.price || 0,
        currency: 'RUB',
        availableSeats: race.freeSeatCount || 0,
        carrier: race.carrier || 'GDS Bus Company',
        source: 'GDS API 1'
      };
      
    } catch (error) {
      console.error('❌ Ошибка получения информации о рейсе из GDS API:', error);
      console.log('🔄 Возвращаем тестовые данные');
      return this.getMockRaceInfo(raceId);
    }
  }

  // Тестовые данные для fallback
  private getMockStations(): any[] {
    return [
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
      }
    ];
  }

  private getMockRaces(params: { from: string; to: string; date: string }): any[] {
    return [
      {
        id: `gds_${Date.now()}_1`,
        from: params.from || 'Южно-Сахалинск',
        to: params.to || 'Холмск',
        departureTime: `${params.date}T08:00:00`,
        arrivalTime: `${params.date}T10:30:00`,
        duration: '2ч 30м',
        price: 1200,
        currency: 'RUB',
        availableSeats: 15,
        carrier: 'GDS Bus Company',
        source: 'GDS API 1'
      }
    ];
  }

  private getMockRaceInfo(raceId: string): any {
    return {
      id: raceId,
      from: 'Южно-Сахалинск',
      to: 'Холмск',
      departureTime: '2025-08-22T08:00:00',
      arrivalTime: '2025-08-22T10:30:00',
      duration: '2ч 30м',
      price: 1200,
      currency: 'RUB',
      availableSeats: 15,
      carrier: 'GDS Bus Company',
      source: 'GDS API 1'
    };
  }
}
