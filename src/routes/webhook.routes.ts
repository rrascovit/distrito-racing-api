import { Router, Request, Response } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

/**
 * POST /webhooks/mercadopago
 * Recebe notificações do Mercado Pago
 * NÃO requer autenticação (é chamado pelo Mercado Pago)
 */
router.post(
  '/mercadopago',
  (req: Request, res: Response) => paymentController.handleWebhook(req, res)
);

export default router;
