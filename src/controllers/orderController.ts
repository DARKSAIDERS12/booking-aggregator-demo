import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';

class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
        
        // Привязываем методы к экземпляру для сохранения контекста this
        this.registerOrder = this.registerOrder.bind(this);
        this.payOrder = this.payOrder.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
        this.getOrderInfo = this.getOrderInfo.bind(this);
        this.getAllOrders = this.getAllOrders.bind(this);
    }

    // Регистрация/бронирование билетов
    async registerOrder(req: Request, res: Response) {
        try {
            const {
                customer_name,
                customer_phone,
                customer_email,
                route_id,
                total_amount,
                currency,
                passengers
            } = req.body;

            if (!customer_name || !route_id || !total_amount || !currency || !passengers) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать: customer_name, route_id, total_amount, currency, passengers'
                });
            }

            const order = await this.orderService.registerOrder({
                customer_name,
                customer_phone,
                customer_email,
                route_id,
                total_amount,
                currency,
                passengers
            });

            res.json({
                success: true,
                data: order,
                message: 'Заказ успешно зарегистрирован'
            });
        } catch (error) {
            console.error('Ошибка регистрации заказа:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка регистрации заказа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Оплата забронированного заказа
    async payOrder(req: Request, res: Response) {
        try {
            const { order_id, payment_method, amount } = req.body;

            if (!order_id || !payment_method || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать: order_id, payment_method, amount'
                });
            }

            const payment = await this.orderService.payOrder({
                order_id,
                payment_method,
                amount
            });

            res.json({
                success: true,
                data: payment,
                message: 'Заказ успешно оплачен'
            });
        } catch (error) {
            console.error('Ошибка оплаты заказа:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка оплаты заказа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Отмена билетов
    async cancelOrder(req: Request, res: Response) {
        try {
            const { order_id, reason, refund_amount } = req.body;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать order_id'
                });
            }

            const cancellation = await this.orderService.cancelOrder({
                order_id,
                reason,
                refund_amount
            });

            res.json({
                success: true,
                data: cancellation,
                message: 'Заказ успешно отменен'
            });
        } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка отмены заказа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение информации о заказе
    async getOrderInfo(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать ID заказа'
                });
            }

            const orderInfo = await this.orderService.getOrderInfo(id);

            if (!orderInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Заказ не найден'
                });
            }

            res.json({
                success: true,
                data: orderInfo
            });
        } catch (error) {
            console.error('Ошибка получения информации о заказе:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения информации о заказе',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }

    // Получение всех заказов
    async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await this.orderService.getAllOrders();

            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error('Ошибка получения информации о заказе:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения информации о заказе',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }
}

export const orderController = new OrderController();
