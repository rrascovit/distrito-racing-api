import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import paymentService from '../services/payment.service';
import orderRepository from '../repositories/order.repository';
import { AppError } from '../utils/errors';

export class PaymentController {
  /**
   * POST /api/orders/:id/payment
   * Cria checkout do Mercado Pago para um pedido
   */
  async createCheckout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user?.uid;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Buscar pedido com detalhes completos
      const order = await orderRepository.findByIdDetailed(orderId, userId);

      if (!order) {
        throw new AppError('Pedido não encontrado', 404);
      }

      // Verificar se já está pago
      if (order.isPaid) {
        throw new AppError('Pedido já está pago', 400);
      }

      // Criar checkout no Mercado Pago
      const checkout = await paymentService.createCheckout(order);

      res.json({
        success: true,
        data: checkout,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/webhooks/mercadopago
   * Recebe notificações de pagamento do Mercado Pago
   */
  async handleWebhook(req: AuthRequest, res: Response) {
    try {
      const { type, data } = req.body;

      console.log('Mercado Pago webhook received:', { type, data });

      // Responder imediatamente (Mercado Pago requer resposta rápida)
      res.status(200).json({ success: true });

      // Processar notificação de forma assíncrona
      if (type === 'payment') {
        const paymentId = data?.id;

        if (!paymentId) {
          console.error('Payment ID not found in webhook');
          return;
        }

        // Buscar detalhes do pagamento
        const payment = await paymentService.getPaymentDetails(paymentId.toString());

        // Extrair order_id da referência externa
        const externalReference = payment.external_reference; // "ORDER_123"
        const orderId = externalReference?.replace('ORDER_', '');

        if (!orderId) {
          console.error('Order ID not found in payment reference:', externalReference);
          return;
        }

        // Buscar pedido para obter userId
        const order = await orderRepository.findById(parseInt(orderId));

        if (!order) {
          console.error('Order not found:', orderId);
          return;
        }

        // Verificar se já está pago (idempotência - evitar processamento duplicado)
        if (order.isPaid) {
          console.log('Order already paid, skipping webhook:', orderId);
          return;
        }

        // Atualizar status do pedido
        const isPaid = paymentService.mapPaymentStatus(payment.status || '');
        const paymentMethod = paymentService.mapPaymentMethod(payment.payment_type_id || '');

        await orderRepository.update(parseInt(orderId), order.userId, {
          isPaid,
          paymentMethod,
        });

        console.log('Order updated:', {
          orderId,
          isPaid,
          paymentMethod,
          mpStatus: payment.status,
        });
      }
    } catch (error) {
      // Não chamar next(error) aqui pois já respondemos ao MP
      console.error('Error processing webhook:', error);
    }
  }

  /**
   * GET /api/payment/status/:orderId
   * Verifica status de pagamento de um pedido
   */
  async getPaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user?.uid;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const order = await orderRepository.findByIdDetailed(orderId, userId);

      if (!order) {
        throw new AppError('Pedido não encontrado', 404);
      }

      res.json({
        success: true,
        data: {
          orderId: order.id,
          isPaid: order.isPaid,
          paymentMethod: order.paymentMethod,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
