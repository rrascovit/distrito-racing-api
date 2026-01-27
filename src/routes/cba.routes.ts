import { Router } from 'express';
import { cbaController } from '../controllers/cba.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas CBA requerem autenticação
router.use(authenticate);

/**
 * GET /cba/categories
 * Retorna as categorias aceitas para eventos
 */
router.get('/categories', (req, res) => cbaController.getAcceptedCategories(req, res));

/**
 * GET /cba/verify/:cpf
 * Verifica a filiação de um piloto na CBA
 * Query params: ?ano=2026 (opcional)
 */
router.get('/verify/:cpf', (req, res) => cbaController.verifyPilot(req, res));

export default router;
