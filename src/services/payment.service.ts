import { config } from '../config';
import { 
  CreatePaymentRequest, 
  PaymentResponse, 
  MpPaymentStatus,
  OrderPaymentInfo 
} from '../models/payment.model';
import { orderRepository } from '../repositories/order.repository';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Tipos para a resposta da API Orders
interface MpOrderResponse {
  id: string;
  type: string;
  status: string;
  status_detail: string;
  external_reference: string;
  total_amount: string;
  processing_mode: string;
  transactions?: {
    payments?: Array<{
      id: string;
      amount: string;
      status: string;
      status_detail: string;
      payment_method: {
        id: string;
        type: string;
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
        barcode_content?: string;
        digitable_line?: string;
      };
      date_of_expiration?: string;
    }>;
  };
}

class PaymentService {
  private baseUrl = 'https://api.mercadopago.com';

  /**
   * Faz requisição para a API Orders do Mercado Pago
   */
  private async createOrder(orderData: object): Promise<MpOrderResponse> {
    const idempotencyKey = uuidv4();
    
    console.log('Criando order no MP:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(`${this.baseUrl}/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.mercadoPago.accessToken}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json() as { message?: string; error?: string } & MpOrderResponse;

    if (!response.ok) {
      console.error('Erro API Orders MP:', JSON.stringify(data, null, 2));
      throw new Error(data.message || data.error || 'Erro ao criar order no Mercado Pago');
    }

    console.log('Order criada com sucesso:', JSON.stringify(data, null, 2));
    return data as MpOrderResponse;
  }

  /**
   * Busca uma Order no Mercado Pago
   */
  private async getOrder(orderId: string): Promise<MpOrderResponse> {
    const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.mercadoPago.accessToken}`
      }
    });

    const data = await response.json() as { message?: string } & MpOrderResponse;

    if (!response.ok) {
      console.error('Erro ao buscar order:', data);
      throw new Error(data.message || 'Erro ao buscar order no Mercado Pago');
    }

    return data as MpOrderResponse;
  }

  /**
   * Processa pagamento com cartão de crédito/débito via API Orders
   */
  async processCardPayment(
    request: CreatePaymentRequest,
    totalAmountCents: number
  ): Promise<PaymentResponse> {
    if (!request.card) {
      throw new Error('Dados do cartão são obrigatórios');
    }

    const totalAmount = (totalAmountCents / 100).toFixed(2);

    const orderData = {
      type: 'online',
      processing_mode: 'automatic',
      total_amount: totalAmount,
      external_reference: request.orderId.toString(),
      description: `Inscrição Distrito Racing - Pedido #${request.orderId}`,
      payer: {
        email: request.payer.email,
        first_name: request.payer.firstName || 'Cliente',
        last_name: request.payer.lastName || 'Distrito Racing',
        identification: {
          type: request.payer.identification.type,
          number: request.payer.identification.number
        }
      },
      transactions: {
        payments: [{
          amount: totalAmount,
          payment_method: {
            id: request.card.payment_method_id,
            type: request.paymentMethodType === 'debit_card' ? 'debit_card' : 'credit_card',
            token: request.card.token,
            installments: request.card.installments || 1
          }
        }]
      }
    };

    try {
      const response = await this.createOrder(orderData);
      const payment = response.transactions?.payments?.[0];
      
      return {
        id: response.id,
        status: this.mapOrderStatusToPaymentStatus(response.status),
        status_detail: response.status_detail || payment?.status_detail || '',
        payment_method_id: payment?.payment_method?.id || request.card.payment_method_id,
        payment_type_id: request.paymentMethodType === 'debit_card' ? 'debit_card' : 'credit_card',
        transaction_amount: parseFloat(totalAmount),
        installments: request.card.installments || 1
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Erro ao processar pagamento com cartão:', err);
      throw new Error(err.message || 'Erro ao processar pagamento');
    }
  }

  /**
   * Processa pagamento via PIX usando API Orders
   */
  async processPixPayment(
    request: CreatePaymentRequest,
    totalAmountCents: number
  ): Promise<PaymentResponse> {
    const totalAmount = (totalAmountCents / 100).toFixed(2);

    const orderData = {
      type: 'online',
      processing_mode: 'automatic',
      total_amount: totalAmount,
      external_reference: request.orderId.toString(),
      description: `Inscrição Distrito Racing - Pedido #${request.orderId}`,
      payer: {
        email: request.payer.email,
        first_name: request.payer.firstName || 'Cliente',
        last_name: request.payer.lastName || 'Distrito Racing',
        identification: {
          type: request.payer.identification.type,
          number: request.payer.identification.number
        }
      },
      transactions: {
        payments: [{
          amount: totalAmount,
          payment_method: {
            id: 'pix',
            type: 'bank_transfer'
          }
        }]
      }
    };

    try {
      const response = await this.createOrder(orderData);
      const payment = response.transactions?.payments?.[0];
      
      return {
        id: response.id,
        status: this.mapOrderStatusToPaymentStatus(response.status),
        status_detail: response.status_detail || payment?.status_detail || '',
        payment_method_id: 'pix',
        payment_type_id: 'bank_transfer',
        transaction_amount: parseFloat(totalAmount),
        installments: 1,
        qr_code: payment?.payment_method?.qr_code,
        qr_code_base64: payment?.payment_method?.qr_code_base64,
        ticket_url: payment?.payment_method?.ticket_url,
        date_of_expiration: payment?.date_of_expiration
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Erro ao processar pagamento PIX:', err);
      throw new Error(err.message || 'Erro ao processar pagamento PIX');
    }
  }

  /**
   * Processa pagamento via Boleto usando API Orders
   */
  async processBoletoPayment(
    request: CreatePaymentRequest,
    totalAmountCents: number
  ): Promise<PaymentResponse> {
    const totalAmount = (totalAmountCents / 100).toFixed(2);

    const orderData = {
      type: 'online',
      processing_mode: 'automatic',
      total_amount: totalAmount,
      external_reference: request.orderId.toString(),
      description: `Inscrição Distrito Racing - Pedido #${request.orderId}`,
      payer: {
        email: request.payer.email,
        first_name: request.payer.firstName || 'Cliente',
        last_name: request.payer.lastName || 'Distrito Racing',
        identification: {
          type: request.payer.identification.type,
          number: request.payer.identification.number
        },
        address: request.payer.address ? {
          zip_code: request.payer.address.zip_code,
          street_name: request.payer.address.street_name,
          street_number: request.payer.address.street_number,
          neighborhood: request.payer.address.neighborhood,
          city: request.payer.address.city,
          state: request.payer.address.federal_unit
        } : undefined
      },
      transactions: {
        payments: [{
          amount: totalAmount,
          payment_method: {
            id: 'bolbradesco',
            type: 'ticket'
          },
          expiration_time: 'P3D' // ISO 8601 duration: 3 days
        }]
      }
    };

    try {
      const response = await this.createOrder(orderData);
      const payment = response.transactions?.payments?.[0];
      
      return {
        id: response.id,
        status: this.mapOrderStatusToPaymentStatus(response.status),
        status_detail: response.status_detail || payment?.status_detail || '',
        payment_method_id: 'bolbradesco',
        payment_type_id: 'ticket',
        transaction_amount: parseFloat(totalAmount),
        installments: 1,
        barcode: payment?.payment_method?.barcode_content || payment?.payment_method?.digitable_line,
        external_resource_url: payment?.payment_method?.ticket_url,
        date_of_expiration: payment?.date_of_expiration
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Erro ao processar boleto:', err);
      throw new Error(err.message || 'Erro ao gerar boleto');
    }
  }

  /**
   * Mapeia status da Order para status de Payment (compatibilidade)
   */
  private mapOrderStatusToPaymentStatus(orderStatus: string): MpPaymentStatus {
    const statusMap: Record<string, MpPaymentStatus> = {
      'processed': 'approved',
      'open': 'pending',
      'action_required': 'pending',
      'expired': 'cancelled',
      'cancelled': 'cancelled'
    };
    return statusMap[orderStatus] || 'pending';
  }

  /**
   * Processa pagamento baseado no tipo de método
   */
  async processPayment(
    request: CreatePaymentRequest,
    totalAmountCents: number
  ): Promise<PaymentResponse> {
    switch (request.paymentMethodType) {
      case 'credit_card':
      case 'debit_card':
        return this.processCardPayment(request, totalAmountCents);
      case 'pix':
        return this.processPixPayment(request, totalAmountCents);
      case 'boleto':
        return this.processBoletoPayment(request, totalAmountCents);
      default:
        throw new Error('Método de pagamento não suportado');
    }
  }

  /**
   * Consulta status de uma Order no Mercado Pago
   */
  async getPaymentStatus(orderId: string): Promise<PaymentResponse> {
    try {
      const response = await this.getOrder(orderId);
      const payment = response.transactions?.payments?.[0];
      
      return {
        id: response.id,
        status: this.mapOrderStatusToPaymentStatus(response.status),
        status_detail: response.status_detail || payment?.status_detail || '',
        payment_method_id: payment?.payment_method?.id || '',
        payment_type_id: payment?.payment_method?.type || '',
        transaction_amount: parseFloat(response.total_amount) || 0,
        installments: 1,
        qr_code: payment?.payment_method?.qr_code,
        qr_code_base64: payment?.payment_method?.qr_code_base64,
        ticket_url: payment?.payment_method?.ticket_url,
        barcode: payment?.payment_method?.barcode_content,
        external_resource_url: payment?.payment_method?.ticket_url,
        date_of_expiration: payment?.date_of_expiration
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Erro ao consultar order:', err);
      throw new Error(err.message || 'Erro ao consultar status do pagamento');
    }
  }

  /**
   * Atualiza a order no banco com dados do pagamento
   */
  async updateOrderWithPayment(
    orderId: number,
    userId: string,
    paymentInfo: OrderPaymentInfo,
    isPaid: boolean
  ): Promise<void> {
    await orderRepository.updatePaymentInfo(orderId, userId, {
      ...paymentInfo,
      isPaid
    });
  }

  /**
   * Valida assinatura do webhook do Mercado Pago
   */
  validateWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string
  ): boolean {
    if (!config.mercadoPago.webhookSecret) {
      console.warn('Webhook secret não configurado');
      return true; // Em desenvolvimento, aceitar sem validação
    }

    try {
      // Extrair ts e v1 do header x-signature
      const parts = xSignature.split(',');
      let ts = '';
      let hash = '';

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key.trim() === 'ts') ts = value.trim();
        if (key.trim() === 'v1') hash = value.trim();
      }

      if (!ts || !hash) {
        console.error('x-signature inválido');
        return false;
      }

      // Montar o manifest para validação
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      // Gerar HMAC SHA256
      const expectedHash = crypto
        .createHmac('sha256', config.mercadoPago.webhookSecret)
        .update(manifest)
        .digest('hex');

      return hash === expectedHash;
    } catch (error) {
      console.error('Erro ao validar assinatura:', error);
      return false;
    }
  }

  /**
   * Processa notificação de webhook (agora para Orders)
   */
  async processWebhookNotification(mpOrderId: string): Promise<void> {
    try {
      // Buscar dados da order no MP
      const orderStatus = await this.getPaymentStatus(mpOrderId);
      
      // Buscar order pelo mpPaymentId (que agora é mpOrderId)
      const order = await orderRepository.findByMpPaymentId(mpOrderId);
      
      if (!order) {
        console.warn(`Order não encontrada para MP Order ${mpOrderId}`);
        return;
      }

      // Determinar se está pago
      const isPaid = orderStatus.status === 'approved';

      // Atualizar order
      await orderRepository.updatePaymentInfo(order.id, order.userId, {
        mpPaymentId: mpOrderId,
        mpStatus: orderStatus.status,
        mpStatusDetail: orderStatus.status_detail,
        isPaid
      });

      console.log(`Order ${order.id} atualizada: status=${orderStatus.status}, isPaid=${isPaid}`);
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
