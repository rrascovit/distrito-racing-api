export interface Order {
  id: number;
  created_at: string;
  userId: string; // UUID
  isPaid: boolean;
  car?: string | null;
  carClass?: string | null;
  number?: number | null;
  days: Array<{
    date: string;
    description?: string;
  }>; // jsonb
  paymentMethod: string;
  firstDriverName?: string;
  eventId: number;
  isFirstDriver: boolean;
  // Additional fields from joins
  eventName?: string;
  trackName?: string;
  eventDates?: string[];
  profile?: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
}

export interface CreateOrderDto {
  car?: string | null;
  carClass?: string | null;
  number?: number | null;
  days: Array<{
    date: string;
    description?: string;
  }>;
  paymentMethod: string;
  firstDriverName?: string;
  eventId: number;
  isFirstDriver: boolean;
  productIds: number[]; // IDs dos produtos associados ao pedido
}

export interface UpdateOrderDto {
  isPaid?: boolean;
  paymentMethod?: string;
}

export interface OrderProduct {
  id: number;
  created_at: string;
  productId?: number;
  orderId?: number;
  priceCents?: number;
  quantity?: number;
}

export interface CreateOrderProductDto {
  productId: number;
  orderId: number;
  priceCents: number;
  quantity: number;
}
