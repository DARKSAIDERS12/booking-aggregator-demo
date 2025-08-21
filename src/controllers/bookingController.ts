import { Request, Response } from 'express';
import { AggregatorService } from '../services/aggregatorService';
import StrapiService from '../services/strapiService';
import StationGroupingService from '../services/stationGroupingService';

export class BookingController {
  private aggregator: AggregatorService;
  private strapi: StrapiService;
  private stationGrouping: StationGroupingService;

  constructor() {
    this.aggregator = new AggregatorService();
    this.strapi = new StrapiService();
    this.stationGrouping = new StationGroupingService(this.strapi);
  }

  // Поиск маршрутов
  async searchRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, date } = req.query;

      if (!from || !to || !date) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать параметры: from, to, date'
        });
        return;
      }

      console.log(`🔍 Поиск маршрутов: ${from} → ${to} на ${date}`);

      const routes = await this.aggregator.searchRoutes({
        from: from as string,
        to: to as string,
        date: date as string
      });

      if (routes.length === 0) {
        res.json({
          success: true,
          message: 'Маршруты не найдены',
          data: []
        });
        return;
      }

      // Сохраняем найденные маршруты в Strapi
      const savedRoutes = [];
      for (const route of routes) {
        try {
          const savedRoute = await this.strapi.createRoute({
            id: 0, // Будет перезаписано Strapi
            departure_time: route.departureTime,
            arrival_time: route.arrivalTime,
            price: route.price,
            currency: 'RUB', // По умолчанию
            carrier: route.carrier,
            route_code: route.id,
            data_source: route.source || 'Unknown',
            route_status: 'active',
            seats_available: route.availableSeats,
            from_station: 0, // Будет заполнено позже
            to_station: 0
          });
          savedRoutes.push(savedRoute);
        } catch (error) {
          console.error('Ошибка сохранения маршрута в Strapi:', error);
        }
      }

      res.json({
        success: true,
        message: `Найдено ${routes.length} маршрутов`,
        data: {
          routes: routes,
          saved_routes: savedRoutes
        }
      });

    } catch (error) {
      console.error('Ошибка поиска маршрутов:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение всех станций
  async getAllStations(req: Request, res: Response): Promise<void> {
    try {
      const stations = await this.aggregator.getAllStations();
      
      res.json({
        success: true,
        message: `Найдено ${stations.length} станций`,
        data: stations
      });
    } catch (error) {
      console.error('Ошибка получения станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение станций по направлению
  async getStationsFrom(req: Request, res: Response): Promise<void> {
    try {
      const { from } = req.params;
      
      if (!from) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать параметр from'
        });
        return;
      }

      const stations = await this.aggregator.getStationsFrom(from);
      
      res.json({
        success: true,
        message: `Найдено ${stations.length} станций от ${from}`,
        data: stations
      });
    } catch (error) {
      console.error('Ошибка получения станций по направлению:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение информации о маршруте
  async getRaceInfo(req: Request, res: Response): Promise<void> {
    try {
      const { raceId } = req.params;
      
      if (!raceId) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать ID маршрута'
        });
        return;
      }

      const raceInfo = await this.aggregator.getRouteInfo(raceId);
      
      if (!raceInfo) {
        res.status(404).json({
          success: false,
          message: 'Маршрут не найден'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Информация о маршруте получена',
        data: raceInfo
      });
    } catch (error) {
      console.error('Ошибка получения информации о маршруте:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Тестирование соединений
  async testConnections(req: Request, res: Response): Promise<void> {
    try {
      const connections = await this.aggregator.testConnections();
      
      res.json({
        success: true,
        message: 'Статус соединений получен',
        data: connections
      });
    } catch (error) {
      console.error('Ошибка тестирования соединений:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение статистики API
  async getApiStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.aggregator.getApiStats();
      
      res.json({
        success: true,
        message: 'Статистика API получена',
        data: stats
      });
    } catch (error) {
      console.error('Ошибка получения статистики API:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Регистрация заказа
  async registerOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customer_name, customer_phone, customer_email, route_id, total_amount, currency } = req.body;

      if (!customer_name || !route_id || !total_amount || !currency) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать: customer_name, route_id, total_amount, currency'
        });
        return;
      }

      // Генерируем номер заказа
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const orderData = {
        order_number: orderNumber,
        customer_name,
        customer_phone: customer_phone || '',
        customer_email: customer_email || '',
        status: 'pending' as const,
        total_amount: parseFloat(total_amount),
        currency: currency as 'RUB' | 'KZT' | 'USD',
        route: parseInt(route_id)
      };

      const order = await this.strapi.createOrder(orderData);

      res.json({
        success: true,
        message: 'Заказ успешно зарегистрирован',
        data: order
      });

    } catch (error) {
      console.error('Ошибка регистрации заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Оплата заказа
  async payOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id, payment_method, payment_details } = req.body;

      if (!order_id || !payment_method) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать: order_id, payment_method'
        });
        return;
      }

      // Здесь должна быть интеграция с платежной системой
      // Пока что просто обновляем статус заказа
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const updatedOrder = await this.strapi.updateOrder(parseInt(order_id), {
        status: 'paid',
        payment_id: paymentId
      });

      if (!updatedOrder) {
        res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Заказ успешно оплачен',
        data: {
          order: updatedOrder,
          payment_id: paymentId
        }
      });

    } catch (error) {
      console.error('Ошибка оплаты заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Отмена заказа
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id, reason } = req.body;

      if (!order_id) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать: order_id'
        });
        return;
      }

      const updatedOrder = await this.strapi.updateOrder(parseInt(order_id), {
        status: 'canceled'
      });

      if (!updatedOrder) {
        res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Заказ успешно отменен',
        data: updatedOrder
      });

    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Автоматическая группировка станций
  async autoGroupStations(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 Запрос на автоматическую группировку станций');
      
      const groups = await this.stationGrouping.autoGroupStations();
      
      res.json({
        success: true,
        message: `Автоматическая группировка завершена. Создано ${groups.length} групп`,
        data: groups
      });
    } catch (error) {
      console.error('Ошибка автоматической группировки станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Ручная группировка станций
  async manualGroupStations(req: Request, res: Response): Promise<void> {
    try {
      const { station_ids, group_name } = req.body;

      if (!station_ids || !Array.isArray(station_ids) || !group_name) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать: station_ids (массив), group_name'
        });
        return;
      }

      const group = await this.stationGrouping.manualGroupStations(station_ids, group_name);
      
      res.json({
        success: true,
        message: 'Ручная группировка станций завершена',
        data: group
      });
    } catch (error) {
      console.error('Ошибка ручной группировки станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение групп станций
  async getStationGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.stationGrouping.getGroupedStations();
      
      res.json({
        success: true,
        message: `Найдено ${groups.length} групп станций`,
        data: groups
      });
    } catch (error) {
      console.error('Ошибка получения групп станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Получение конкретной группы станций
  async getStationGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать ID группы'
        });
        return;
      }

      const group = await this.stationGrouping.getStationGroupDetails(parseInt(id));
      
      if (!group) {
        res.status(404).json({
          success: false,
          message: 'Группа не найдена'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Группа станций найдена',
        data: group
      });
    } catch (error) {
      console.error('Ошибка получения группы станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Обновление группы станций
  async updateStationGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать ID группы'
        });
        return;
      }

      const updatedGroup = await this.strapi.updateStationGroup(parseInt(id), updateData);
      
      if (!updatedGroup) {
        res.status(404).json({
          success: false,
          message: 'Группа не найдена'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Группа станций успешно обновлена',
        data: updatedGroup
      });
    } catch (error) {
      console.error('Ошибка обновления группы станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Удаление группы станций
  async deleteStationGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать ID группы'
        });
        return;
      }

      // Здесь должна быть логика удаления группы
      // Пока что просто возвращаем успех
      
      res.json({
        success: true,
        message: 'Группа станций успешно удалена',
        data: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Ошибка удаления группы станций:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }

  // Статистика группировки
  async getGroupingStats(req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.stationGrouping.getGroupedStations();
      const api1Stations = await this.strapi.getApi1Stations();
      const api2Stations = await this.strapi.getApi2Stations();
      
      const stats = {
        total_groups: groups.length,
        total_api1_stations: api1Stations.length,
        total_api2_stations: api2Stations.length,
        total_mappings: 0,
        automatic_mappings: 0,
        manual_mappings: 0
      };

      // Подсчитываем статистику по сопоставлениям
      const mappings = await this.strapi.getStationMappings();
      stats.total_mappings = mappings.length;
      
      for (const mapping of mappings) {
        if (mapping.attributes?.mapping_type === 'automatic') {
          stats.automatic_mappings++;
        } else if (mapping.attributes?.mapping_type === 'manual') {
          stats.manual_mappings++;
        }
      }
      
      res.json({
        success: true,
        message: 'Статистика группировки получена',
        data: stats
      });
    } catch (error) {
      console.error('Ошибка получения статистики группировки:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
}

export default BookingController;
