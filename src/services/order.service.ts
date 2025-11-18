import productRepository from '../repositories/product.repository';
import orderRepository from '../repositories/order.repository';
import { CreateOrderDto, Order } from '../models/order.model';

export class OrderService {
  async createOrder(userId: string, orderData: CreateOrderDto): Promise<Order> {
    // Validar produtos
    const products = await productRepository.findByIds(orderData.productIds);

    if (products.length !== orderData.productIds.length) {
      throw new Error('Um ou mais produtos não foram encontrados');
    }

    // Verificar disponibilidade de produtos
    for (const product of products) {
      if (product.quantity !== undefined && product.quantity <= 0) {
        throw new Error(`Produto ${product.name} não está disponível`);
      }
    }

    // Criar pedido
    const { productIds, ...orderDataWithoutProducts } = orderData;
    const order = await orderRepository.create(userId, orderDataWithoutProducts);

    if (!order) {
      throw new Error('Erro ao criar pedido');
    }

    // Criar order_products
    for (const product of products) {
      await orderRepository.createOrderProduct({
        orderId: order.id,
        productId: product.id,
        priceCents: product.priceCents || 0,
        quantity: 1,
      });

      // Decrementar quantidade do produto
      if (product.quantity !== undefined && product.quantity > 0) {
        await productRepository.update(product.id, {
          quantity: product.quantity - 1
        });
      }
    }

    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: number, userId: string): Promise<Order | null> {
    const order = await orderRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      return null;
    }

    return order;
  }

  async updatePaymentStatus(
    orderId: number,
    userId: string,
    isPaid: boolean,
  ): Promise<Order | null> {
    const order = await orderRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new Error('Pedido não encontrado');
    }

    return await orderRepository.update(orderId, userId, { isPaid });
  }

  async checkFirstDriverRegistration(eventId: number, email: string): Promise<{ isRegistered: boolean; name?: string }> {
    return await orderRepository.checkUserRegistrationByEmail(eventId, email);
  }

  async checkCarNumberAvailability(eventId: number, number: number): Promise<boolean> {
    return await orderRepository.checkNumberAvailability(eventId, number);
  }

  async getEventRegistrations(eventId: number): Promise<Order[]> {
    return await orderRepository.findByEventId(eventId);
  }
}

export default new OrderService();
