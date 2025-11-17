import { supabase } from '../config/supabase';
import { Car, CreateCarDto, UpdateCarDto } from '../models/car.model';

export class CarRepository {
  private tableName = 'cars';

  async findByUserId(userId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error finding cars:', error);
      return [];
    }

    return data as Car[];
  }

  async findByUserEmailAndEvent(email: string, eventId: number): Promise<Car[]> {
    // Primeiro, buscar o userId do profile pelo email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('userId')
      .eq('email', email)
      .single();

    if (profileError || !profileData) {
      console.error('Error finding profile by email:', profileError);
      return [];
    }

    // Buscar orders do primeiro piloto para este evento
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('car')
      .eq('userId', profileData.userId)
      .eq('eventId', eventId)
      .not('car', 'is', null);

    if (ordersError || !ordersData || ordersData.length === 0) {
      console.error('Error finding orders:', ordersError);
      return [];
    }

    // Extrair strings únicas de carros (formato: "Marca Modelo")
    const carStrings = [...new Set(ordersData.map(order => order.car).filter(car => car !== null))] as string[];

    if (carStrings.length === 0) {
      return [];
    }

    // Buscar todos os carros do usuário
    const { data: allCarsData, error: allCarsError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', profileData.userId);

    if (allCarsError || !allCarsData) {
      console.error('Error finding cars:', allCarsError);
      return [];
    }

    // Filtrar apenas os carros que correspondem às strings encontradas nas orders
    const matchingCars = allCarsData.filter(car => {
      const carString = `${car.brand} ${car.model}`;
      return carStrings.includes(carString);
    });

    return matchingCars as Car[];
  }

  async findById(id: number): Promise<Car | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding car:', error);
      return null;
    }

    return data as Car;
  }

  async create(userId: string, carData: CreateCarDto): Promise<Car | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        userId,
        ...carData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating car:', error);
      throw new Error('Erro ao criar carro');
    }

    return data as Car;
  }

  async update(id: number, userId: string, carData: UpdateCarDto): Promise<Car | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(carData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating car:', error);
      throw new Error('Erro ao atualizar carro');
    }

    return data as Car;
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('userId', userId);

    if (error) {
      console.error('Error deleting car:', error);
      return false;
    }

    return true;
  }
}

export default new CarRepository();
