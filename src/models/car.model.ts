export interface Car {
  id: number;
  userId: string; // UUID
  brand?: string;
  model?: string;
  version?: string;
  carClass?: string;
}

export interface CreateCarDto {
  brand: string;
  model: string;
  version?: string;
  carClass?: string;
}

export interface UpdateCarDto extends Partial<CreateCarDto> {}
