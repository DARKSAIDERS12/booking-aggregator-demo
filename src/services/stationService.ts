import { PrismaClient } from "@prisma/client";
import { Station, StationMapping, StationGroup, PaginationParams, PaginatedResponse } from "../types";
import { Api1Service } from "./api1Service";
import { Api2Service } from "./api2Service";

export class StationService {
  private prisma: PrismaClient;
  private api1Service: Api1Service;
  private api2Service: Api2Service;

  constructor() {
    this.prisma = new PrismaClient();
    this.api1Service = new Api1Service();
    this.api2Service = new Api2Service();
  }

  // Загрузка станций из внешних API
  async loadStationsFromApis(): Promise<{ api1: Station[], api2: Station[] }> {
    try {
      const [api1Stations, api2Stations] = await Promise.all([
        this.api1Service.getStations(),
        this.api2Service.getStations()
      ]);

      // Сохраняем в базу данных
      await this.saveStationsToDatabase(api1Stations, api2Stations);

      return { api1: api1Stations, api2: api2Stations };
    } catch (error) {
      console.error("Ошибка загрузки станций:", error);
      throw new Error("Не удалось загрузить станции из внешних API");
    }
  }

  // Сохранение станций в базу данных
  private async saveStationsToDatabase(api1Stations: Station[], api2Stations: Station[]) {
    // Очищаем старые данные
    await this.prisma.stationApi1.deleteMany();
    await this.prisma.stationApi2.deleteMany();

    // Сохраняем станции API 1
    for (const station of api1Stations) {
      await this.prisma.stationApi1.create({
        data: {
          name: station.name,
          code: station.code,
          region: station.region,
          country: station.country,
          latitude: station.latitude,
          longitude: station.longitude
        }
      });
    }

    // Сохраняем станции API 2
    for (const station of api2Stations) {
      await this.prisma.stationApi2.create({
        data: {
          name: station.name,
          code: station.code,
          region: station.region,
          country: station.country,
          latitude: station.latitude,
          longitude: station.longitude
        }
      });
    }
  }

  // Получение всех станций с пагинацией
  async getAllStations(params: PaginationParams = {}): Promise<PaginatedResponse<Station>> {
    const { page = 1, limit = 20, sortBy = "name", sortOrder = "asc" } = params;
    const skip = (page - 1) * limit;

    try {
      const [api1Stations, api2Stations, totalApi1, totalApi2] = await Promise.all([
        this.prisma.stationApi1.findMany({
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as any }
        }),
        this.prisma.stationApi2.findMany({
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder as any }
        }),
        this.prisma.stationApi1.count(),
        this.prisma.stationApi2.count()
      ]);
      const total = totalApi1 + totalApi2;

      const stations = [
        ...api1Stations.map((s: any) => ({ ...s, source: "API 1" })),
        ...api2Stations.map((s: any) => ({ ...s, source: "API 2" }))
      ];

      return {
        success: true,
        data: stations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error("Ошибка получения станций:", error);
      throw new Error("Не удалось получить станции");
    }
  }

  // Автоматическое сопоставление станций
  async autoMapStations(): Promise<StationMapping[]> {
    try {
      const api1Stations = await this.prisma.stationApi1.findMany();
      const api2Stations = await this.prisma.stationApi2.findMany();
      const mappings: StationMapping[] = [];

      for (const api1Station of api1Stations) {
        // Ищем похожие станции по названию
        const similarStations = api2Stations.filter((api2Station: any) => 
          this.isSimilarStation(api1Station.name, api2Station.name)
        );

        if (similarStations.length > 0) {
          // Создаем сопоставление с первой найденной похожей станцией
          const created = await this.prisma.stationMapping.create({
            data: {
              api1StationId: api1Station.id,
              api2StationId: similarStations[0].id,
              isMain: false
            },
            include: {
              api1Station: true,
              api2Station: true
            }
          });

          mappings.push({
            id: created.id,
            api1StationId: created.api1StationId,
            api2StationId: created.api2StationId,
            confidence: 0.8, // Уровень уверенности
            isManual: false, // Автоматическое сопоставление
            isMain: false, // Не главная станция
            createdAt: new Date(),
            updatedAt: new Date(),
            api1Station: created.api1Station as any,
            api2Station: created.api2Station as any
          });
        }
      }

      return mappings;
    } catch (error) {
      console.error("Ошибка автоматического сопоставления:", error);
      throw new Error("Не удалось выполнить автоматическое сопоставление");
    }
  }

  // Проверка схожести названий станций
  private isSimilarStation(name1: string, name2: string): boolean {
    const normalized1 = name1.toLowerCase().replace(/[^а-яёa-z0-9]/g, "");
    const normalized2 = name2.toLowerCase().replace(/[^а-яёa-z0-9]/g, "");
    
    // Простая проверка на схожесть (можно улучшить алгоритмом Левенштейна)
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  // Ручное сопоставление станций
  async manualMapStations(api1StationId: string, api2StationId: string): Promise<StationMapping> {
    try {
      // Проверяем, что сопоставление не существует
      const existingMapping = await this.prisma.stationMapping.findFirst({
        where: {
          OR: [
            { api1StationId, api2StationId },
            { api1StationId },
            { api2StationId }
          ]
        }
      });

      if (existingMapping) {
        throw new Error("Станция уже сопоставлена");
      }

      const created = await this.prisma.stationMapping.create({
        data: {
          api1StationId,
          api2StationId,
          isMain: false
        },
        include: {
          api1Station: true,
          api2Station: true
        }
      });

      return {
        id: created.id,
        api1StationId: created.api1StationId,
        api2StationId: created.api2StationId,
        confidence: 0.8, // Уровень уверенности
        isManual: false, // Автоматическое сопоставление
        isMain: false, // Не главная станция
        createdAt: new Date(),
        updatedAt: new Date(),
        api1Station: created.api1Station as any,
        api2Station: created.api2Station as any
      };
    } catch (error) {
      console.error("Ошибка ручного сопоставления:", error);
      throw new Error("Не удалось сопоставить станции");
    }
  }

  // Создание группы станций
  async createStationGroup(name: string, stationIds: string[]): Promise<StationGroup> {
    try {
      const group = await this.prisma.stationGroup.create({
        data: {
          name,
          mainStationId: stationIds[0] // Первая станция становится главной
        }
      });

      // Обновляем сопоставления, добавляя groupId
      for (const stationId of stationIds) {
        await this.prisma.stationMapping.updateMany({
          where: { id: stationId },
          data: { groupId: group.id }
        });
      }

      // Устанавливаем главную станцию
      if (stationIds.length > 0) {
        await this.prisma.stationMapping.update({
          where: { id: stationIds[0] },
          data: { isMain: true }
        });
      }

      return {
        id: group.id,
        name: group.name,
        mainStationId: group.mainStationId ?? undefined,
        mappings: []
      } as any;
    } catch (error) {
      console.error("Ошибка создания группы станций:", error);
      throw new Error("Не удалось создать группу станций");
    }
  }

  // Получение сопоставленных станций с группировками
  async getMappedStations(): Promise<StationMapping[]> {
    try {
      const list = await this.prisma.stationMapping.findMany({
        include: {
          api1Station: true,
          api2Station: true,
          group: true
        },
        orderBy: [
          { isMain: "desc" },
          { api1Station: { name: "asc" } }
        ]
      });

      return list.map((m: any) => ({
        id: m.id,
        api1StationId: m.api1StationId,
        api2StationId: m.api2StationId,
        confidence: 0.8, // Уровень уверенности
        isManual: false, // Автоматическое сопоставление
        isMain: m.isMain || false, // Используем значение из БД или false
        createdAt: new Date(),
        updatedAt: new Date(),
        api1Station: m.api1Station,
        api2Station: m.api2Station
      }));
    } catch (error) {
      console.error("Ошибка получения сопоставленных станций:", error);
      throw new Error("Не удалось получить сопоставленные станции");
    }
  }

  // Загрузка станций из файла
  async uploadStationsFromFile(fileBuffer: Buffer, source: "api1" | "api2"): Promise<Station[]> {
    try {
      // Здесь должна быть логика парсинга файла (CSV, Excel)
      // Пока возвращаем пустой массив
      console.log(`Загрузка станций из файла для ${source}`);
      return [];
    } catch (error) {
      console.error("Ошибка загрузки станций из файла:", error);
      throw new Error("Не удалось загрузить станции из файла");
    }
  }
}
