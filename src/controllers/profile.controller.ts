import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import profileRepository from '../repositories/profile.repository';
import { CreateProfileDto, UpdateProfileDto } from '../models/profile.model';

export class ProfileController {
  async createProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const profileData: CreateProfileDto = req.body;

      // Validar campos obrigatórios
      if (!profileData.userId || !profileData.name || !profileData.email) {
        res.status(400).json({ error: 'userId, name e email são obrigatórios' });
        return;
      }

      // Verificar se userId do body corresponde ao usuário autenticado
      if (profileData.userId !== userId) {
        res.status(403).json({ error: 'Não autorizado a criar perfil para outro usuário' });
        return;
      }

      // Verificar se perfil já existe
      const existingProfile = await profileRepository.findByUserId(userId);
      if (existingProfile) {
        res.status(409).json({ error: 'Perfil já existe para este usuário' });
        return;
      }

      // Criar perfil com valores padrão
      const profile = await profileRepository.create({
        ...profileData,
        role: profileData.role || 'user',
        isActive: profileData.isActive !== undefined ? profileData.isActive : true,
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ error: 'Erro ao criar perfil' });
    }
  }

  async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const profile = await profileRepository.findByUserId(userId);

      if (!profile) {
        res.status(404).json({ error: 'Perfil não encontrado' });
        return;
      }

      res.json(profile);
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  async updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const updateData: UpdateProfileDto = req.body;

      // Verificar se perfil existe
      const profile = await profileRepository.findByUserId(userId);

      if (!profile) {
        res.status(404).json({ error: 'Perfil não encontrado' });
        return;
      }

      // Atualizar perfil
      const updatedProfile = await profileRepository.update(profile.id, updateData);

      if (!updatedProfile) {
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
        return;
      }

      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  async getProfileById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const profile = await profileRepository.findById(id);

      if (!profile) {
        res.status(404).json({ error: 'Perfil não encontrado' });
        return;
      }

      res.json(profile);
    } catch (error) {
      console.error('Error getting profile by id:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }
}

export default new ProfileController();
