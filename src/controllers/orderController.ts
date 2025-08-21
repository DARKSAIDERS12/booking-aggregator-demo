import { Request, Response } from 'express';
import StrapiService, { StrapiOrder } from '../services/strapiService';
import { validateOrderData } from '../utils/validation';

const strapiService = new StrapiService();

export class OrderController {
  // Создание нового заказа
  async createOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      
      console.log('📥 Получены данные заказа:', orderData);
      
      // Преобразуем route_id в число для Strapi
      if (orderData.route_id) {
        orderData.route = parseInt(orderData.route_id);
        delete orderData.route_id;
      }
      
      // Валидация данных заказа
      const validationResult = validateOrderData(orderData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Неверные данные заказа',
          details: validationResult.errors
        });
      }

      console.log('✅ Данные заказа прошли валидацию:', orderData);

      // Создание заказа в Strapi
      const createdOrder = await strapiService.createOrder(orderData);
      
      res.status(201).json({
        success: true,
        data: createdOrder,
        message: 'Заказ успешно создан'
      });
    } catch (error) {
      console.error('❌ Ошибка создания заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось создать заказ'
      });
    }
  }

  // Получение списка заказов
  async getOrders(req: Request, res: Response) {
    try {
      const orders = await strapiService.getOrders();
      
      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      console.error('Ошибка получения заказов:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось получить заказы'
      });
    }
  }

  // Получение заказа по ID
  async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderId = parseInt(id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID заказа'
        });
      }

      const order = await strapiService.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Ошибка получения заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось получить заказ'
      });
    }
  }

  // Обновление заказа
  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderId = parseInt(id);
      const updateData = req.body;
      
      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID заказа'
        });
      }

      // Валидация данных обновления
      if (updateData.status && !['pending', 'paid', 'canceled'].includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный статус заказа'
        });
      }

      const updatedOrder = await strapiService.updateOrder(orderId, updateData);
      
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Заказ успешно обновлен'
      });
    } catch (error) {
      console.error('Ошибка обновления заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось обновить заказ'
      });
    }
  }

  // Получение статистики заказов
  async getOrderStats(req: Request, res: Response) {
    try {
      const orders = await strapiService.getOrders();
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        canceled: orders.filter(o => o.status === 'canceled').length,
        totalRevenue: orders
          .filter(o => o.status === 'paid')
          .reduce((sum, o) => sum + o.total_amount, 0)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Ошибка получения статистики заказов:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось получить статистику'
      });
    }
  }

  // Проверка соединения со Strapi
  async testStrapiConnection(req: Request, res: Response) {
    try {
      const isConnected = await strapiService.testConnection();
      
      res.json({
        success: true,
        data: {
          connected: isConnected,
          strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337'
        }
      });
    } catch (error) {
      console.error('Ошибка проверки соединения со Strapi:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось проверить соединение'
      });
    }
  }
}

export default new OrderController();
