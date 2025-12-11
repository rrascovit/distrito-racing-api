import { preferenceClient, paymentClient, mercadoPagoConfig } from '../config/mercadopago';
import { Order } from '../models/order.model';

export class PaymentService {
  /**
   * Cria uma preferência de pagamento no Mercado Pago
   * Retorna URL de checkout para redirecionar o usuário
   */
  async createCheckout(order: Order) {
    try {
      // Calcular valor total baseado no productPrice (já em centavos)
      const totalAmount = order.productPrice || 0;

      // Validar valor mínimo
      if (totalAmount <= 0) {
        throw new Error('Valor do pedido inválido. Produto sem preço configurado.');
      }

      console.log('=== CRIANDO CHECKOUT MERCADO PAGO ===');
      console.log('Order ID:', order.id);
      console.log('Total (centavos):', totalAmount);
      console.log('Total (reais):', totalAmount / 100);
      console.log('Profile:', order.profile ? {
        name: order.profile.name,
        email: order.profile.email,
        cpf: order.profile.cpf,
        phone: order.profile.phone
      } : 'SEM PROFILE');

      const backUrls = {
        success: `${mercadoPagoConfig.successUrl}?order_id=${order.id}`,
        failure: `${mercadoPagoConfig.failureUrl}?order_id=${order.id}`,
        pending: `${mercadoPagoConfig.pendingUrl}?order_id=${order.id}`,
      };

      console.log('Back URLs:', backUrls);

      const preferenceBody = {
        // Items do pedido
        items: [{
          id: order.id.toString(),
          title: `Inscrição - ${order.eventName || 'Evento'}`,
          description: order.productName || 'Inscrição no evento',
          category_id: 'tickets',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: totalAmount / 100, // Centavos -> Reais
        }],

        // Dados do comprador (se disponível)
        payer: order.profile ? {
          name: order.profile.name,
          email: order.profile.email,
          phone: order.profile.phone ? this.formatPhone(order.profile.phone) : undefined,
          identification: order.profile.cpf ? {
            type: 'CPF',
            number: order.profile.cpf.replace(/\D/g, ''),
          } : undefined,
        } : undefined,

        // URLs de retorno
        back_urls: backUrls,

        // Referência externa (ID do pedido)
        external_reference: `ORDER_${order.id}`,

        // URL de notificação (webhook)
        notification_url: mercadoPagoConfig.notificationUrl,

        // Descrição que aparece na fatura do cartão
        statement_descriptor: 'DISTRITO RACING',

        // Configurações de pagamento
        payment_methods: {
          excluded_payment_methods: [], // Aceitar todos
          excluded_payment_types: [],   // Aceitar todos tipos
          installments: 12,              // Até 12 parcelas
          default_installments: 1,       // Padrão: à vista
        },

        // Metadata adicional
        metadata: {
          order_id: order.id,
          event_id: order.eventId,
          user_id: order.userId,
        },
      };

      console.log('Enviando para MP:', JSON.stringify(preferenceBody, null, 2));

      const preference = await preferenceClient.create({
        body: preferenceBody,
      });

      console.log('✅ Checkout criado com sucesso!');
      console.log('Preference ID:', preference.id);
      console.log('Init Point:', preference.init_point);

      // Validar retorno do Mercado Pago
      if (!preference.id) {
        throw new Error('Mercado Pago não retornou ID da preferência');
      }

      const checkoutUrl = mercadoPagoConfig.sandbox 
        ? preference.sandbox_init_point 
        : preference.init_point;

      if (!checkoutUrl) {
        throw new Error('Mercado Pago não retornou URL de checkout');
      }

      return {
        checkoutUrl,
        preferenceId: preference.id,
      };
    } catch (error) {
      console.error('❌ ERRO MERCADO PAGO:');
      console.error('Message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error object:', error);
      throw new Error(`Falha ao criar checkout do Mercado Pago: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Busca detalhes de um pagamento
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await paymentClient.get({ id: paymentId });
      return payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Mapeia status do Mercado Pago para nosso sistema
   */
  mapPaymentStatus(status: string): boolean {
    // Status do MP: pending, approved, authorized, in_process, 
    //               in_mediation, rejected, cancelled, refunded, charged_back
    const approvedStatuses = ['approved', 'authorized'];
    return approvedStatuses.includes(status);
  }

  /**
   * Formata telefone para o padrão do Mercado Pago
   * Retorna undefined se telefone inválido
   */
  private formatPhone(phone: string): { area_code: string; number: string } | undefined {
    const cleaned = phone.replace(/\D/g, '');
    
    // Telefone brasileiro deve ter 10 ou 11 dígitos (com DDD)
    if (cleaned.length < 10 || cleaned.length > 11) {
      console.warn('Telefone em formato inválido:', phone);
      return undefined;
    }

    return {
      area_code: cleaned.substring(0, 2),
      number: cleaned.substring(2),
    };
  }

  /**
   * Mapeia tipo de pagamento
   */
  mapPaymentMethod(typeId: string): string {
    const methodMap: Record<string, string> = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'ticket': 'Boleto',
      'bank_transfer': 'Transferência',
      'pix': 'PIX',
    };
    return methodMap[typeId] || typeId;
  }
}

export default new PaymentService();
