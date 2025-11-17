import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import carRepository from '../repositories/car.repository';
import { CreateCarDto, UpdateCarDto } from '../models/car.model';

export class CarController {
  async getMyCars(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const cars = await carRepository.findByUserId(userId);
      res.json(cars);
    } catch (error) {
      console.error('Error getting cars:', error);
      res.status(500).json({ error: 'Erro ao buscar carros' });
    }
  }

  async getCarsByEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, eventId } = req.query;

      if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'Email é obrigatório' });
        return;
      }

      if (!eventId || typeof eventId !== 'string') {
        res.status(400).json({ error: 'EventId é obrigatório' });
        return;
      }

      const cars = await carRepository.findByUserEmailAndEvent(email, parseInt(eventId));
      res.json(cars);
    } catch (error) {
      console.error('Error getting cars by email:', error);
      res.status(500).json({ error: 'Erro ao buscar carros' });
    }
  }

  async createCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const carData: CreateCarDto = req.body;
      const car = await carRepository.create(userId, carData);

      if (!car) {
        res.status(500).json({ error: 'Erro ao criar carro' });
        return;
      }

      res.status(201).json(car);
    } catch (error) {
      console.error('Error creating car:', error);
      res.status(500).json({ error: 'Erro ao criar carro' });
    }
  }

  async updateCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const carId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const carData: UpdateCarDto = req.body;
      const car = await carRepository.update(carId, userId, carData);

      if (!car) {
        res.status(404).json({ error: 'Carro não encontrado' });
        return;
      }

      res.json(car);
    } catch (error) {
      console.error('Error updating car:', error);
      res.status(500).json({ error: 'Erro ao atualizar carro' });
    }
  }

  async deleteCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const carId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const success = await carRepository.delete(carId, userId);

      if (!success) {
        res.status(404).json({ error: 'Carro não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting car:', error);
      res.status(500).json({ error: 'Erro ao deletar carro' });
    }
  }
}

export default new CarController();
