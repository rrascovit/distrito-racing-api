-- Schema atualizado para a tabela profiles
-- Execute este script no Supabase SQL Editor

-- Criar ou atualizar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- ID interno do Supabase (gerado automaticamente)
  "userId" VARCHAR(255) NOT NULL UNIQUE, -- Firebase Auth UID (índice único)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "isActive" BOOLEAN DEFAULT true,
  username VARCHAR(255),
  cpf VARCHAR(14),
  phone VARCHAR(20),
  birthdate DATE,
  "emergencyContactName" VARCHAR(255),
  "emergencyContactPhone" VARCHAR(20),
  "categoryMembership" VARCHAR(50),
  "hasMembership" VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para userId (busca rápida por Firebase UID)
CREATE INDEX IF NOT EXISTS idx_profiles_userid ON profiles("userId");

-- Criar índice para email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Comentários sobre a estrutura:
-- 1. id: Gerado automaticamente pelo Supabase (UUID)
-- 2. userId: Firebase Auth UID - usado para encontrar o perfil do usuário autenticado
-- 3. O repository usa findByUserId(firebaseUid) para buscar perfis
-- 4. O id é usado apenas para referências internas (foreign keys, etc)
