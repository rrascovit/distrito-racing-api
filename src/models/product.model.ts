export interface Product {
  id: number;
  created_at: string;
  eventId?: number;
  name?: string;
  priceCents?: number;
  numberDays?: number;
  startDate?: string; // date
  finalDate?: string; // date
  tier?: string;
  paymentLink?: string;
  quantity?: number;
  isFirstDriver: boolean;
}

export interface CreateProductDto {
  eventId: number;
  name: string;
  priceCents: number;
  numberDays?: number;
  startDate?: string;
  finalDate?: string;
  tier?: string;
  paymentLink?: string;
  quantity?: number;
  isFirstDriver?: boolean;
}

export interface UpdateProductDto extends Partial<Omit<CreateProductDto, 'eventId'>> {}
