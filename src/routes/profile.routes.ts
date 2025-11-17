import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rotas protegidas - requerem autenticação
router.post('/me', authenticate, profileController.createProfile.bind(profileController));
router.get('/me', authenticate, profileController.getMyProfile.bind(profileController));
router.put('/me', authenticate, profileController.updateMyProfile.bind(profileController));
router.get('/:id', authenticate, profileController.getProfileById.bind(profileController));

export default router;
