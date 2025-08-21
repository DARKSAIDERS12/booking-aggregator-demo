#!/usr/bin/env node

/**
 * Скрипт для тестирования GDS API 1
 * Запуск: node test-gds-api.js
 */

const soap = require('soap');

// Конфигурация тестового GDS API
const config = {
  url: 'https://cluster.avtovokzal.ru/gdstest/soap/json',
  username: 'sakhbus',
  password: 'Zxvghh4567!'
};

async function testGdsApi() {
  console.log('🚀 Тестирование GDS API 1...');
  console.log('📍 URL:', config.url);
  console.log('👤 Пользователь:', config.username);
  console.log('🔑 Пароль:', config.password ? '***' : 'не указан');
  console.log('');

  try {
    // Создаем SOAP клиент
    console.log('🔌 Создание SOAP клиента...');
    const client = await soap.createClientAsync(config.url);
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
    
    const keyMethods = [
      'getDispatchPoints',    // Получение станций отправления
      'getArrivalPoints',     // Получение станций назначения
      'getRaces',            // Поиск рейсов
      'getRace',             // Информация о рейсе
      'getVersion'           // Версия API
    ];
    
    for (const method of keyMethods) {
      if (methods.includes(method)) {
        try {
          console.log(`\n🔍 Тестирование метода: ${method}`);
          
          // Получаем информацию о методе
          const methodInfo = description[method];
          console.log(`   Входные параметры:`, Object.keys(methodInfo.input || {}));
          
          // Пытаемся вызвать метод с пустыми параметрами
          const result = await client[method + 'Async']({});
          console.log(`   ✅ Метод выполнен успешно`);
          console.log(`   📊 Результат:`, JSON.stringify(result, null, 2).substring(0, 300) + '...');
          
        } catch (error) {
          console.log(`   ❌ Ошибка выполнения:`, error.message);
        }
      } else {
        console.log(`\n⚠️ Метод ${method} не найден`);
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
