import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import orderService from '../services/order.service';
import { CreateOrderDto } from '../models/order.model';

export class OrderController {
  async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const orders = await orderService.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const orderId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const order = await orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  }

  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const orderData: CreateOrderDto = req.body;
      const order = await orderService.createOrder(userId, orderData);

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao criar pedido' });
    }
  }

  async updatePaymentStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const orderId = parseInt(req.params.id);
      const { isPaid } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const order = await orderService.updatePaymentStatus(orderId, userId, isPaid);

      if (!order) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao atualizar status de pagamento' });
    }
  }

  async checkFirstDriverRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId, email } = req.query;

      if (!eventId || !email) {
        res.status(400).json({ error: 'EventId e email são obrigatórios' });
        return;
      }

      const result = await orderService.checkFirstDriverRegistration(
        parseInt(eventId as string),
        email as string
      );

      res.json(result);
    } catch (error) {
      console.error('Error checking first driver registration:', error);
      res.status(500).json({ error: 'Erro ao verificar inscrição do primeiro piloto' });
    }
  }

  async checkCarNumberAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId, number } = req.query;

      if (!eventId || !number) {
        res.status(400).json({ error: 'EventId e number são obrigatórios' });
        return;
      }

      console.log('Checking car number:', { eventId, number });

      const isAvailable = await orderService.checkCarNumberAvailability(
        parseInt(eventId as string),
        parseInt(number as string)
      );

      console.log('Car number availability result:', { eventId, number, isAvailable });

      res.json({ isAvailable });
    } catch (error) {
      console.error('Error checking car number availability:', error);
      res.status(500).json({ error: 'Erro ao verificar disponibilidade do número' });
    }
  }

  async getEventRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'ID do evento inválido' });
        return;
      }

      const registrations = await orderService.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      console.error('Error getting event registrations:', error);
      res.status(500).json({ error: 'Erro ao buscar inscrições do evento' });
    }
  }
}

export default new OrderController();
