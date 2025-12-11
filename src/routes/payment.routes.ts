import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/orders/:id/payment
 * @desc Criar checkout do Mercado Pago para um pedido
 * @access Private
 */
router.post('/orders/:id/payment', authenticate, (req, res, next) =>
  paymentController.createCheckout(req, res, next)
);

/**
 * @route GET /api/payment/status/:orderId
 * @desc Verificar status de pagamento de um pedido
 * @access Private
 */
router.get('/payment/status/:orderId', authenticate, (req, res, next) =>
  paymentController.getPaymentStatus(req, res, next)
);

/**
 * @route POST /api/payment/webhooks/mercadopago
 * @desc Receber notificações de pagamento do Mercado Pago
 * @access Public (Mercado Pago)
 */
router.post('/payment/webhooks/mercadopago', (req, res) =>
  paymentController.handleWebhook(req, res)
);

export default router;
