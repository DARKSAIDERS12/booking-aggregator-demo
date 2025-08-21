import StrapiService from './strapiService';

export interface Passenger {
    first_name: string;
    last_name: string;
    middle_name?: string;
    document_type: 'passport' | 'id_card' | 'birth_certificate';
    document_number: string;
    seat_number?: string;
    price: number;
}

export interface OrderRegistration {
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    route_id: string;
    total_amount: number;
    currency: string;
    passengers: Passenger[];
}

export interface Order {
    id: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    route_id: string;
    total_amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'cancelled' | 'completed';
    passengers: Passenger[];
    created_at: string;
    updated_at: string;
}

export interface Payment {
    order_id: string;
    payment_method: 'card' | 'cash' | 'transfer';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    transaction_id?: string;
    payment_date: string;
}

export interface Cancellation {
    order_id: string;
    reason?: string;
    refund_amount: number;
    cancellation_date: string;
    status: 'pending' | 'completed' | 'failed';
}

export class OrderService {
    private strapiService: StrapiService;

    constructor() {
        this.strapiService = new StrapiService();
    }

    // Регистрация заказа
    async registerOrder(orderData: OrderRegistration): Promise<Order> {
        try {
            // Создаем заказ в Strapi
            const order = await this.strapiService.createOrder({
                customer_name: orderData.customer_name,
                customer_phone: orderData.customer_phone,
                customer_email: orderData.customer_email,
                total_amount: orderData.total_amount,
                currency: orderData.currency as 'RUB' | 'KZT' | 'USD',
                status: 'pending'
            });

            console.log(`Заказ ${order.id} успешно создан`);
            return order as any;

        } catch (error) {
            console.error('Ошибка регистрации заказа:', error);
            throw error;
        }
    }

    // Оплата заказа
    async payOrder(paymentData: { order_id: string; payment_method: string; amount: number }): Promise<Payment> {
        try {
            // Получаем информацию о заказе
            const order = await this.getOrderInfo(paymentData.order_id);
            if (!order) {
                throw new Error('Заказ не найден');
            }

            if (order.status !== 'pending') {
                throw new Error('Заказ не может быть оплачен в текущем статусе');
            }

            // Создаем запись об оплате
            const payment: Payment = {
                order_id: paymentData.order_id,
                payment_method: paymentData.payment_method as 'card' | 'cash' | 'transfer',
                amount: paymentData.amount,
                currency: order.currency,
                status: 'completed',
                transaction_id: `TXN_${Date.now()}`,
                payment_date: new Date().toISOString()
            };

            // Обновляем статус заказа
            await this.strapiService.updateOrder(paymentData.order_id, {
                status: 'paid'
            });

            console.log(`Заказ ${paymentData.order_id} успешно оплачен`);
            return payment;

        } catch (error) {
            console.error('Ошибка оплаты заказа:', error);
            throw error;
        }
    }

    // Отмена заказа
    async cancelOrder(cancellationData: { order_id: string; reason?: string; refund_amount?: number }): Promise<Cancellation> {
        try {
            // Получаем информацию о заказе
            const order = await this.getOrderInfo(cancellationData.order_id);
            if (!order) {
                throw new Error('Заказ не найден');
            }

            if (order.status === 'cancelled') {
                throw new Error('Заказ уже отменен');
            }

            if (order.status === 'completed') {
                throw new Error('Завершенный заказ не может быть отменен');
            }

            const refundAmount = cancellationData.refund_amount || order.total_amount;

            // Создаем запись об отмене
            const cancellation: Cancellation = {
                order_id: cancellationData.order_id,
                reason: cancellationData.reason,
                refund_amount: refundAmount,
                cancellation_date: new Date().toISOString(),
                status: 'completed'
            };

            // Обновляем статус заказа
            await this.strapiService.updateOrder(cancellationData.order_id, {
                status: 'canceled'
            });

            console.log(`Заказ ${cancellationData.order_id} успешно отменен`);
            return cancellation;

        } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            throw error;
        }
    }

    // Получение информации о заказе
    async getOrderInfo(orderId: string): Promise<Order | null> {
        try {
            const order = await this.strapiService.getOrder(orderId);
            return order as any;
        } catch (error) {
            console.error('Ошибка получения информации о заказе:', error);
            return null;
        }
    }

    // Получение всех заказов
    async getAllOrders(): Promise<Order[]> {
        try {
            const orders = await this.strapiService.getOrders();
            return orders as any;
        } catch (error) {
            console.error('Ошибка получения всех заказов:', error);
            return [];
        }
    }
}
