import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { config } from './index';

// Verificar se o token está configurado
if (!config.mercadoPago.accessToken) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado no .env');
}

// Inicializar cliente do Mercado Pago (mantido para compatibilidade futura)
const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: config.mercadoPago.accessToken,
  options: {
    timeout: 5000
  }
});

// Instâncias das APIs (SDK legacy - não usado atualmente, usamos API Orders diretamente)
export const paymentApi = new Payment(mercadoPagoClient);
export const preferenceApi = new Preference(mercadoPagoClient);

export { mercadoPagoClient };
export default mercadoPagoClient;
