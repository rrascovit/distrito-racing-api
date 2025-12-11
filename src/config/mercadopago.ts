import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN || '';
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

if (!accessToken) {
  console.warn('⚠️  MP_ACCESS_TOKEN não configurado. Pagamentos não funcionarão.');
}

if (!process.env.API_URL && process.env.NODE_ENV === 'production') {
  console.error('❌ API_URL não configurada em produção! Webhooks do Mercado Pago não funcionarão.');
}

// Configurar cliente do Mercado Pago
export const mercadopago = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  },
});

// Criar instâncias dos serviços
export const preferenceClient = new Preference(mercadopago);
export const paymentClient = new Payment(mercadopago);

export const mercadoPagoConfig = {
  accessToken,
  sandbox: process.env.NODE_ENV !== 'production',
  notificationUrl: `${apiUrl}/api/payment/webhooks/mercadopago`,
  successUrl: `${frontendUrl}/orders`,
  failureUrl: `${frontendUrl}/orders`,
  pendingUrl: `${frontendUrl}/orders`,
};

