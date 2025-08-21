import { createClientAsync } from 'soap';
import { Station, Route } from '../types';

// Интерфейсы для GDS API 1.14
interface GdsPoint {
  id: number;
  name: string;
  address: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

interface GdsRace {
  uid: string;
  name: string;
  num: string;
  dispatchDate: Date;
  arrivalDate: Date;
  dispatchPointId: number;
  arrivalPointId: number;
  dispatchStationName: string;
  arrivalStationName: string;
  price: number;
  freeSeatCount: number;
  freeSeatEstimation: string;
  carrier: string;
  busInfo: string;
  status: string;
  type: string;
  depotId: number;
}

// Новые интерфейсы для НДС 2025
interface TicketPayment {
  type: 'FARE' | 'SUPPLIER_FEE' | 'AGENT_FEE' | 'DEDUCTION';
  name: string;
  amount: number;
  taxRate: number | null; // 5, 7, 10, 12, null (без НДС), -1 (неизвестно)
  relation: 'AGENT' | 'OWN';
  supplierInfo?: string;
  supplierInn?: string;
}

interface GdsTicket {
  id: number;
  uid: string;
  ticketCode: string;
  ticketNum: string;
  ticketSeries: string;
  ticketClass: string;
  ticketType: string;
  raceUid: string;
  raceNum: string;
  raceName: string;
  dispatchDate: Date;
  arrivalDate: Date;
  dispatchStation: string;
  arrivalStation: string;
  seat: string;
  platform: string;
  lastName: string;
  firstName: string;
  middleName: string;
  docType: string;
  docSeries: string;
  docNum: string;
  citizenship: string;
  gender: string;
  birthday: Date;
  price: number;
  supplierPrice: number;
  dues: number;
  vat: number;
  status: string;
  payments?: TicketPayment[];
}

interface GdsOrder {
  uid: string;
  id: number;
  reserveCode: string;
  total: number;
  status: string;
  created: Date;
  expired: Date;
  finished?: Date;
  tickets: GdsTicket[];
}

interface GdsRaceSearchParams {
  dispatchPointId: number;
  arrivalPointId: number;
  date: Date;
}

export class Api1Service {
  private client: any;
  private wsdlUrl: string;
  private username: string;
  private password: string;
  private isInitialized: boolean = false;

  constructor() {
    // Используем локальный WSDL файл для обхода проблем с аутентификацией
    this.wsdlUrl = './gds_api1.wsdl';
    this.username = process.env.API1_USERNAME || '';
    this.password = process.env.API1_PASSWORD || '';
    
    console.log('🔧 GDS API 1 конфигурация:');
    console.log('   URL:', this.wsdlUrl);
    console.log('   Username:', this.username);
    console.log('   Password:', this.password ? '***' : 'не задан');
  }

  // Инициализация SOAP клиента
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔌 Инициализация SOAP клиента для GDS API 1...');
      
      // Проверяем доступность WSDL
      try {
        // Создаем клиент из локального WSDL файла
        this.client = await createClientAsync(this.wsdlUrl);
        
        // Устанавливаем базовый URL для SOAP вызовов
        this.client.setEndpoint('https://cluster.avtovokzal.ru/gdstest/soap/sales');
        
        // Добавляем Basic Authentication для SOAP вызовов
        if (this.username && this.password) {
          // Создаем кастомный security объект с заголовками
          const customSecurity = {
            addHeaders: (headers: any) => {
              headers['Authorization'] = 'Basic ' + Buffer.from(this.username + ':' + this.password).toString('base64');
            },
            toXML: () => ''
          };
          this.client.setSecurity(customSecurity);
        }
        
        this.isInitialized = true;
        console.log('✅ SOAP клиент GDS API 1 инициализирован с аутентификацией');
        return true;
      } catch (wsdlError) {
        console.warn('⚠️ WSDL недоступен, отключаем GDS API 1:', (wsdlError as Error).message);
        this.isInitialized = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации SOAP клиента:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Получение списка станций отправления
  async getStations(): Promise<Station[]> {
    try {
      const isInitialized = await this.initialize();
      if (!isInitialized) {
        console.log('⚠️ GDS API 1 недоступен, возвращаем пустой список станций');
        return [];
      }
      
      console.log('🔍 Запрос станций из GDS API 1...');
      
      // Получаем все регионы (regionId = 0 для всех регионов)
      const regionsResponse = await this.client.getRegionsAsync(0);
      console.log('🔍 Ответ getRegionsAsync:', JSON.stringify(regionsResponse, null, 2));
      
      const regions = regionsResponse[0];
      console.log('🔍 Регионы:', JSON.stringify(regions, null, 2));
      
      // Проверяем структуру ответа - может быть объект с полем return
      let regionsArray = regions;
      if (regions && typeof regions === 'object' && regions.return) {
        regionsArray = regions.return;
        console.log('🔍 Извлечены регионы из поля return:', JSON.stringify(regionsArray, null, 2));
      }
      
      if (!regionsArray || !Array.isArray(regionsArray)) {
        console.log('⚠️ Регионы не найдены или не являются массивом');
        return [];
      }
      
      let allStations: Station[] = [];
      
      // Для каждого региона получаем пункты отправления
      for (const region of regionsArray) {
        try {
          const pointsResponse = await this.client.getDispatchPointsAsync(region.id);
          console.log(`🔍 Ответ getDispatchPointsAsync для региона ${region.id}:`, JSON.stringify(pointsResponse, null, 2));
          
          let points: any = pointsResponse[0];
          
          // Проверяем структуру ответа - может быть объект с полем return
          if (points && typeof points === 'object' && points.return) {
            points = points.return;
            console.log(`🔍 Извлечены пункты из поля return для региона ${region.id}:`, JSON.stringify(points, null, 2));
          }
          
          if (points && Array.isArray(points)) {
            const stations = points.map((point: GdsPoint) => ({
              id: String(point.id),
              name: point.name,
              country: 'Россия'
            }));
            
            allStations = [...allStations, ...stations];
            console.log(`✅ Добавлено ${stations.length} станций из региона ${region.id}`);
          }
        } catch (error) {
          console.error(`❌ Ошибка получения пунктов для региона ${region.id}:`, error);
        }
      }
      
      console.log(`📡 Получено ${allStations.length} станций из GDS API 1`);
      return allStations;
    } catch (error) {
      console.error('❌ Ошибка получения станций из GDS API 1:', error);
      throw error;
    }
  }

  // Получение станций назначения из конкретной станции
  async getStationsFrom(fromStationId: string): Promise<Station[]> {
    try {
      const isInitialized = await this.initialize();
      if (!isInitialized) {
        console.log('⚠️ GDS API 1 недоступен, возвращаем пустой список станций назначения');
        return [];
      }
      
      console.log(`🔍 Запрос станций назначения из ${fromStationId} в GDS API 1...`);
      
      // Получаем пункты прибытия для станции отправления
      const pointsResponse = await this.client.getArrivalPointsAsync(
        parseInt(fromStationId),
        '' // pattern - пустая строка для получения всех
      );
      
      console.log(`🔍 Ответ getArrivalPointsAsync для станции ${fromStationId}:`, JSON.stringify(pointsResponse, null, 2));
      
      let points: any = pointsResponse[0];
      
      // Проверяем структуру ответа - может быть объект с полем return
      if (points && typeof points === 'object' && points.return) {
        points = points.return;
        console.log(`🔍 Извлечены пункты назначения из поля return для станции ${fromStationId}:`, JSON.stringify(points, null, 2));
      }
      
      if (!points || !Array.isArray(points)) {
        console.log(`⚠️ Пункты назначения не найдены или не являются массивом для станции ${fromStationId}`);
        return [];
      }
      
      const stations = points.map((point: GdsPoint) => ({
        id: String(point.id),
        name: point.name,
        country: 'Россия'
      }));
      
      console.log(`📡 Получено ${stations.length} станций назначения из GDS API 1`);
      return stations;
    } catch (error) {
      console.error('❌ Ошибка получения станций назначения из GDS API 1:', error);
      throw error;
    }
  }

  // Поиск рейсов
  async searchRoutes(params: { from: string; to: string; date: string }): Promise<Route[]> {
    try {
      const isInitialized = await this.initialize();
      if (!isInitialized) {
        console.log('⚠️ GDS API 1 недоступен, возвращаем пустой список рейсов');
        return [];
      }
      
      console.log('🔍 Поиск рейсов в GDS API 1:', params);
      
      // Преобразуем дату в формат Date
      const dateParts = params.date.split('.');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Месяцы в JS начинаются с 0
      const year = 2000 + parseInt(dateParts[2]); // 25 -> 2025
      const searchDate = new Date(year, month, day);
      
      // Получаем рейсы
      const racesResponse = await this.client.getRacesAsync(
        parseInt(params.from),
        parseInt(params.to),
        searchDate
      );
      
      const races: GdsRace[] = racesResponse[0];
      
      // Трансформируем в наш формат
      const routes = races.map((race: GdsRace) => ({
        id: race.uid,
        from: {
          id: String(race.dispatchPointId),
          name: race.dispatchStationName,
          country: 'Россия'
        },
        to: {
          id: String(race.arrivalPointId),
          name: race.arrivalStationName,
          country: 'Россия'
        },
        departureTime: this.formatDate(race.dispatchDate),
        arrivalTime: this.formatDate(race.arrivalDate),
        duration: this.calculateDuration(race.dispatchDate, race.arrivalDate),
        price: race.price,
        availableSeats: race.freeSeatCount,
        carrier: race.carrier,
        vehicleType: race.busInfo || 'bus'
      }));
      
      console.log(`📡 Найдено ${routes.length} рейсов в GDS API 1`);
      return routes;
    } catch (error) {
      console.error('❌ Ошибка поиска рейсов в GDS API 1:', error);
      throw error;
    }
  }

  // Получение детальной информации о рейсе
  async getRouteInfo(routeId: string): Promise<Route> {
    try {
      await this.initialize();
      
      console.log(`🔍 Получение информации о рейсе ${routeId} из GDS API 1...`);
      
      const raceResponse = await this.client.getRaceAsync(routeId);
      const race: GdsRace = raceResponse[0];
      
      const route: Route = {
        id: race.uid,
        from: {
          id: String(race.dispatchPointId),
          name: race.dispatchStationName,
          country: 'Россия'
        },
        to: {
          id: String(race.arrivalPointId),
          name: race.arrivalStationName,
          country: 'Россия'
        },
        departureTime: this.formatDate(race.dispatchDate),
        arrivalTime: this.formatDate(race.arrivalDate),
        duration: this.calculateDuration(race.dispatchDate, race.arrivalDate),
        price: race.price,
        availableSeats: race.freeSeatCount,
        carrier: race.carrier,
        vehicleType: race.busInfo || 'bus'
      };
      
      console.log('📡 Информация о рейсе получена из GDS API 1');
      return route;
    } catch (error) {
      console.error('❌ Ошибка получения информации о рейсе из GDS API 1:', error);
      throw error;
    }
  }

  // Бронирование заказа
  async bookOrder(raceUid: string, passengers: any[]): Promise<GdsOrder> {
    try {
      await this.initialize();
      
      console.log(`🔒 Бронирование заказа для рейса ${raceUid} в GDS API 1...`);
      
      // Трансформируем пассажиров в формат GDS
      const sales = passengers.map(passenger => ({
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        middleName: passenger.middleName || '',
        docType: passenger.docType || '1', // 1 - Паспорт РФ
        docSeries: passenger.docSeries || '',
        docNum: passenger.docNum || '',
        citizenship: passenger.citizenship || 'РОССИЯ',
        gender: passenger.gender || 'M',
        birthday: passenger.birthday || new Date(),
        seat: passenger.seat || '',
        email: passenger.email || '',
        phone: passenger.phone || ''
      }));
      
      const orderResponse = await this.client.bookOrderAsync(raceUid, sales);
      const order: GdsOrder = orderResponse[0];
      
      console.log(`✅ Заказ забронирован в GDS API 1. Код: ${order.reserveCode}`);
      return order;
    } catch (error) {
      console.error('❌ Ошибка бронирования заказа в GDS API 1:', error);
      throw error;
    }
  }

  // Подтверждение заказа
  async confirmOrder(orderUid: string): Promise<GdsOrder> {
    try {
      await this.initialize();
      
      console.log(`✅ Подтверждение заказа ${orderUid} в GDS API 1...`);
      
      const orderResponse = await this.client.confirmOrderAsync(orderUid);
      const order: GdsOrder = orderResponse[0];
      
      console.log('✅ Заказ подтвержден в GDS API 1');
      return order;
    } catch (error) {
      console.error('❌ Ошибка подтверждения заказа в GDS API 1:', error);
      throw error;
    }
  }

  // Отмена заказа
  async cancelOrder(orderUid: string): Promise<GdsOrder> {
    try {
      await this.initialize();
      
      console.log(`❌ Отмена заказа ${orderUid} в GDS API 1...`);
      
      const orderResponse = await this.client.cancelOrderAsync(orderUid);
      const order: GdsOrder = orderResponse[0];
      
      console.log('✅ Заказ отменен в GDS API 1');
      return order;
    } catch (error) {
      console.error('❌ Ошибка отмены заказа в GDS API 1:', error);
      throw error;
    }
  }

  // Отмена билета
  async cancelTicket(ticketId: number): Promise<GdsTicket> {
    try {
      await this.initialize();
      
      console.log(`🔄 Отмена билета ${ticketId} в GDS API 1...`);
      
      const ticketResponse = await this.client.cancelTicketAsync(ticketId);
      const ticket: GdsTicket = ticketResponse[0];
      
      console.log(`✅ Билет отменен в GDS API 1. Сумма возврата: ${ticket.vat || 0} руб.`);
      return ticket;
    } catch (error) {
      console.error('❌ Ошибка отмены билета в GDS API 1:', error);
      throw error;
    }
  }

  // Получение информации о заказе
  async getOrder(orderId: number): Promise<GdsOrder> {
    try {
      await this.initialize();
      
      console.log(`🔍 Получение информации о заказе ${orderId} из GDS API 1...`);
      
      const orderResponse = await this.client.getOrderAsync(orderId);
      const order: GdsOrder = orderResponse[0];
      
      console.log('📡 Информация о заказе получена из GDS API 1');
      return order;
    } catch (error) {
      console.error('❌ Ошибка получения информации о заказе из GDS API 1:', error);
      throw error;
    }
  }

  // Возврат билета
  async returnTicket(ticketId: number): Promise<GdsTicket> {
    try {
      await this.initialize();
      
      console.log(`🔄 Возврат билета ${ticketId} в GDS API 1...`);
      
      const ticketResponse = await this.client.returnTicketAsync(ticketId);
      const ticket: GdsTicket = ticketResponse[0];
      
      console.log(`✅ Билет возвращен в GDS API 1. Сумма возврата: ${ticket.vat || 0} руб.`);
      return ticket;
    } catch (error) {
      console.error('❌ Ошибка возврата билета в GDS API 1:', error);
      throw error;
    }
  }

  // Тест соединения
  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      
      const response = await this.client.echoAsync('test');
      const result = response[0];
      
      console.log('✅ Соединение с GDS API 1 установлено');
      return result === 'test';
    } catch (error) {
      console.error('❌ Ошибка соединения с GDS API 1:', error);
      return false;
    }
  }

  // Получение версии сервера
  async getVersion(): Promise<string> {
    try {
      await this.initialize();
      
      const response = await this.client.getVersionAsync();
      return response[0];
    } catch (error) {
      console.error('❌ Ошибка получения версии GDS API 1:', error);
      throw error;
    }
  }

  // Приватные методы для форматирования
  private formatDate(date: Date): string {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      return d.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(date);
    }
  }

  private calculateDuration(departure: Date, arrival: Date): string {
    if (!departure || !arrival) return 'Неизвестно';
    
    try {
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}ч ${minutes}м`;
    } catch {
      return 'Неизвестно';
    }
  }
}
