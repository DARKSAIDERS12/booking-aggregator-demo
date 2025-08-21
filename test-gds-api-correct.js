#!/usr/bin/env node

const soap = require('soap');

const config = {
  wsdlFile: './gds-api.wsdl',
  url: 'https://cluster.avtovokzal.ru/gdstest/soap/json',
  username: 'sakhbus',
  password: 'Zxvghh4567!'
};

async function testGdsApi() {
  console.log('🚀 Тест GDS API...');
  
  try {
    const client = await soap.createClientAsync(config.wsdlFile);
    client.setSecurity(new soap.BasicAuthSecurity(config.username, config.password));
    
    console.log('✅ Клиент создан');
    
    // Тестируем методы
    const methods = ['getVersion', 'getCountries', 'echo'];
    
    for (const method of methods) {
      try {
        console.log(`\n🔍 ${method}:`);
        const params = method === 'echo' ? { message: 'test' } : {};
        const result = await client[method + 'Async'](params);
        console.log(`✅ Успех:`, result[0]?.return || result);
      } catch (error) {
        console.log(`❌ Ошибка:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testGdsApi();
