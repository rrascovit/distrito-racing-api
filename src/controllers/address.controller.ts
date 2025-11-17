import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import addressRepository from '../repositories/address.repository';
import { CreateAddressDto, UpdateAddressDto } from '../models/address.model';

export class AddressController {
  async getMyAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const addresses = await addressRepository.findByUserId(userId);
      res.json(addresses);
    } catch (error) {
      console.error('Error getting addresses:', error);
      res.status(500).json({ error: 'Erro ao buscar endereços' });
    }
  }

  async getAddressById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const address = await addressRepository.findById(id);

      if (!address) {
        res.status(404).json({ error: 'Endereço não encontrado' });
        return;
      }

      // Verificar se o endereço pertence ao usuário
      if (address.userId !== userId) {
        res.status(403).json({ error: 'Acesso não autorizado' });
        return;
      }

      res.json(address);
    } catch (error) {
      console.error('Error getting address:', error);
      res.status(500).json({ error: 'Erro ao buscar endereço' });
    }
  }

  async createAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const addressData: CreateAddressDto = req.body;
      const address = await addressRepository.create(userId, addressData);

      if (!address) {
        res.status(500).json({ error: 'Erro ao criar endereço' });
        return;
      }

      res.status(201).json(address);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ error: 'Erro ao criar endereço' });
    }
  }

  async updateAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const addressData: UpdateAddressDto = req.body;
      const address = await addressRepository.update(id, userId, addressData);

      if (!address) {
        res.status(404).json({ error: 'Endereço não encontrado' });
        return;
      }

      res.json(address);
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ error: 'Erro ao atualizar endereço' });
    }
  }

  async deleteAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const success = await addressRepository.delete(id, userId);

      if (!success) {
        res.status(404).json({ error: 'Endereço não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ error: 'Erro ao deletar endereço' });
    }
  }
}

export default new AddressController();
