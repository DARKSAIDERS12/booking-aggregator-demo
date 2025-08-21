import axios from 'axios';

export interface StrapiOrder {
  id: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  total_amount: number;
  currency: 'RUB' | 'KZT' | 'USD';
  status: 'pending' | 'paid' | 'canceled';
  order_number: string;
  route: string;
}

export default class StrapiService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.apiToken = process.env.STRAPI_API_TOKEN || '';
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/api${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response;
    } catch (error) {
      console.error(`Ошибка ${method} запроса к ${endpoint}:`, error);
      throw error;
    }
  }

  // Методы для работы с заказами
  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updateData: any): Promise<any> {
    try {
      const response = await this.makeRequest('PUT', `/orders/${orderId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления заказа:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await this.makeRequest('GET', `/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка получения заказа:', error);
      throw error;
    }
  }

  async getOrders(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/orders');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения всех заказов:', error);
      return [];
    }
  }

  // Базовые методы для работы с API
  async getApi1Stations(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/api1-stations');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения станций API 1:', error);
      return [];
    }
  }

  async getApi2Stations(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/api2-stations');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения станций API 2:', error);
      return [];
    }
  }

  async getStationMappings(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/station-mappings');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения сопоставлений станций:', error);
      return [];
    }
  }

  async getStationGroups(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/station-groups');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения групп станций:', error);
      return [];
    }
  }

  // Методы для создания и обновления
  async createStationMapping(mappingData: any): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/station-mappings', mappingData);
      return response.data;
    } catch (error) {
      console.error('Ошибка создания сопоставления станций:', error);
      throw error;
    }
  }

  async createStationGroup(groupData: any): Promise<any> {
    try {
      const response = await this.makeRequest('POST', '/station-groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Ошибка создания группы станций:', error);
      throw error;
    }
  }

  async updateStationGroup(groupId: string, updateData: any): Promise<any> {
    try {
      const response = await this.makeRequest('PUT', `/station-groups/${groupId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления группы станций:', error);
      throw error;
    }
  }
}
