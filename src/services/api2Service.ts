import axios from 'axios';

export class Api2Service {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.API2_BASE_URL || 'https://api2.example.com';
    this.apiKey = process.env.API2_API_KEY || '';
  }

  // Поиск рейсов
  async searchRaces(params: { from: string; to: string; date: string }): Promise<any[]> {
    try {
      console.log('Поиск рейсов в API 2:', params);
      
      // Здесь должна быть логика отправки REST запроса к Paybilet API
      // Пока возвращаем тестовые данные
      const mockRaces = [
        {
          id: `paybilet_${Date.now()}_1`,
          from: params.from,
          to: params.to,
          departureTime: `${params.date}T09:00:00`,
          arrivalTime: `${params.date}T11:15:00`,
          duration: '2ч 15м',
          price: 1150,
          currency: 'RUB',
          availableSeats: 12,
          carrier: 'Paybilet RF Bus'
        }
      ];

      return mockRaces;
    } catch (error) {
      console.error('Ошибка поиска рейсов в API 2:', error);
      throw error;
    }
  }

  // Получение информации о рейсе
  async getRaceInfo(raceId: string): Promise<any> {
    try {
      console.log('Получение информации о рейсе из API 2:', raceId);
      
      return {
        id: raceId,
        from: 'Южно-Сахалинск',
        to: 'Холмск',
        departureTime: '2025-08-22T09:00:00',
        arrivalTime: '2025-08-22T11:15:00',
        duration: '2ч 15м',
        price: 1150,
        currency: 'RUB',
        availableSeats: 12,
        carrier: 'Paybilet RF Bus'
      };
    } catch (error) {
      console.error('Ошибка получения информации о рейсе из API 2:', error);
      throw error;
    }
  }

  // Получение всех рейсов
  async getAllRaces(): Promise<any[]> {
    try {
      console.log('Получение всех рейсов из API 2');
      
      return [
        {
          id: 'paybilet_1',
          from: 'Южно-Сахалинск',
          to: 'Холмск',
          departureTime: '2025-08-22T09:00:00',
          arrivalTime: '2025-08-22T11:15:00',
          duration: '2ч 15м',
          price: 1150,
          currency: 'RUB',
          availableSeats: 12,
          carrier: 'Paybilet RF Bus'
        }
      ];
    } catch (error) {
      console.error('Ошибка получения всех рейсов из API 2:', error);
      throw error;
    }
  }

  // Получение станций
  async getStations(): Promise<any[]> {
    try {
      console.log('Получение станций из API 2');
      
      // Тестовые данные для Paybilet API
      return [
        {
          id: 'pb_1',
          name: 'Южно-Сахалинск',
          code: 'YSS',
          city: 'Южно-Сахалинск',
          region: 'Сахалинская область',
          country: 'Россия',
          coordinates: { lat: 46.9641, lng: 142.7380 }
        },
        {
          id: 'pb_2',
          name: 'Холмск',
          code: 'KHM',
          city: 'Холмск',
          region: 'Сахалинская область',
          country: 'Россия',
          coordinates: { lat: 47.0406, lng: 142.0416 }
        },
        {
          id: 'pb_3',
          name: 'Корсаков',
          code: 'KRS',
          city: 'Корсаков',
          region: 'Сахалинская область',
          country: 'Россия',
          coordinates: { lat: 46.6333, lng: 142.7667 }
        },
        {
          id: 'pb_4',
          name: 'Невельск',
          code: 'NVL',
          city: 'Невельск',
          region: 'Сахалинская область',
          country: 'Россия',
          coordinates: { lat: 46.6833, lng: 141.8667 }
        },
        {
          id: 'pb_5',
          name: 'Долинск',
          code: 'DLS',
          city: 'Долинск',
          region: 'Сахалинская область',
          country: 'Россия',
          coordinates: { lat: 47.3333, lng: 142.8000 }
        }
      ];
    } catch (error) {
      console.error('Ошибка получения станций из API 2:', error);
      return [];
    }
  }

  // Получение станций назначения
  async getStationsFrom(fromStationId: string): Promise<any[]> {
    try {
      console.log('Получение станций назначения из API 2 для станции:', fromStationId);
      
      // Тестовые данные - возвращаем все станции кроме отправления
      const allStations = await this.getStations();
      return allStations.filter(station => station.id !== fromStationId);
    } catch (error) {
      console.error('Ошибка получения станций назначения из API 2:', error);
      return [];
    }
  }

  // Поиск маршрутов
  async searchRoutes(params: any): Promise<any[]> {
    try {
      console.log('Поиск маршрутов в API 2:', params);
      return [];
    } catch (error) {
      console.error('Ошибка поиска маршрутов в API 2:', error);
      return [];
    }
  }

  // Получение информации о маршруте
  async getRouteInfo(routeId: string): Promise<any> {
    try {
      console.log('Получение информации о маршруте из API 2:', routeId);
      return null;
    } catch (error) {
      console.error('Ошибка получения информации о маршруте из API 2:', error);
      return null;
    }
  }

  // Тест соединения
  async testConnection(): Promise<boolean> {
    try {
      console.log('Тест соединения с API 2');
      return true;
    } catch (error) {
      console.error('Ошибка теста соединения с API 2:', error);
      return false;
    }
  }
}
