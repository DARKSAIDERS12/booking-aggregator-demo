import { Request, Response } from 'express';
import SyncService from '../services/syncService';
import StrapiService from '../services/strapiService';

const syncService = new SyncService();
const strapiService = new StrapiService();

export class SyncController {
  // Запуск синхронизации станций API 1
  async syncApi1Stations(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на синхронизацию станций API 1...');
      
      await syncService.syncApi1Stations();
      
      res.json({
        success: true,
        message: 'Синхронизация станций API 1 завершена',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Ошибка синхронизации станций API 1:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить синхронизацию станций API 1',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Запуск синхронизации станций API 2
  async syncApi2Stations(req: Request, res: Response) {
    try {
      console.log('�� Запрос на синхронизацию станций API 2...');
      
      await syncService.syncApi2Stations();
      
      res.json({
        success: true,
        message: 'Синхронизация станций API 2 завершена',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Ошибка синхронизации станций API 2:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить синхронизацию станций API 2',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Автоматическое сопоставление станций
  async autoMapStations(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на автоматическое сопоставление станций...');
      
      await syncService.autoMapStations();
      
      res.json({
        success: true,
        message: 'Автоматическое сопоставление станций завершено',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Ошибка автоматического сопоставления станций:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: 'Не удалось выполнить автоматическое сопоставление станций',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Полная синхронизация
  async fullSync(req: Request, res: Response) {
    try {
      console.log('🔄 Запрос на полную синхронизацию...');
      
      await syncService.syncAll();
      
      res.json({
        success: true,
        message: 'Полная синхронизация завершена',
        timestamp: new Date().toISOString()
      });
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
      
      const [api1Stations, api2Stations, mappings, groups] = await Promise.all([
        strapiService.getApi1Stations(),
        strapiService.getApi2Stations(),
        strapiService.getStationMappings(),
        strapiService.getStationGroups()
      ]);
      
      const status = {
        api1Stations: {
          count: api1Stations.length,
          lastUpdate: api1Stations.length > 0 ? api1Stations[0].attributes?.last_sync : null
        },
        api2Stations: {
          count: api2Stations.length,
          lastUpdate: api2Stations.length > 0 ? api2Stations[0].attributes?.last_sync : null
        },
        mappings: {
          count: mappings.length,
          automatic: mappings.filter(m => m.attributes?.mapping_type === 'automatic').length,
          manual: mappings.filter(m => m.attributes?.mapping_type === 'manual').length
        },
        groups: {
          count: groups.length
        },
        timestamp: new Date().toISOString()
      };
      
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
      const [strapiStatus, api1Stations, api2Stations] = await Promise.all([
        strapiService.testConnection(),
        strapiService.getApi1Stations(),
        strapiService.getApi2Stations()
      ]);

      const health = {
        strapi: {
          connected: strapiStatus,
          url: process.env.STRAPI_URL || 'http://localhost:1337'
        },
        stations: {
          api1: api1Stations.length,
          api2: api2Stations.length
        },
        timestamp: new Date().toISOString()
      };

      const isHealthy = strapiStatus && (api1Stations.length >= 0 || api2Stations.length >= 0);

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
