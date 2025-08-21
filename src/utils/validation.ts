export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface OrderValidationData {
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  status?: string;
  total_amount?: number;
  currency?: string;
  route?: number;
}

// Валидация данных заказа
export function validateOrderData(data: OrderValidationData): ValidationResult {
  const errors: string[] = [];

  // Проверка обязательных полей
  if (!data.order_number || data.order_number.trim() === '') {
    errors.push('order_number обязателен');
  }

  if (!data.customer_name || data.customer_name.trim() === '') {
    errors.push('customer_name обязателен');
  }

  if (!data.total_amount || data.total_amount <= 0) {
    errors.push('total_amount должен быть больше 0');
  }

  if (!data.currency || !['RUB', 'KZT', 'USD'].includes(data.currency)) {
    errors.push('currency должен быть RUB, KZT или USD');
  }

  if (!data.route || data.route <= 0) {
    errors.push('route обязателен и должен быть больше 0');
  }

  // Проверка статуса
  if (data.status && !['pending', 'paid', 'canceled'].includes(data.status)) {
    errors.push('status должен быть pending, paid или canceled');
  }

  // Проверка email (если указан)
  if (data.customer_email && !isValidEmail(data.customer_email)) {
    errors.push('customer_email имеет неверный формат');
  }

  // Проверка телефона (если указан)
  if (data.customer_phone && !isValidPhone(data.customer_phone)) {
    errors.push('customer_phone имеет неверный формат');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валидация телефона
function isValidPhone(phone: string): boolean {
  // Простая валидация для российских номеров
  const phoneRegex = /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Валидация ID
export function validateId(id: string): boolean {
  const numId = parseInt(id);
  return !isNaN(numId) && numId > 0;
}

// Валидация статуса заказа
export function validateOrderStatus(status: string): boolean {
  return ['pending', 'paid', 'canceled'].includes(status);
}

// Валидация валюты
export function validateCurrency(currency: string): boolean {
  return ['RUB', 'KZT', 'USD'].includes(currency);
}
