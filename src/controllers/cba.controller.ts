import { Request, Response } from 'express';
import { cbaService } from '../services/cba.service';
import { ACCEPTED_CBA_CATEGORIES } from '../models/cba.model';

export class CBAController {
  /**
   * Verifica a filiação de um piloto na CBA
   * GET /cba/verify/:cpf
   * Query params: ?ano=2026 (opcional, default: ano atual)
   */
  async verifyPilot(req: Request, res: Response): Promise<void> {
    try {
      const { cpf } = req.params;
      const ano = req.query.ano ? parseInt(req.query.ano as string) : undefined;

      if (!cpf) {
        res.status(400).json({ 
          success: false, 
          error: 'CPF é obrigatório' 
        });
        return;
      }

      // Limpar CPF
      const cleanCpf = cpf.replace(/\D/g, '');
      
      if (cleanCpf.length !== 11) {
        res.status(400).json({ 
          success: false, 
          error: 'CPF deve ter 11 dígitos' 
        });
        return;
      }

      const result = await cbaService.verifyPilot(cleanCpf, ano);

      res.json({
        success: true,
        data: result,
        acceptedCategories: ACCEPTED_CBA_CATEGORIES
      });
    } catch (error) {
      console.error('[CBA Controller] Erro:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao verificar filiação CBA' 
      });
    }
  }

  /**
   * Retorna as categorias aceitas para eventos
   * GET /cba/categories
   */
  getAcceptedCategories(req: Request, res: Response): void {
    res.json({
      success: true,
      categories: ACCEPTED_CBA_CATEGORIES,
      description: {
        'PTD': 'Piloto de Track Day',
        'PC': 'Piloto de Competição',
        'PGC-B': 'Piloto Graduado de Competição "B"',
        'PGC-A': 'Piloto Graduado de Competição "A"'
      }
    });
  }
}

export const cbaController = new CBAController();
