import { supabase } from '../config/supabase';
import { Address, CreateAddressDto, UpdateAddressDto } from '../models/address.model';

export class AddressRepository {
  private tableName = 'address';

  async findById(id: string): Promise<Address | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding address:', error);
      return null;
    }

    return data as Address;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error finding addresses by userId:', error);
      return [];
    }

    return data as Address[];
  }

  async create(userId: string, addressData: CreateAddressDto): Promise<Address | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        userId,
        ...addressData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw new Error('Erro ao criar endereço');
    }

    return data as Address;
  }

  async update(id: string, userId: string, addressData: UpdateAddressDto): Promise<Address | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(addressData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      throw new Error('Erro ao atualizar endereço');
    }

    return data as Address;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('userId', userId);

    if (error) {
      console.error('Error deleting address:', error);
      return false;
    }

    return true;
  }
}

export default new AddressRepository();
