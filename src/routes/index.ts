import { Router } from 'express';
import profileRoutes from './profile.routes';
import carRoutes from './car.routes';
import eventRoutes from './event.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';
import storageRoutes from './storage.routes';
import paymentRoutes from './payment.routes';
import webhookRoutes from './webhook.routes';
import cbaRoutes from './cba.routes';

const router = Router();

// Montar todas as rotas
router.use('/profiles', profileRoutes);
router.use('/cars', carRoutes);
router.use('/events', eventRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/storage', storageRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/cba', cbaRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
