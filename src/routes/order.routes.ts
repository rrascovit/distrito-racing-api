import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Validações
const createOrderValidation = [
  body('car').notEmpty().withMessage('Carro é obrigatório'),
  body('carClass').notEmpty().withMessage('Classe do carro é obrigatória'),
  body('number').optional({ nullable: true }).isInt().withMessage('Número deve ser um inteiro quando fornecido'),
  body('days').isArray().withMessage('Dias é obrigatório'),
  body('paymentMethod').notEmpty().withMessage('Método de pagamento é obrigatório'),
  body('eventId').isInt().withMessage('ID do evento é obrigatório'),
  body('isFirstDriver').isBoolean().withMessage('Indicação de primeiro piloto é obrigatória'),
  body('productIds').isArray().withMessage('IDs dos produtos são obrigatórios'),
  body('productIds.*').isInt().withMessage('IDs dos produtos devem ser números'),
];

// Rotas protegidas
router.get('/', authenticate, orderController.getMyOrders.bind(orderController));
router.get('/check-registration', authenticate, orderController.checkFirstDriverRegistration.bind(orderController));
router.get('/check-number', authenticate, orderController.checkCarNumberAvailability.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.post(
  '/',
  authenticate,
  createOrderValidation,
  handleValidationErrors,
  orderController.createOrder.bind(orderController),
);
router.put(
  '/:id/payment',
  authenticate,
  body('isPaid').isBoolean().withMessage('Status de pagamento é obrigatório'),
  handleValidationErrors,
  orderController.updatePaymentStatus.bind(orderController),
);

export default router;
