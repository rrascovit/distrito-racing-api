import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

/**
 * POST /payments/process
 * Processa um novo pagamento
 * Requer autenticação
 */
router.post(
  '/process',
  authenticate,
  (req: Request, res: Response) => paymentController.processPayment(req as AuthRequest, res)
);

/**
 * GET /payments/status/:orderId
 * Consulta status de pagamento de uma order
 * Requer autenticação
 */
router.get(
  '/status/:orderId',
  authenticate,
  (req: Request, res: Response) => paymentController.getPaymentStatus(req as AuthRequest, res)
);

/**
 * GET /payments/methods
 * Lista métodos de pagamento disponíveis
 * Requer autenticação
 */
router.get(
  '/methods',
  authenticate,
  (req: Request, res: Response) => paymentController.getPaymentMethods(req as AuthRequest, res)
);

export default router;
