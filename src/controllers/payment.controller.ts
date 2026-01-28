import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { paymentService } from '../services/payment.service';
import { orderRepository } from '../repositories/order.repository';

class PaymentController {
  /**
   * POST /payments/process
   * Processa um pagamento para uma order existente
   */
  async processPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const { 
        orderId, 
        paymentMethodType, 
        payer, 
        card: rawCard 
      } = req.body;

      // Normalizar dados do cartão (frontend envia camelCase, backend espera snake_case)
      const card = rawCard ? {
        token: rawCard.token,
        installments: rawCard.installments || 1,
        payment_method_id: rawCard.paymentMethodId || rawCard.payment_method_id,
        issuer_id: rawCard.issuerId || rawCard.issuer_id
      } : undefined;

      // Validar dados obrigatórios
      if (!orderId || !paymentMethodType || !payer) {
        res.status(400).json({ error: 'Dados incompletos para processar pagamento' });
        return;
      }

      // Buscar order
      const order = await orderRepository.findByIdForPayment(orderId, userId);
      if (!order) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      // Verificar se já foi pago
      if (order.isPaid) {
        res.status(400).json({ error: 'Este pedido já foi pago' });
        return;
      }

      // Buscar valor total da order
      const totalAmountCents = await orderRepository.getOrderTotalCents(orderId);
      if (totalAmountCents <= 0) {
        res.status(400).json({ error: 'Valor do pedido inválido' });
        return;
      }

      // Processar pagamento
      const paymentResponse = await paymentService.processPayment(
        { orderId, paymentMethodType, payer, card },
        totalAmountCents
      );

      // Determinar se foi aprovado imediatamente
      const isPaid = paymentResponse.status === 'approved';

      // Atualizar order com dados do pagamento
      await orderRepository.updatePaymentInfo(orderId, userId, {
        mpPaymentId: paymentResponse.id,
        mpStatus: paymentResponse.status,
        mpStatusDetail: paymentResponse.status_detail,
        pixQrCode: paymentResponse.qr_code,
        pixQrCodeBase64: paymentResponse.qr_code_base64,
        boletoUrl: paymentResponse.external_resource_url,
        boletoBarcode: paymentResponse.barcode,
        paymentExpiresAt: paymentResponse.date_of_expiration,
        isPaid,
        paymentMethod: paymentMethodType
      });

      // Retornar resposta apropriada
      res.status(200).json({
        success: true,
        payment: {
          id: paymentResponse.id,
          status: paymentResponse.status,
          status_detail: paymentResponse.status_detail,
          isPaid,
          // Dados para PIX
          pixQrCode: paymentResponse.qr_code,
          pixQrCodeBase64: paymentResponse.qr_code_base64,
          pixTicketUrl: paymentResponse.ticket_url,
          // Dados para Boleto
          boletoUrl: paymentResponse.external_resource_url,
          boletoBarcode: paymentResponse.barcode,
          // Expiração
          expiresAt: paymentResponse.date_of_expiration
        }
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error processing payment:', err);
      res.status(500).json({ 
        error: err.message || 'Erro ao processar pagamento' 
      });
    }
  }

  /**
   * GET /payments/status/:orderId
   * Consulta status de pagamento de uma order
   */
  async getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.uid;
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        res.status(400).json({ error: 'ID do pedido inválido' });
        return;
      }

      // Buscar order
      const order = await orderRepository.findByIdForPayment(orderId, userId);
      if (!order) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      // Se não tiver pagamento registrado
      const mpPaymentId = (order as { mpPaymentId?: string }).mpPaymentId;
      if (!mpPaymentId) {
        res.status(200).json({
          orderId,
          status: 'pending',
          isPaid: false,
          message: 'Pagamento ainda não foi iniciado'
        });
        return;
      }

      // Consultar status no Mercado Pago
      const paymentStatus = await paymentService.getPaymentStatus(mpPaymentId);

      // Atualizar banco de dados se o status mudou para aprovado
      const isPaid = paymentStatus.status === 'approved';
      const currentIsPaid = (order as { isPaid?: boolean }).isPaid;
      
      if (isPaid && !currentIsPaid) {
        // Status mudou para aprovado - atualizar no banco
        await orderRepository.updatePaymentInfo(orderId, userId, {
          mpStatus: paymentStatus.status,
          mpStatusDetail: paymentStatus.status_detail,
          isPaid: true
        });
        console.log(`Order ${orderId} atualizada para PAGO via polling`);
      }

      res.status(200).json({
        orderId,
        paymentId: mpPaymentId,
        status: paymentStatus.status,
        status_detail: paymentStatus.status_detail,
        isPaid,
        pixQrCode: paymentStatus.qr_code,
        pixQrCodeBase64: paymentStatus.qr_code_base64,
        boletoUrl: paymentStatus.external_resource_url
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error getting payment status:', err);
      res.status(500).json({ 
        error: err.message || 'Erro ao consultar status do pagamento' 
      });
    }
  }

  /**
   * GET /payments/methods
   * Lista métodos de pagamento disponíveis
   */
  async getPaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Retornar métodos suportados
      const methods = [
        {
          id: 'credit_card',
          name: 'Cartão de Crédito',
          icon: 'credit-card',
          description: 'Pague em até 12x',
          enabled: true
        },
        {
          id: 'debit_card',
          name: 'Cartão de Débito',
          icon: 'credit-card',
          description: 'Débito à vista',
          enabled: true
        },
        {
          id: 'pix',
          name: 'PIX',
          icon: 'qrcode',
          description: 'Pagamento instantâneo',
          enabled: true
        },
        {
          id: 'boleto',
          name: 'Boleto Bancário',
          icon: 'barcode',
          description: 'Vencimento em 3 dias',
          enabled: true
        }
      ];

      res.status(200).json({ methods });
    } catch (error: unknown) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({ 
        error: 'Erro ao listar métodos de pagamento' 
      });
    }
  }

  /**
   * POST /webhooks/mercadopago
   * Recebe notificações do Mercado Pago
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const xSignature = req.headers['x-signature'] as string;
      const xRequestId = req.headers['x-request-id'] as string;
      const dataId = req.query['data.id'] as string || (req.body as { data?: { id?: string } })?.data?.id;
      const type = req.query['type'] as string || (req.body as { type?: string })?.type;

      console.log('Webhook received:', { type, dataId, body: req.body });

      // Validar assinatura (em produção)
      if (xSignature && xRequestId && dataId) {
        const isValid = paymentService.validateWebhookSignature(
          xSignature,
          xRequestId,
          dataId
        );

        if (!isValid) {
          console.error('Invalid webhook signature');
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      }

      // Processar apenas notificações de pagamento
      if (type === 'payment') {
        const paymentId = dataId;
        if (paymentId) {
          await paymentService.processWebhookNotification(paymentId);
        }
      }

      // Responder 200 OK para o Mercado Pago
      res.status(200).send('OK');
    } catch (error: unknown) {
      console.error('Error handling webhook:', error);
      // Mesmo com erro, responder 200 para não causar retry infinito
      res.status(200).send('OK');
    }
  }
}

export const paymentController = new PaymentController();
export default paymentController;
