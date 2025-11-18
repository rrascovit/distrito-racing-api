import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import profileRepository from '../repositories/profile.repository';

/**
 * Middleware para verificar se o usuário autenticado é admin
 * DEVE ser usado APÓS o middleware authenticate
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user || !req.user.uid) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    // Buscar perfil do usuário no banco
    const profile = await profileRepository.findByUserId(req.user.uid);

    if (!profile) {
      res.status(403).json({ error: 'Perfil não encontrado' });
      return;
    }

    // Verificar se o usuário é admin
    if (profile.role !== 'admin') {
      res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
      });
      return;
    }

    // Usuário é admin - prosseguir
    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de admin:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};
