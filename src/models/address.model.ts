export interface Address {
  id: string; // UUID
  created_at: string;
  zipcode?: string;
  streetAddress?: string;
  additionalAddress?: string;
  district?: string;
  city?: string;
  state?: string;
  userId?: string; // UUID
}

export interface CreateAddressDto {
  zipcode?: string;
  streetAddress?: string;
  additionalAddress?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}
