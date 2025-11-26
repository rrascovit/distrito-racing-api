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
        event:events(id, title, subtitle, possibleDays),
        order_products(productId, products(name))
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
      car?: string | null;
      carClass?: string | null;
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
      order_products?: Array<{
        productId: number;
        products: { name: string } | null;
      }>;
    }

    const orders = data?.map((order: OrderWithEvent) => ({
      ...order,
      eventName: order.event?.title || 'Evento desconhecido',
      subtitle: order.event?.subtitle || '',
      eventDates: order.event?.possibleDays?.map(d => d.date) || [],
      productName: order.order_products?.[0]?.products?.name || 'Produto não encontrado',
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

  async findByIdDetailed(id: number, userId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        event:events(
          id,
          title,
          subtitle,
          description,
          possibleDays,
          image,
          trackImage,
          regulation,
          result,
          resultClass,
          resultLap
        ),
        order_products(
          id,
          productId,
          priceCents,
          quantity,
          products(
            id,
            name,
            tier,
            priceCents,
            isFirstDriver
          )
        )
      `)
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (error) {
      console.error('Error finding order with details:', error);
      return null;
    }

    // Transform data to flatten nested structures
    interface OrderDetailed {
      id: number;
      created_at: string;
      userId: string;
      isPaid: boolean;
      car?: string | null;
      carClass?: string | null;
      number?: number | null;
      days: Array<{ date: string; description?: string }>;
      paymentMethod: string;
      firstDriverName?: string;
      eventId: number;
      isFirstDriver: boolean;
      event?: {
        id: number;
        title: string;
        subtitle?: string;
        description?: string;
        possibleDays?: Array<{ date: string; description?: string }> | string[];
        image?: string | null;
        trackImage?: string | null;
        regulation?: string | null;
        result?: string | null;
        resultClass?: string | null;
        resultLap?: string | null;
      };
      order_products?: Array<{
        id: number;
        productId: number;
        priceCents: number;
        quantity: number;
        products: {
          id: number;
          name: string;
          tier?: string;
          priceCents: number;
          isFirstDriver: boolean;
        } | null;
      }>;
    }

    const order = data as OrderDetailed;

    // Flatten event data
    const transformedOrder = {
      ...order,
      eventName: order.event?.title || 'Evento desconhecido',
      subtitle: order.event?.subtitle || '',
      eventDescription: order.event?.description || '',
      eventDates: order.event?.possibleDays || [],
      eventImage: order.event?.image || null,
      trackImage: order.event?.trackImage || null,
      regulation: order.event?.regulation || null,
      result: order.event?.result || null,
      resultClass: order.event?.resultClass || null,
      resultLap: order.event?.resultLap || null,
      // Flatten product data (first product)
      productName: order.order_products?.[0]?.products?.name || 'Produto não encontrado',
      productTier: order.order_products?.[0]?.products?.tier || '',
      productPrice: order.order_products?.[0]?.priceCents || 0,
      productIsFirstDriver: order.order_products?.[0]?.products?.isFirstDriver ?? true,
    };

    return transformedOrder as Order;
  }

  async findByEventId(eventId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        profile:profiles!orders_userId_fkey(name, email, phone, cpf)
      `)
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
