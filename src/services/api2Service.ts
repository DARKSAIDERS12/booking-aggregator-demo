import axios from 'axios';

export class Api2Service {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.API2_BASE_URL || 'http://vl.rfbus.net:8086';
    this.apiKey = process.env.API2_API_KEY || '';
    
    console.log('🔧 Api2Service инициализирован с настройками:', {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 20)}...` : 'не настроен'
    });
  }

  // Поиск рейсов
  async searchRaces(params: { from: string; to: string; date: string }): Promise<any[]> {
    try {
      console.log('🔍 Поиск рейсов в Paybilet API:', params);
      
      if (!this.apiKey) {
        console.log('⚠️ API ключ Paybilet не настроен');
        return [];
      }

      // Реальный API вызов к Paybilet
      const response = await axios.get(`${this.baseUrl}/races`, {
        headers: {
          'x-access-token': this.apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          from: params.from,
          to: params.to,
          date: params.date
        },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        console.log(`✅ Найдено ${response.data.data?.length || 0} рейсов в Paybilet API`);
        return response.data.data || [];
      }

      console.log('⚠️ Paybilet API вернул пустой ответ');
      return [];
      
    } catch (error: any) {
      console.error('❌ Ошибка поиска рейсов в Paybilet API:', error.message);
      return [];
    }
  }

  // Получение информации о рейсе
  async getRaceInfo(raceId: string): Promise<any> {
    try {
      console.log('🔍 Получение информации о рейсе из Paybilet API:', raceId);
      
      if (!this.apiKey) {
        console.log('⚠️ API ключ Paybilet не настроен');
        return null;
      }

      const response = await axios.get(`${this.baseUrl}/races/${raceId}`, {
        headers: {
          'x-access-token': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      return null;
      
    } catch (error: any) {
      console.error('❌ Ошибка получения информации о рейсе из Paybilet API:', error.message);
      return null;
    }
  }

        // Получение станций
      async getStations(): Promise<any[]> {
        try {
          console.log('🔍 Получение станций из Paybilet API');
          
          if (!this.apiKey) {
            console.log('⚠️ API ключ Paybilet не настроен');
            return [];
          }

          const response = await axios.get(`${this.baseUrl}/stations`, {
            headers: {
              'x-access-token': this.apiKey,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });

      if (response.data && response.data.success) {
        console.log(`✅ Получено ${response.data.data?.length || 0} станций из Paybilet API`);
        return response.data.data || [];
      }

      return [];
      
    } catch (error: any) {
      console.error('❌ Ошибка получения станций из Paybilet API:', error.message);
      return [];
    }
  }

  // Тест соединения
  async testConnection(): Promise<{ status: boolean; responseTime: number; error?: string }> {
    try {
      console.log('🔌 Тест соединения с Paybilet API...');
      console.log('📍 URL:', this.baseUrl);
      console.log('🔑 API Key:', this.apiKey ? `${this.apiKey.substring(0, 20)}...` : 'не настроен');
      
      if (!this.apiKey) {
        return { status: false, responseTime: 0, error: 'API ключ не настроен' };
      }
      
      if (!this.baseUrl) {
        return { status: false, responseTime: 0, error: 'Base URL не настроен' };
      }
      
      const startTime = Date.now();
      
      // Тестируем соединение с Paybilet API - пробуем разные форматы авторизации
      let response;
      
      // Используем правильный заголовок x-access-token, как в Postman
      response = await axios.get(`${this.baseUrl}/stations`, {
        headers: {
          'x-access-token': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ Успешно с x-access-token заголовком');
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        console.log('✅ Соединение с Paybilet API успешно');
        return { status: true, responseTime };
      } else {
        return { status: false, responseTime, error: `HTTP ${response.status}` };
      }
      
    } catch (error: any) {
      const responseTime = 0;
      console.error('❌ Ошибка соединения с Paybilet API:', error.message);
      if (error.response) {
        console.error('📊 Статус ответа:', error.response.status);
        console.error('📄 Данные ответа:', error.response.data);
      }
      return { 
        status: false, 
        responseTime, 
        error: error.message || 'Неизвестная ошибка' 
      };
    }
  }
}
