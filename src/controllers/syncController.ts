import { Request, Response } from 'express';
import SyncService from '../services/syncService';
import StrapiService from '../services/strapiService';

const syncService = new SyncService();
const strapiService = new StrapiService();

export class SyncController {
  // Запуск синхронизации станций
  async syncStations(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на синхронизацию станций...');
      
      const result = await syncService.syncStations();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          count: result.count,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации станций:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить синхронизацию станций',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Запуск синхронизации маршрутов
  async syncRoutes(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на синхронизацию маршрутов...');
      
      const result = await syncService.syncRoutes();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          count: result.count,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации маршрутов:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить синхронизацию маршрутов',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Полная синхронизация
  async fullSync(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на полную синхронизацию...');
      
      const result = await syncService.fullSync();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          details: result.details,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
          details: result.details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Ошибка полной синхронизации:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить полную синхронизацию',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Получение статуса синхронизации
  async getSyncStatus(req: Request, res: Response) {
    try {
      console.log('📊 Запрос статуса синхронизации...');
      
      const status = await syncService.getSyncStatus();
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Ошибка получения статуса синхронизации:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось получить статус синхронизации',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Проверка здоровья системы синхронизации
  async healthCheck(req: Request, res: Response) {
    try {
      const [strapiStatus, syncStatus] = await Promise.all([
        strapiService.testConnection(),
        syncService.getSyncStatus()
      ]);

      const health = {
        strapi: {
          connected: strapiStatus,
          url: process.env.STRAPI_URL || 'http://localhost:1337'
        },
        sync: syncStatus,
        timestamp: new Date().toISOString()
      };

      const isHealthy = strapiStatus && syncStatus.stationsCount >= 0;

      if (isHealthy) {
        res.json({
          success: true,
          status: 'healthy',
          data: health
        });
      } else {
        res.status(503).json({
          success: false,
          status: 'unhealthy',
          data: health
        });
      }
    } catch (error) {
      console.error('❌ Ошибка проверки здоровья:', error);
      res.status(500).json({
        success: false,
        status: 'error',
        error: 'Внутренняя ошибка сервера',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new SyncController();
