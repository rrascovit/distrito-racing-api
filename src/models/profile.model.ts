export interface Profile {
  id: string; // UUID
  userId: string; // Firebase Auth UID
  name: string; // Nome completo
  email: string; // Email do usuário
  role: 'user' | 'admin'; // Papel do usuário
  isActive: boolean; // Status ativo/inativo
  updated_at?: string;
  username?: string;
  cpf?: string;
  phone?: string;
  birthdate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  categoryMembership?: string;
  hasMembership?: string;
}

export interface CreateProfileDto {
  userId: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  username?: string;
  cpf?: string;
  phone?: string;
  birthdate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  categoryMembership?: string;
  hasMembership?: string;
}

export interface UpdateProfileDto extends Partial<CreateProfileDto> {}
