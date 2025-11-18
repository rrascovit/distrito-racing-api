import { Response, Request } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import eventRepository from '../repositories/event.repository';
import orderRepository from '../repositories/order.repository';
import { CreateEventDto, UpdateEventDto } from '../models/event.model';

export class EventController {
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventRepository.findAll();
      res.json(events);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
  }

  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventRepository.findUpcoming();
      res.json(events);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
  }

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      const event = await eventRepository.findById(eventId);

      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.json(event);
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({ error: 'Erro ao buscar evento' });
    }
  }

  async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventData: CreateEventDto = req.body;
      const event = await eventRepository.create(eventData);

      if (!event) {
        res.status(500).json({ error: 'Erro ao criar evento' });
        return;
      }

      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Erro ao criar evento' });
    }
  }

  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      const eventData: UpdateEventDto = req.body;
      const event = await eventRepository.update(eventId, eventData);

      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      const success = await eventRepository.delete(eventId);

      if (!success) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Erro ao deletar evento' });
    }
  }

  // Admin: Listar inscritos de um evento
  async getEventRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      
      // Verificar se o evento existe
      const event = await eventRepository.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Buscar todas as inscrições (orders) do evento
      const registrations = await orderRepository.findByEventId(eventId);
      
      res.json({
        event: {
          id: event.id,
          title: event.title,
          subtitle: event.subtitle,
        },
        totalRegistrations: registrations.length,
        registrations: registrations.map(order => ({
          id: order.id,
          createdAt: order.created_at,
          isPaid: order.isPaid,
          paymentMethod: order.paymentMethod,
          car: order.car,
          carClass: order.carClass,
          number: order.number,
          days: order.days,
          isFirstDriver: order.isFirstDriver,
          firstDriverName: order.firstDriverName,
          driver: order.profile ? {
            name: order.profile.name,
            email: order.profile.email,
            phone: order.profile.phone,
            cpf: order.profile.cpf,
          } : null,
        })),
      });
    } catch (error) {
      console.error('Error getting event registrations:', error);
      res.status(500).json({ error: 'Erro ao buscar inscritos' });
    }
  }
}

export default new EventController();
