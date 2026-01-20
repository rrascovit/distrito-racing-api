// Tipos de pagamento suportados
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'pix' | 'boleto';

// Status do pagamento Mercado Pago
export type MpPaymentStatus = 
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back';

// Status da Order Mercado Pago (API Orders)
export type MpOrderStatus = 
  | 'open'
  | 'processed'
  | 'action_required'
  | 'expired'
  | 'cancelled';

// Dados do pagador
export interface PayerInfo {
  email: string;
  firstName: string;
  lastName: string;
  identification: {
    type: string; // CPF, CNPJ
    number: string;
  };
  phone?: {
    area_code: string;
    number: string;
  };
  address?: {
    zip_code: string;
    street_name: string;
    street_number: string;
    neighborhood: string;
    city: string;
    federal_unit: string;
  };
}

// Dados do cartão (tokenizado)
export interface CardPaymentData {
  token: string;
  installments: number;
  payment_method_id: string; // visa, master, etc
  issuer_id?: string;
}

// Request para criar pagamento
export interface CreatePaymentRequest {
  orderId: number;
  paymentMethodType: PaymentMethodType;
  payer: PayerInfo;
  card?: CardPaymentData;
}

// Response do pagamento
export interface PaymentResponse {
  id: string;
  status: MpPaymentStatus;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  installments: number;
  // PIX
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  // Boleto
  barcode?: string;
  external_resource_url?: string;
  date_of_expiration?: string;
}

// Webhook notification do Mercado Pago
export interface MpWebhookNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: string;
  live_mode: boolean;
  type: string;
  user_id: number;
}

// Dados adicionais para orders (campos MP)
export interface OrderPaymentInfo {
  mpPaymentId?: string;
  mpStatus?: MpPaymentStatus;
  mpStatusDetail?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  paymentExpiresAt?: string;
}
