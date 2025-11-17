import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Validações
const createProductValidation = [
  body('eventId').isInt().withMessage('ID do evento é obrigatório'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('priceCents').isInt().withMessage('Preço é obrigatório'),
  body('numberDays').optional().isInt(),
  body('quantity').optional().isInt(),
  body('isFirstDriver').optional().isBoolean(),
];

// Rotas públicas ou opcionalmente autenticadas
router.get('/event/:eventId', optionalAuthenticate, productController.getProductsByEvent.bind(productController));
router.get('/:id', optionalAuthenticate, productController.getProductById.bind(productController));

// Rotas protegidas (admin)
router.post(
  '/',
  authenticate,
  createProductValidation,
  handleValidationErrors,
  productController.createProduct.bind(productController),
);
router.put('/:id', authenticate, productController.updateProduct.bind(productController));
router.delete('/:id', authenticate, productController.deleteProduct.bind(productController));

export default router;
