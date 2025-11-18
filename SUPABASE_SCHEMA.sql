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

-- ============================================
-- MIGRATION: Adicionar campo carRequired em products
-- Data: 2025-11-18
-- ============================================

-- Adicionar coluna car_required com default true (retrocompatibilidade)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "carRequired" BOOLEAN DEFAULT true;

-- Atualizar produtos de segundo piloto para não exigir carro
UPDATE products 
SET "carRequired" = false 
WHERE "isFirstDriver" = false;

-- Comentário sobre carRequired:
-- - true: Produto requer carro cadastrado (track day físico, primeiro piloto)
-- - false: Produto não requer carro (simulador, workshops, segundo piloto)

-- ============================================
-- MIGRATION: Tornar car e carClass opcionais em orders
-- Data: 2025-11-18
-- ============================================

-- Permitir NULL nas colunas car e carClass para eventos que não requerem carro
ALTER TABLE orders 
ALTER COLUMN car DROP NOT NULL;

ALTER TABLE orders 
ALTER COLUMN "carClass" DROP NOT NULL;

-- Comentário:
-- Eventos como simulador ou workshops não precisam de informações do carro
-- O frontend enviará car e carClass como null quando carRequired = false
