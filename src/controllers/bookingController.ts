import { Request, Response } from 'express';
import { AggregatorService } from '../services/aggregatorService';

export class BookingController {
  private aggregator: AggregatorService;

  constructor() {
    this.aggregator = new AggregatorService();
  }

  // Получение всех станций из двух API
  async getStations(req: Request, res: Response) {
    try {
      const stations = await this.aggregator.getAllStations();
      res.json({ success: true, data: stations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка получения станций" });
    }
  }

  // Получение станций назначения из конкретной станции
  async getStationsFrom(req: Request, res: Response) {
    try {
      const { from } = req.params;
      const stations = await this.aggregator.getStationsFrom(from);
      res.json({ success: true, data: stations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка получения станций назначения" });
    }
  }

  // Поиск рейсов в двух API
  async searchRoutes(req: Request, res: Response) {
    try {
      const { from, to, date } = req.query;
      
      if (!from || !to || !date) {
        return res.status(400).json({ 
          success: false, 
          error: "Необходимо указать параметры: from, to, date" 
        });
      }

      const routes = await this.aggregator.searchRoutes({
        from: String(from),
        to: String(to),
        date: String(date)
      });

      res.json({ success: true, data: routes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка поиска рейсов" });
    }
  }

  // Получение детальной информации о рейсе
  async getRouteInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { source } = req.query; // Опциональный параметр для указания источника API
      
      let route;
      if (source === 'gds' || source === 'GDS API 1') {
        route = await this.aggregator.getRouteInfo(id, 'GDS API 1');
      } else if (source === 'rfbus' || source === 'RF Bus API 2') {
        route = await this.aggregator.getRouteInfo(id, 'RF Bus API 2');
      } else {
        route = await this.aggregator.getRouteInfo(id);
      }

      res.json({ success: true, data: route });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка получения информации о рейсе" });
    }
  }

  // Тест соединений с API
  async testConnections(req: Request, res: Response) {
    try {
      const connections = await this.aggregator.testConnections();
      res.json({ success: true, data: connections });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка тестирования соединений" });
    }
  }

  // Получение статистики API
  async getApiStats(req: Request, res: Response) {
    try {
      const stats = await this.aggregator.getApiStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка получения статистики API" });
    }
  }

  // Бронирование заказа (пока только заглушка)
  async registerBooking(req: Request, res: Response) {
    try {
      // TODO: Реализовать бронирование через соответствующий API
      res.json({ 
        success: true, 
        message: "Бронирование временно недоступно. Используйте соответствующий API напрямую.",
        data: {
          orderId: "temp-" + Date.now(),
          status: "pending"
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка бронирования" });
    }
  }

  // Оплата заказа (пока только заглушка)
  async processPayment(req: Request, res: Response) {
    try {
      // TODO: Реализовать оплату через соответствующий API
      res.json({ 
        success: true, 
        message: "Оплата временно недоступна. Используйте соответствующий API напрямую.",
        data: {
          paymentId: "temp-" + Date.now(),
          status: "pending"
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка оплаты" });
    }
  }

  // Отмена билетов (пока только заглушка)
  async cancelTickets(req: Request, res: Response) {
    try {
      // TODO: Реализовать отмену через соответствующий API
      res.json({ 
        success: true, 
        message: "Отмена временно недоступна. Используйте соответствующий API напрямую.",
        data: {
          cancellationId: "temp-" + Date.now(),
          status: "pending"
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Ошибка отмены" });
    }
  }
}
