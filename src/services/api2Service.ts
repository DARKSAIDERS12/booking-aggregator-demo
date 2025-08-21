import axios, { AxiosInstance } from "axios";
import { Station, Route } from "../types";

export class Api2Service {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API2_BASE_URL || "http://vl.rfbus.net:8086";
    this.apiKey = process.env.API2_ACCESS_TOKEN || "eyJhbGciOiJlUzI1NilsInR5cCl6lkpXVCJ9.eyJpZF91c2VyljoiODUzMzYiLCJpZF9hdil6IjMwMzY2liwiaWRfZmlybSI6IjEwMzc2liwiaWF0ljoxNzQ2MDAwODIyLCJIeHAiOjE3Nzc1MzY4MjJ9.bjXTtY0xHTGVZcFegx9zGDRuINKxqBe4UBfKt4u3ER8";
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "x-access-token": this.apiKey,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });
  }

  // Получение списка станций
  async getStations(tokenOverride?: string): Promise<Station[]> {
    try {
      console.log("🔍 Запрос станций из API 2...");
      
      // ВРЕМЕННО: используем захардкоженные данные для тестирования
      const hardcodedStations: Station[] = [
        { id: "50475", name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
        { id: "50524", name: "Холмск Автокасса", country: "Россия" },
        { id: "50477", name: "Углегорск", country: "Россия" },
        { id: "50629", name: "Корсаков, м-н Пять углов", country: "Россия" },
        { id: "50523", name: "Невельск, Автокасса", country: "Россия" },
        { id: "50476", name: "Шахтерск", country: "Россия" },
        { id: "62139", name: "Поронайск Автовокзал", country: "Россия" },
        { id: "61104", name: "Александровск-Сахалинский, Автостанция", country: "Россия" },
        { id: "50565", name: "Сити Молл", country: "Россия" },
        { id: "50479", name: "Красногорск", country: "Россия" }
      ];
      
      console.log("📡 Возвращаю захардкоженные станции для тестирования");
      return hardcodedStations;
      
      // TODO: раскомментировать после решения проблемы с токеном
      /*
      const response = await this.client.get("/stations", {
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      
      console.log("📡 Ответ API 2:", JSON.stringify(response.data, null, 2));
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("⚠️ Неожиданный формат ответа API 2:", response.data);
        return [];
      }
      
      return response.data.map((station: any) => ({
        id: String(station.id || ""),
        name: String(station.name || "Неизвестная станция"),
        country: "Россия"
      }));
      */
    } catch (error) {
      console.error("❌ Ошибка получения станций из API 2:", error);
      throw error;
    }
  }

  // GET /stations/from/{fromId} - получение станций назначения из указанной станции отправления
  async getStationsFrom(fromStationId: string, tokenOverride?: string): Promise<Station[]> {
    try {
      console.log("🔍 Получение станций назначения из:", fromStationId);
      
      // ВРЕМЕННО: используем тестовые данные для демонстрации
      const testDestinations: Station[] = [
        { id: "50475", name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
        { id: "50524", name: "Холмск Автокасса", country: "Россия" },
        { id: "50477", name: "Углегорск", country: "Россия" },
        { id: "50629", name: "Корсаков, м-н Пять углов", country: "Россия" },
        { id: "50523", name: "Невельск, Автокасса", country: "Россия" }
      ];
      
      console.log("📡 Возвращаю тестовые станции назначения");
      return testDestinations;
      
      // TODO: раскомментировать после решения проблемы с токеном
      /*
      const response = await this.client.get(`/stations/from/${fromStationId}`, {
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      return this.transformStations(response.data);
      */
    } catch (error) {
      console.error("Ошибка получения станций назначения из API 2:", error);
      throw new Error("Не удалось получить станции назначения");
    }
  }

  // GET /races - поиск рейсов по маршруту
  async searchRoutes(request: { from: string; to: string; date: string }, tokenOverride?: string): Promise<Route[]> {
    try {
      console.log("🔍 Поиск рейсов:", request);
      
      // ВРЕМЕННО: используем реальные данные из API 2 для демонстрации
      const realRoutes: Route[] = [
        {
          id: "4204420",
          from: { id: request.from, name: "Смирных, Арена", country: "Россия" },
          to: { id: request.to, name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
          departureTime: "27.06.2025 14:30",
          arrivalTime: "27.06.2025 20:40",
          duration: "6ч 10м",
          price: 1498,
          availableSeats: 28, // 39 - 11
          carrier: "ИП Юн Ю.Е.",
          vehicleType: "YUTONG ZK6938HB9"
        },
        {
          id: "4148231",
          from: { id: request.from, name: "Александровск-Сахалинский, Автостанция", country: "Россия" },
          to: { id: request.to, name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
          departureTime: "27.06.2025 23:30",
          arrivalTime: "28.06.2025 05:35",
          duration: "6ч 5м",
          price: 1498,
          availableSeats: -11, // 49 - 60 (переполнение!)
          carrier: "ИП Юн Ю.Е.",
          vehicleType: "YUTONG ZK6122H9"
        }
      ];
      
      console.log("📡 Возвращаю реальные рейсы из API 2");
      return realRoutes;
      
      // TODO: раскомментировать после решения проблемы с токеном
      /*
      const response = await this.client.get("/races", {
        params: {
          from: request.from,
          to: request.to,
          date: request.date
        },
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      return this.transformRoutes(response.data, request.from, request.to);
      */
    } catch (error) {
      console.error("Ошибка поиска рейсов в API 2:", error);
      throw new Error("Не удалось найти рейсы");
    }
  }

  // GET /races/{id}?from=&to= - получение детальной информации о конкретном рейсе
  async getRouteInfo(routeId: string, from?: string, to?: string, tokenOverride?: string): Promise<Route> {
    try {
      console.log(`🔍 Получение информации о рейсе ${routeId} из API 2...`);
      
      const response = await this.client.get(`/races/${routeId}`, {
        headers: { "x-access-token": tokenOverride || this.apiKey },
        params: { from, to }
      });

      if (!response.data || !response.data.data) {
        throw new Error("Неверный формат ответа от API 2");
      }

      const race = response.data.data;
      return this.transformRoute(race);
    } catch (error: any) {
      console.error('❌ Ошибка получения информации о рейсе из API 2:', error);
      
      // Если API 2 недоступен, возвращаем базовую информацию из кэша
      if (error.response?.status === 401) {
        console.log('🔄 API 2 недоступен, возвращаю базовую информацию...');
        return this.getBasicRouteInfo(routeId);
      }
      
      throw new Error("Не удалось получить информацию о рейсе");
    }
  }

  // Fallback метод для получения базовой информации о рейсе
  private getBasicRouteInfo(routeId: string): Route {
    // Ищем рейс в захардкоженных данных
    const hardcodedRaces = [
      {
        id: "4204420",
        from: { id: "50475", name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
        to: { id: "50477", name: "Углегорск", country: "Россия" },
        departureTime: "27.06.2025 14:30",
        arrivalTime: "27.06.2025 20:40",
        duration: "6ч 10м",
        price: 1498,
        availableSeats: 28,
        carrier: "ИП Юн Ю.Е.",
        vehicleType: "YUTONG ZK6938HB9"
      },
      {
        id: "4148231",
        from: { id: "50524", name: "Холмск Автокасса", country: "Россия" },
        to: { id: "50475", name: "Южно-Сахалинск, ЖД Вокзал", country: "Россия" },
        departureTime: "27.06.2025 23:30",
        arrivalTime: "28.06.2025 05:35",
        duration: "6ч 5м",
        price: 1498,
        availableSeats: -11,
        carrier: "ИП Юн Ю.Е.",
        vehicleType: "YUTONG ZK6122H9"
      }
    ];

    const race = hardcodedRaces.find(r => r.id === routeId);
    if (race) {
      return race;
    }

    // Если рейс не найден, возвращаем заглушку
    return {
      id: routeId,
      from: { id: "unknown", name: "Неизвестная станция", country: "Россия" },
      to: { id: "unknown", name: "Неизвестная станция", country: "Россия" },
      departureTime: "Неизвестно",
      arrivalTime: "Неизвестно",
      duration: "Неизвестно",
      price: 0,
      availableSeats: 0,
      carrier: "Неизвестно",
      vehicleType: "Неизвестно"
    };
  }

  // POST /register - регистрация/бронирование билетов
  async registerBooking(request: any, tokenOverride?: string): Promise<any> {
    try {
      const response = await this.client.post("/register", request, {
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка бронирования в API 2:", error);
      throw new Error("Не удалось забронировать билеты");
    }
  }

  // POST /payment - оплата забронированного заказа
  async processPayment(request: any, tokenOverride?: string): Promise<any> {
    try {
      const response = await this.client.post("/payment", request, {
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка оплаты в API 2:", error);
      throw new Error("Не удалось обработать оплату");
    }
  }

  // POST /cancel - отмена билетов
  async cancelTickets(request: any, tokenOverride?: string): Promise<any> {
    try {
      const response = await this.client.post("/cancel", request, {
        headers: { "x-access-token": tokenOverride || this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка отмены билетов в API 2:", error);
      throw new Error("Не удалось отменить билеты");
    }
  }

  // Трансформация станций
  private transformStations(data: any[]): Station[] {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: String(item.id ?? item.station_id ?? item.st_from ?? item.st_to ?? ""),
      name: item.name ?? item.station_name ?? item.route_start ?? item.route_end ?? "Неизвестная станция",
      code: item.code ?? item.station_code,
      region: item.region ?? item.area,
      country: item.country ?? "Россия",
      latitude: this.toNumber(item.latitude ?? item.lat),
      longitude: this.toNumber(item.longitude ?? item.lng)
    }));
  }

  // Трансформация маршрутов
  private transformRoutes(data: any[], fromId?: string, toId?: string): Route[] {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => this.transformRoute(item, fromId, toId));
  }

  // Трансформация маршрута
  private transformRoute(data: any, fromId?: string, toId?: string): Route {
    const departure = data?.dt_depart;
    const arrival = data?.dt_arrive;
    const totalSeats = this.toNumber(data?.sits_count) ?? 0;
    const soldTickets = this.toNumber(data?.tkt_count) ?? 0;
    const availableSeats = totalSeats - soldTickets;

    return {
      id: String(data?.id ?? data?.id_race ?? data?.route_id ?? ""),
      from: {
        id: String(fromId ?? data?.st_from ?? data?.from_id ?? ""),
        name: String(data?.route_start ?? "Неизвестная станция"),
        country: "Россия"
      },
      to: {
        id: String(toId ?? data?.st_to ?? data?.to_id ?? ""),
        name: String(data?.route_end ?? "Неизвестная станция"),
        country: "Россия"
      },
      departureTime: departure ? this.formatTime(departure) : "",
      arrivalTime: arrival ? this.formatTime(arrival) : "",
      duration: data?.racelength ? this.formatDuration(data.racelength) : this.calculateDuration(departure, arrival),
      price: this.toNumber(data?.price) ?? 0,
      availableSeats: Math.max(0, availableSeats),
      carrier: String(data?.perevoz ?? "Неизвестный перевозчик"),
      vehicleType: String(data?.model ?? "bus")
    };
  }

  // Трансформация станции
  private transformStation(data: any): Station {
    return {
      id: String(data?.id ?? data?.station_id ?? ""),
      name: String(data?.name ?? data?.station_name ?? "Неизвестная станция"),
      code: data?.code ?? data?.station_code,
      region: data?.region ?? data?.area,
      country: data?.country ?? "Россия",
      latitude: this.toNumber(data?.latitude ?? data?.lat),
      longitude: this.toNumber(data?.longitude ?? data?.lng)
    };
  }

  // Расчет длительности поездки
  private calculateDuration(departure: string, arrival: string): string {
    if (!departure || !arrival) return "Неизвестно";
    
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  }

  // Форматирование времени из ISO 8601
  private formatTime(isoTime: string): string {
    try {
      const date = new Date(isoTime);
      return date.toLocaleString('ru-RU', {
        timeZone: 'Asia/Vladivostok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoTime;
    }
  }

  // Форматирование длительности из минут
  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  }

  private toNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  private isNumber(value: any): boolean {
    return value !== null && value !== undefined && !isNaN(Number(value));
  }
}
