import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.get('/', authenticate, addressController.getMyAddresses.bind(addressController));
router.get('/:id', authenticate, addressController.getAddressById.bind(addressController));
router.post('/', authenticate, addressController.createAddress.bind(addressController));
router.put('/:id', authenticate, addressController.updateAddress.bind(addressController));
router.delete('/:id', authenticate, addressController.deleteAddress.bind(addressController));

export default router;
