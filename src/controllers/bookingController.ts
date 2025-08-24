import { Request, Response } from 'express';
import { Api1Service } from '../services/api1Service';
import { RaceService } from '../services/raceService';
import { Api2Service } from '../services/api2Service';

class BookingController {
  private api1Service: Api1Service;
  private api2Service: Api2Service;
  private raceService: RaceService;

  constructor() {
    this.api1Service = new Api1Service();
    this.api2Service = new Api2Service();
    this.raceService = new RaceService();
    
    // Привязываем методы к контексту
    this.searchRoutes = this.searchRoutes.bind(this);
    this.getAllStations = this.getAllStations.bind(this);
    this.getStationsFrom = this.getStationsFrom.bind(this);
    this.getRouteInfo = this.getRouteInfo.bind(this);
    this.testConnections = this.testConnections.bind(this);
    this.getApiStats = this.getApiStats.bind(this);
  }

  // Тестовый endpoint для проверки
  async testDemo(req: Request, res: Response) {
    try {
      console.log('🧪 Тестовый endpoint вызван');
      
      const demoData = [
        { id: 'test1', name: 'Тест 1' },
        { id: 'test2', name: 'Тест 2' }
      ];

      res.json({
        success: true,
        message: 'Тестовый endpoint работает!',
        data: demoData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка тестового endpoint',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Поиск маршрутов
  async searchRoutes(req: Request, res: Response) {
    try {
      const { from, to, date } = req.query;

      if (!from || !to || !date) {
        return res.status(400).json({
          success: false,
          message: 'Необходимо указать: from, to, date'
        });
      }

      console.log('🔍 Поиск маршрутов (РЕАЛЬНЫЕ API):', { from, to, date });

      // Используем реальный raceService для поиска
      const races = await this.raceService.searchRaces({
        from: from as string,
        to: to as string,
        date: date as string
      });

      console.log(`✅ Найдено ${races.length} реальных маршрутов`);

      res.json({
        success: true,
        data: races,
        sources: {
          api1: 'gds',
          api2: 'paybilet'
        }
      });
    } catch (error) {
      console.error('❌ Ошибка поиска маршрутов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка поиска маршрутов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение всех станций
  async getAllStations(req: Request, res: Response) {
    try {
      console.log('🚉 Получение всех станций...');

      // Получаем станции из обоих API
      const [api1Stations, api2Stations] = await Promise.allSettled([
        this.api1Service.getStations(),
        Promise.resolve([]) // API 2 пока не настроен
      ]);

      const allStations = [
        ...(api1Stations.status === 'fulfilled' ? api1Stations.value : []),
        ...(api2Stations.status === 'fulfilled' ? api2Stations.value : [])
      ];

      console.log(`✅ Получено ${allStations.length} станций`);

      res.json({
        success: true,
        data: allStations,
        sources: {
          api1: api1Stations.status === 'fulfilled' ? 'success' : 'error',
          api2: api2Stations.status === 'fulfilled' ? 'success' : 'error'
        }
      });
    } catch (error) {
      console.error('❌ Ошибка получения станций:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения станций',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение станций назначения
  async getStationsFrom(req: Request, res: Response) {
    try {
      const { from } = req.params;
      console.log('🚉 Получение станций назначения для:', from);

      // Получаем все станции
      const allStations = await this.api1Service.getStations();
      
      // Фильтруем станции
      const filteredStations = allStations.filter((station: any) => 
        station.id !== from && station.name !== from
      );

      res.json({
        success: true,
        data: filteredStations
      });
    } catch (error) {
      console.error('❌ Ошибка получения станций назначения:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения станций назначения',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение информации о маршруте
  async getRouteInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('📋 Получение информации о маршруте:', id);

      // Пытаемся получить информацию из API 1
      const raceInfo = await this.api1Service.getRaceInfo(id);

      res.json({
        success: true,
        data: raceInfo
      });
    } catch (error) {
      console.error('❌ Ошибка получения информации о маршруте:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения информации о маршруте',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Тест соединений
  async testConnections(req: Request, res: Response) {
    try {
      console.log('🔌 Тестирование соединений с внешними API...');

      // Тестируем GDS API 1
      const api1Test = await this.api1Service.testConnection();
      
      // Тестируем Paybilet API 2
      const api2Test = await this.api2Service.testConnection();

      const result = {
        api1: {
          status: api1Test.status,
          responseTime: api1Test.responseTime,
          error: api1Test.error,
          methods: api1Test.methods
        },
        api2: api2Test,
        summary: this.getConnectionSummary(api1Test, api2Test)
      };

      console.log('✅ Тест соединений завершен:', result);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('❌ Ошибка теста соединений:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка теста соединений',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение статистики API
  async getApiStats(req: Request, res: Response) {
    try {
      console.log('📊 Получение статистики API...');

      // Тестируем соединения для получения статистики
      const api1Test = await this.api1Service.testConnection();
      
      const stats = {
        totalRequests: 0, // TODO: добавить счетчик запросов
        successRate: api1Test.status ? 100 : 0,
        averageResponseTime: api1Test.responseTime,
        api1: {
          status: api1Test.status,
          lastCheck: new Date().toISOString(),
          responseTime: api1Test.responseTime,
          error: api1Test.error
        },
        api2: {
          status: false,
          lastCheck: new Date().toISOString(),
          responseTime: 0,
          error: 'API 2 не настроен'
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Ошибка получения статистики API:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики API',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Вспомогательный метод для получения сводки соединений
  private getConnectionSummary(api1: any, api2: any): string {
    if (api1.status && api2.status) {
      return 'Все API доступны';
    } else if (api1.status || api2.status) {
      return 'Частично доступны';
    } else {
      return 'Все API недоступны';
    }
  }
}

export const bookingController = new BookingController();
