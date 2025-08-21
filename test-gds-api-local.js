#!/usr/bin/env node

/**
 * Тестовый скрипт для GDS API 1 с локальным WSDL
 * Запуск: node test-gds-api-local.js
 */

const soap = require('soap');
const fs = require('fs');
const path = require('path');

// Конфигурация тестового GDS API
const config = {
  wsdlFile: './gds-api.wsdl',
  url: 'https://cluster.avtovokzal.ru/gdstest/soap/json',
  username: 'sakhbus',
  password: 'Zxvghh4567!'
};

async function testGdsApi() {
  console.log('🚀 Тестирование GDS API 1 (локальный WSDL)...');
  console.log('📁 WSDL файл:', config.wsdlFile);
  console.log('📍 URL:', config.url);
  console.log('👤 Пользователь:', config.username);
  console.log('🔑 Пароль:', config.password ? '***' : 'не указан');
  console.log('');

  // Проверяем наличие WSDL файла
  if (!fs.existsSync(config.wsdlFile)) {
    console.error('❌ WSDL файл не найден:', config.wsdlFile);
    console.log('💡 Сначала скачайте WSDL: curl -u "sakhbus:Zxvghh4567!" "https://cluster.avtovokzal.ru/gdstest/soap/json?wsdl" > gds-api.wsdl');
    return;
  }

  try {
    // Создаем SOAP клиент из локального WSDL
    console.log('🔌 Создание SOAP клиента из локального WSDL...');
    const wsdlContent = fs.readFileSync(config.wsdlFile, 'utf8');
    const client = await soap.createClientAsync(config.wsdlFile);
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

    // Тестируем простые методы
    console.log('');
    console.log('🧪 Тестирование простых методов...');
    
    const simpleMethods = [
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
        name: 'echo',
        params: { message: 'Hello GDS API!' },
        description: 'Тестовый метод echo'
      }
    ];
    
    for (const testMethod of simpleMethods) {
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
                if (data.return.length < 100) {
                  console.log(`   📄 Содержимое:`, data.return);
                }
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
