import { Router, Request } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Configuração do multer para armazenar em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileFilter: (_req: Request, file: any, cb: multer.FileFilterCallback) => {
    // Permitir apenas imagens e PDFs
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas imagens (JPEG, PNG, WEBP) ou PDF.'));
    }
  }
});

/**
 * Upload de arquivo
 * POST /api/storage/upload
 */
router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      const folder = req.body.folder || 'imagens';

      if (!file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado' });
        return;
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${timestamp}-${sanitizedName}`;

      // Upload para Supabase Storage
      const { error } = await supabase.storage
        .from('eventos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('eventos')
        .getPublicUrl(filePath);

      res.status(201).json({
        url: publicUrl,
        path: filePath
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao processar upload' 
      });
    }
  }
);

/**
 * Deletar arquivo
 * DELETE /api/storage/delete
 */
router.delete(
  '/delete',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { path } = req.body;

      if (!path) {
        res.status(400).json({ error: 'Caminho do arquivo não informado' });
        return;
      }

      const { error } = await supabase.storage
        .from('eventos')
        .remove([path]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        res.status(500).json({ error: 'Erro ao deletar arquivo' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar arquivo' 
      });
    }
  }
);

export default router;
