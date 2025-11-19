import { Response, Request } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import productRepository from '../repositories/product.repository';
import { CreateProductDto, UpdateProductDto } from '../models/product.model';

export class ProductController {
  async getProductsByEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const products = await productRepository.findByEventId(eventId);
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  async getAllProductsByEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const products = await productRepository.findAllByEventId(eventId);
      res.json(products);
    } catch (error) {
      console.error('Error getting all products:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const product = await productRepository.findById(productId);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productData: CreateProductDto = req.body;
      const product = await productRepository.create(productData);

      if (!product) {
        res.status(500).json({ error: 'Erro ao criar produto' });
        return;
      }

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const productData: UpdateProductDto = req.body;
      const product = await productRepository.update(productId, productData);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const success = await productRepository.delete(productId);

      if (!success) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}

export default new ProductController();
