#!/usr/bin/env node

/**
 * Улучшенный скрипт для тестирования GDS API 1
 * Запуск: node test-gds-api-advanced.js
 */

const soap = require('soap');
const fs = require('fs');
const path = require('path');

// Конфигурация тестового GDS API
const config = {
  url: 'https://cluster.avtovokzal.ru/gdstest/soap/json',
  wsdlUrl: 'https://cluster.avtovokzal.ru/gdstest/soap/json?wsdl',
  username: 'sakhbus',
  password: 'Zxvghh4567!'
};

async function testGdsApi() {
  console.log('🚀 Тестирование GDS API 1 (улучшенная версия)...');
  console.log('📍 URL:', config.url);
  console.log('📋 WSDL:', config.wsdlUrl);
  console.log('👤 Пользователь:', config.username);
  console.log('🔑 Пароль:', config.password ? '***' : 'не указан');
  console.log('');

  try {
    // Создаем SOAP клиент с WSDL
    console.log('🔌 Создание SOAP клиента с WSDL...');
    const client = await soap.createClientAsync(config.wsdlUrl);
    console.log('✅ SOAP клиент создан успешно');

    // Добавляем аутентификацию
    console.log('🔐 Настройка аутентификации...');
    client.setSecurity(new soap.BasicAuthSecurity(config.username, config.password));
    console.log('✅ Аутентификация настроена');

    // Получаем описание API
    console.log('📋 Получение описания API...');
    const description = client.describe();
    const methods = Object.keys(description);
    
    console.log(`✅ Найдено ${methods.length} методов:`);
    methods.forEach((method, index) => {
      console.log(`  ${index + 1}. ${method}`);
    });

    // Тестируем ключевые методы
    console.log('');
    console.log('🧪 Тестирование ключевых методов...');
    
    const testMethods = [
      {
        name: 'getVersion',
        params: {},
        description: 'Получение версии API'
      },
      {
        name: 'getCountries',
        params: {},
        description: 'Получение списка стран'
      },
      {
        name: 'getRegions',
        params: { countryId: 1 },
        description: 'Получение регионов страны (ID=1)'
      },
      {
        name: 'getDispatchPoints',
        params: { regionId: 1 },
        description: 'Получение станций отправления региона (ID=1)'
      },
      {
        name: 'getArrivalPoints',
        params: { dispatchPointId: 1 },
        description: 'Получение станций назначения для станции (ID=1)'
      },
      {
        name: 'getRaces',
        params: { 
          dispatchPlaceId: 1, 
          arrivalPlaceId: 2, 
          date: '2025-08-22' 
        },
        description: 'Поиск рейсов'
      }
    ];
    
    for (const testMethod of testMethods) {
      if (methods.includes(testMethod.name)) {
        try {
          console.log(`\n🔍 Тестирование метода: ${testMethod.name}`);
          console.log(`   📝 Описание: ${testMethod.description}`);
          console.log(`   📥 Параметры:`, testMethod.params);
          
          // Вызываем метод
          const result = await client[testMethod.name + 'Async'](testMethod.params);
          console.log(`   ✅ Метод выполнен успешно`);
          
          // Парсим результат
          if (result && result[0]) {
            const data = result[0];
            console.log(`   📊 Результат:`, JSON.stringify(data, null, 2).substring(0, 400) + '...');
            
            // Анализируем структуру данных
            if (data.return) {
              try {
                const parsedData = JSON.parse(data.return);
                console.log(`   🔍 Парсинг JSON:`, typeof parsedData, Array.isArray(parsedData) ? `(${parsedData.length} элементов)` : '');
              } catch (e) {
                console.log(`   📝 Возвращена строка длиной:`, data.return.length);
              }
            }
          } else {
            console.log(`   📊 Результат:`, result);
          }
          
        } catch (error) {
          console.log(`   ❌ Ошибка выполнения:`, error.message);
          
          // Анализируем ошибку
          if (error.message.includes('401')) {
            console.log(`   🔐 Проблема с аутентификацией`);
          } else if (error.message.includes('400')) {
            console.log(`   📝 Неверные параметры запроса`);
          } else if (error.message.includes('500')) {
            console.log(`   🖥️ Внутренняя ошибка сервера`);
          }
        }
      } else {
        console.log(`\n⚠️ Метод ${testMethod.name} не найден`);
      }
    }

    console.log('');
    console.log('🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error('📋 Детали:', error);
  }
}

// Запускаем тест
testGdsApi().catch(console.error);
