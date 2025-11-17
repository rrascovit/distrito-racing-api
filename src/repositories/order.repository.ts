import { supabase } from '../config/supabase';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderProduct,
  CreateOrderProductDto,
} from '../models/order.model';

export class OrderRepository {
  private tableName = 'orders';
  private orderProductsTableName = 'order_products';

  async findByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        event:events(id, title, subtitle, possibleDays)
      `)
      .eq('userId', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error finding orders:', error);
      return [];
    }

    // Transform the data to flatten event info
    interface OrderWithEvent {
      id: number;
      created_at: string;
      userId: string;
      isPaid: boolean;
      car: string;
      carClass: string;
      number: number;
      days: Array<{ date: string; description?: string }>;
      paymentMethod: string;
      firstDriverName?: string;
      eventId: number;
      isFirstDriver: boolean;
      event?: {
        id: number;
        title: string;
        subtitle?: string;
        possibleDays?: Array<{ date: string; description?: string }>;
      } | null;
    }

    const orders = data?.map((order: OrderWithEvent) => ({
      ...order,
      eventName: order.event?.title || 'Evento desconhecido',
      trackName: order.event?.subtitle || '',
      eventDates: order.event?.possibleDays?.map(d => d.date) || [],
    })) || [];

    return orders as Order[];
  }

  async findById(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding order:', error);
      return null;
    }

    return data as Order;
  }

  async findByEventId(eventId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('eventId', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error finding orders by event:', error);
      return [];
    }

    return data as Order[];
  }

  async create(userId: string, orderData: Omit<CreateOrderDto, 'productIds'>): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        userId,
        ...orderData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error('Erro ao criar pedido');
    }

    return data as Order;
  }

  async update(id: number, userId: string, orderData: UpdateOrderDto): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(orderData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw new Error('Erro ao atualizar pedido');
    }

    return data as Order;
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('userId', userId);

    if (error) {
      console.error('Error deleting order:', error);
      return false;
    }

    return true;
  }

  // Order Products methods
  async createOrderProduct(orderProductData: CreateOrderProductDto): Promise<OrderProduct | null> {
    const { data, error } = await supabase
      .from(this.orderProductsTableName)
      .insert(orderProductData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order product:', error);
      throw new Error('Erro ao criar produto do pedido');
    }

    return data as OrderProduct;
  }

  async findOrderProducts(orderId: number): Promise<OrderProduct[]> {
    const { data, error } = await supabase
      .from(this.orderProductsTableName)
      .select('*')
      .eq('orderId', orderId);

    if (error) {
      console.error('Error finding order products:', error);
      return [];
    }

    return data as OrderProduct[];
  }

  async deleteOrderProducts(orderId: number): Promise<boolean> {
    const { error } = await supabase
      .from(this.orderProductsTableName)
      .delete()
      .eq('orderId', orderId);

    if (error) {
      console.error('Error deleting order products:', error);
      return false;
    }

    return true;
  }

  async checkUserRegistrationByEmail(eventId: number, email: string): Promise<{ isRegistered: boolean; name?: string }> {
    // First, get userId and name from profile by email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('userId, name')
      .eq('email', email)
      .single();

    if (profileError || !profileData) {
      return { isRegistered: false };
    }

    // Then check if user has an order for this event
    const { data: orderData, error: orderError } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('eventId', eventId)
      .eq('userId', profileData.userId)
      .limit(1);

    if (orderError) {
      return { isRegistered: false };
    }

    const isRegistered = orderData && orderData.length > 0;
    return {
      isRegistered,
      name: isRegistered ? profileData.name : undefined
    };
  }

  async checkNumberAvailability(eventId: number, number: number): Promise<boolean> {
    // Get all numbers used in this event
    const { data, error } = await supabase
      .from(this.tableName)
      .select('number')
      .eq('eventId', eventId)
      .not('number', 'is', null);

    if (error) {
      console.error('Error checking number availability:', error);
      return true; // Return true to allow in case of error (fail open)
    }

    // Check if number is in the list
    const numberExists = data?.some(order => order.number === number);

    console.log('Number availability check:', { eventId, number, usedNumbers: data, numberExists, isAvailable: !numberExists });

    // Number is available if it doesn't exist in the list
    return !numberExists;
  }
}

export default new OrderRepository();
