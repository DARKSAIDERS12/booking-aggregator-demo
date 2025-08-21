import axios, { AxiosInstance } from 'axios';

export interface StrapiOrder {
  id?: number;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  status: 'pending' | 'paid' | 'canceled';
  total_amount: number;
  currency: 'RUB' | 'KZT' | 'USD';
  route: number;
  payment_id?: string;
}

export interface StrapiRoute {
  id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  carrier: string;
  route_code: string;
  data_source: string;
  route_status: string;
  seats_available: number;
  from_station: number;
  to_station: number;
}

export interface StrapiStation {
  id: number;
  station_id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  api_source: 'gds' | 'paybilet';
  is_active: boolean;
}

export class StrapiService {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.apiToken = process.env.STRAPI_API_TOKEN || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Заказы
  async createOrder(orderData: StrapiOrder): Promise<StrapiOrder> {
    try {
      // Преобразуем route_id в правильный формат для Strapi
      const strapiOrderData = {
        ...orderData,
        route: orderData.route // Strapi ожидает ID маршрута как число
      };

      console.log('📤 Отправляем заказ в Strapi:', strapiOrderData);

      const response = await this.client.post('/api/orders', {
        data: strapiOrderData
      });

      console.log('✅ Заказ успешно создан в Strapi:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Ошибка создания заказа в Strapi:', error);
      if ((error as any).response) {
        console.error('Детали ошибки:', (error as any).response.data);
      }
      throw error;
    }
  }

  async getOrders(): Promise<StrapiOrder[]> {
    try {
      const response = await this.client.get('/api/orders');
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка получения заказов из Strapi:', error);
      throw error;
    }
  }

  async getOrder(id: number): Promise<StrapiOrder | null> {
    try {
      const response = await this.client.get(`/api/orders/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка получения заказа ${id} из Strapi:`, error);
      return null;
    }
  }

  async updateOrder(id: number, orderData: Partial<StrapiOrder>): Promise<StrapiOrder | null> {
    try {
      const response = await this.client.put(`/api/orders/${id}`, {
        data: orderData
      });
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка обновления заказа ${id} в Strapi:`, error);
      return null;
    }
  }

  // Станции
  async getStations(): Promise<StrapiStation[]> {
    try {
      const response = await this.client.get('/api/tests');
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка получения станций из Strapi:', error);
      throw error;
    }
  }

  async getStation(id: number): Promise<StrapiStation | null> {
    try {
      const response = await this.client.get(`/api/tests/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка получения станции ${id} из Strapi:`, error);
      return null;
    }
  }

  async createStation(stationData: StrapiStation): Promise<StrapiStation> {
    try {
      const response = await this.client.post('/api/tests', {
        data: stationData
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка создания станции в Strapi:', error);
      throw error;
    }
  }

  async updateStation(id: number, stationData: Partial<StrapiStation>): Promise<StrapiStation | null> {
    try {
      const response = await this.client.put(`/api/tests/${id}`, {
        data: stationData
      });
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка обновления станции ${id} в Strapi:`, error);
      return null;
    }
  }

  // Маршруты
  async getRoutes(): Promise<StrapiRoute[]> {
    try {
      const response = await this.client.get('/api/test2s');
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка получения маршрутов из Strapi:', error);
      throw error;
    }
  }

  async getRoute(id: number): Promise<StrapiRoute | null> {
    try {
      const response = await this.client.get(`/api/test2s/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка получения маршрута ${id} из Strapi:`, error);
      return null;
    }
  }

  async createRoute(routeData: StrapiRoute): Promise<StrapiRoute> {
    try {
      const response = await this.client.post('/api/test2s', {
        data: routeData
      });
      return response.data.data;
    } catch (error) {
      console.error('Ошибка создания маршрута в Strapi:', error);
      throw error;
    }
  }

  async updateRoute(id: number, routeData: Partial<StrapiRoute>): Promise<StrapiRoute | null> {
    try {
      const response = await this.client.put(`/api/test2s/${id}`, {
        data: routeData
      });
      return response.data.data;
    } catch (error) {
      console.error(`Ошибка обновления маршрута ${id} в Strapi:`, error);
      return null;
    }
  }

  // Проверка соединения
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/api/tests');
      return true;
    } catch (error) {
      console.error('Ошибка соединения со Strapi:', error);
      return false;
    }
  }

  // Получение информации о системе
  async getSystemInfo(): Promise<any> {
    try {
      const response = await this.client.get('/admin/information');
      return response.data;
    } catch (error) {
      console.error('Ошибка получения информации о системе:', error);
      return null;
    }
  }
}

export default StrapiService;
