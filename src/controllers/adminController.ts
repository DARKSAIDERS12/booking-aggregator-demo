import { Request, Response } from "express";
import { StationService } from "../services/stationService";
import multer from "multer";

export class AdminController {
  private stationService: StationService;

  constructor() {
    this.stationService = new StationService();
  }

  // GET /stations - просмотр всех таблиц станций
  async getAllStations(req: Request, res: Response) {
    try {
      const stations = await this.stationService.getAllStations();

      res.json({
        success: true,
        data: stations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось получить станции"
      });
    }
  }

  // POST /stations/upload - загрузка файла со станциями
  async uploadStations(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Файл не загружен"
        });
      }

      const { source } = req.body;
      if (!source || !["api1", "api2"].includes(source)) {
        return res.status(400).json({
          success: false,
          error: "Неверный источник (должен быть api1 или api2)"
        });
      }

      // Пока просто возвращаем сообщение о том, что загрузка не реализована
      res.json({
        success: true,
        message: `Загрузка станций из файла для ${source} пока не реализована`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось загрузить станции из файла"
      });
    }
  }

  // POST /stations/load-from-apis - загрузка станций из внешних API
  async loadStationsFromApis(req: Request, res: Response) {
    try {
      // Получаем станции из обоих API
      const api1Stations = await this.stationService.getAllStations();
      
      res.json({
        success: true,
        data: api1Stations,
        message: `Получено ${api1Stations.length} станций`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось загрузить станции из внешних API"
      });
    }
  }

  // POST /stations/auto-map - автоматическое сопоставление станций
  async autoMapStations(req: Request, res: Response) {
    try {
      const mappings = await this.stationService.autoMapStations();
      
      res.json({
        success: true,
        data: mappings,
        message: `Автоматически сопоставлено ${mappings.length} станций`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось выполнить автоматическое сопоставление"
      });
    }
  }

  // POST /stations/manual-map - ручное сопоставление станций
  async manualMapStations(req: Request, res: Response) {
    try {
      const { api1StationId, api2StationId } = req.body;
      
      if (!api1StationId || !api2StationId) {
        return res.status(400).json({
          success: false,
          error: "Необходимы ID станций из обоих API"
        });
      }

      // Создаем сопоставление через StrapiService
      const mapping = await this.stationService.createStationMapping({
        api1_station_id: api1StationId,
        api2_station_id: api2StationId,
        display_name: 'Ручное сопоставление',
        is_auto_mapped: false
      });
      
      res.json({
        success: true,
        data: mapping,
        message: "Станции успешно сопоставлены"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось сопоставить станции"
      });
    }
  }

  // POST /stations/group - создание группы станций
  async createStationGroup(req: Request, res: Response) {
    try {
      const { name, stationIds } = req.body;
      
      if (!name || !stationIds || !Array.isArray(stationIds) || stationIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Необходимы название группы и массив ID станций"
        });
      }

      const group = await this.stationService.createStationGroup({
        name,
        main_station_id: stationIds[0],
        child_stations: stationIds.slice(1)
      });
      
      res.json({
        success: true,
        data: group,
        message: "Группа станций успешно создана"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось создать группу станций"
      });
    }
  }

  // GET /stations/mapped - получение сопоставленных станций с группировками
  async getMappedStations(req: Request, res: Response) {
    try {
      const mappings = await this.stationService.getStationMappings();
      
      res.json({
        success: true,
        data: mappings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Не удалось получить сопоставленные станции"
      });
    }
  }
}
