import { supabase } from '../config/supabase';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

export class ProductRepository {
  private tableName = 'products';

  async findByEventId(eventId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('eventId', eventId)
      .order('tier', { ascending: true });

    if (error) {
      console.error('Error finding products:', error);
      return [];
    }

    // Filter products by availability (startDate and finalDate)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const availableProducts = (data as Product[]).filter(product => {
      // If product has no date restrictions, it's always available
      if (!product.startDate || !product.finalDate) {
        return true;
      }

      // Check if today is within the product's sales period
      // Using string comparison to avoid timezone issues
      return today >= product.startDate && today <= product.finalDate;
    });

    return availableProducts;
  }

  async findById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding product:', error);
      return null;
    }

    return data as Product;
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error finding products by ids:', error);
      return [];
    }

    return data as Product[];
  }

  async create(productData: CreateProductDto): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Erro ao criar produto');
    }

    return data as Product;
  }

  async update(id: number, productData: UpdateProductDto): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Erro ao atualizar produto');
    }

    return data as Product;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  }
}

export default new ProductRepository();
