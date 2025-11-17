import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';

const router = Router();

// Validações
const createEventValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('subtitle').optional().isString(),
  body('shortDescription').optional().isString(),
  body('description').optional().isString(),
  body('image').optional().isString(),
  body('membershipRequired').optional().isBoolean(),
  body('registrationPossible').optional().isBoolean(),
];

// Rotas públicas ou opcionalmente autenticadas
router.get('/', optionalAuthenticate, eventController.getAllEvents.bind(eventController));
router.get('/upcoming', optionalAuthenticate, eventController.getUpcomingEvents.bind(eventController));
router.get('/:id', optionalAuthenticate, eventController.getEventById.bind(eventController));

// Rotas protegidas (admin)
router.post(
  '/',
  authenticate,
  createEventValidation,
  handleValidationErrors,
  eventController.createEvent.bind(eventController),
);
router.put('/:id', authenticate, eventController.updateEvent.bind(eventController));
router.delete('/:id', authenticate, eventController.deleteEvent.bind(eventController));

export default router;
