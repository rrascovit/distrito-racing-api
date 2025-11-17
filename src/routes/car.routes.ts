import { Router } from 'express';
import carController from '../controllers/car.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Validações
const createCarValidation = [
  body('brand').notEmpty().withMessage('Marca é obrigatória'),
  body('model').notEmpty().withMessage('Modelo é obrigatório'),
  body('carClass').optional().isString(),
  body('version').optional().isString(),
];

// Rotas protegidas
router.get('/', authenticate, carController.getMyCars.bind(carController));
router.get('/by-email', authenticate, carController.getCarsByEmail.bind(carController));
router.post(
  '/',
  authenticate,
  createCarValidation,
  handleValidationErrors,
  carController.createCar.bind(carController),
);
router.put('/:id', authenticate, carController.updateCar.bind(carController));
router.delete('/:id', authenticate, carController.deleteCar.bind(carController));

export default router;
