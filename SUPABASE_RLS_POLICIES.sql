-- ============================================
-- POLÍTICAS RLS SEGURAS PARA DISTRITO RACING
-- Data: 2025-11-25
-- ATUALIZADO: RLS restritivas (Service Role Only)
-- ============================================
-- 
-- IMPORTANTE: Este projeto usa Firebase Auth + Backend Node.js
-- - Supabase Auth NÃO é usado (tabela vazia)
-- - Backend usa Service Role Key (bypassa RLS)
-- - RLS bloqueia QUALQUER acesso direto ao Supabase
-- - Apenas requisições via API Node.js (com Service Role) funcionam
--
-- ESTRATÉGIA: Bloquear tudo, permitir apenas Service Role Key
-- ============================================

-- ============================================
-- 1. PROFILES
-- ============================================

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Bloquear TODAS as operações de leitura
-- Apenas Service Role Key (backend) consegue ler dados
CREATE POLICY "Block all direct SELECT access"
ON profiles FOR SELECT
USING (false); -- Nega tudo, Service Role bypassa

-- Policy: Bloquear TODAS as inserções diretas
-- Apenas Service Role Key (backend) pode inserir
CREATE POLICY "Block all direct INSERT access"
ON profiles FOR INSERT
WITH CHECK (false); -- Nega tudo, Service Role bypassa

-- Policy: Bloquear TODAS as atualizações diretas
-- Apenas Service Role Key (backend) pode atualizar
CREATE POLICY "Block all direct UPDATE access"
ON profiles FOR UPDATE
USING (false) -- Nega tudo
WITH CHECK (false); -- Nega tudo

-- Policy: Bloquear TODAS as exclusões diretas
-- Apenas Service Role Key (backend) pode deletar
CREATE POLICY "Block all direct DELETE access"
ON profiles FOR DELETE
USING (false); -- Nega tudo, Service Role bypassa

-- ============================================
-- 2. CARS
-- ============================================

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct SELECT access"
ON cars FOR SELECT
USING (false);

CREATE POLICY "Block all direct INSERT access"
ON cars FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON cars FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON cars FOR DELETE
USING (false);

-- ============================================
-- 3. ADDRESS
-- ============================================

ALTER TABLE address ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct SELECT access"
ON address FOR SELECT
USING (false);

CREATE POLICY "Block all direct INSERT access"
ON address FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON address FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON address FOR DELETE
USING (false);

-- ============================================
-- 4. EVENTS
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- EXCEÇÃO: Events podem ser lidos publicamente (sem autenticação)
-- Necessário para a home page mostrar eventos mesmo sem login
CREATE POLICY "Public can view events"
ON events FOR SELECT
USING (true); -- Permite leitura pública

-- Bloquear criação/edição/exclusão (apenas via backend com Service Role)
CREATE POLICY "Block all direct INSERT access"
ON events FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON events FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON events FOR DELETE
USING (false);

-- ============================================
-- 5. PRODUCTS
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- EXCEÇÃO: Products podem ser lidos publicamente (sem autenticação)
-- Necessário para exibir produtos durante inscrição em eventos
CREATE POLICY "Public can view products"
ON products FOR SELECT
USING (true); -- Permite leitura pública

-- Bloquear criação/edição/exclusão (apenas via backend com Service Role)
CREATE POLICY "Block all direct INSERT access"
ON products FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON products FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON products FOR DELETE
USING (false);

-- ============================================
-- 6. ORDERS
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct SELECT access"
ON orders FOR SELECT
USING (false);

CREATE POLICY "Block all direct INSERT access"
ON orders FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON orders FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON orders FOR DELETE
USING (false);

-- ============================================
-- 7. ORDER_PRODUCTS (Tabela de Relacionamento)
-- ============================================

ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct SELECT access"
ON order_products FOR SELECT
USING (false);

CREATE POLICY "Block all direct INSERT access"
ON order_products FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block all direct UPDATE access"
ON order_products FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block all direct DELETE access"
ON order_products FOR DELETE
USING (false);

-- ============================================
-- COMENTÁRIOS IMPORTANTES
-- ============================================

-- 1. ESTRATÉGIA DE SEGURANÇA:
--    - BLOQUEAR TUDO por padrão (USING false)
--    - Service Role Key BYPASSA todas as RLS
--    - Backend Node.js é o ÚNICO ponto de acesso autorizado
--    - Supabase Auth NÃO é usado (auth.uid() sempre NULL)

-- 2. EXCEÇÕES (Leitura Pública):
--    - EVENTS: Precisam ser visíveis na home sem autenticação
--    - PRODUCTS: Precisam ser visíveis durante inscrição sem login
--    - Todas as outras operações: BLOQUEADAS

-- 3. NÍVEIS DE SEGURANÇA:
--    Camada 1: Firebase Auth (frontend)
--    Camada 2: Middleware authenticate (backend/API)
--    Camada 3: Middleware requireAdmin (backend/API)
--    Camada 4: RLS (Supabase) - bloqueia acesso direto COMPLETAMENTE

-- 4. CENÁRIOS BLOQUEADOS PELAS RLS:
--    ✅ Vazamento de credenciais Supabase
--    ✅ Acesso direto ao banco via SQL
--    ✅ Uso do SDK Supabase no frontend
--    ✅ Bypass da API Node.js
--    ✅ Qualquer operação sem Service Role Key

-- 5. O QUE MUDA NA PRÁTICA:
--    - Backend continua funcionando normalmente (Service Role bypassa)
--    - Tentativa de acesso direto ao Supabase: BLOQUEADO SEMPRE
--    - Impossível ler/criar/editar/deletar dados sem passar pela API
--    - Máxima segurança com mínima complexidade

-- 6. TESTE DE SEGURANÇA:
--    - Tente acessar dados via Supabase Dashboard
--    - Tente fazer query SQL direta
--    - Resultado esperado: ACESSO NEGADO (exceto events/products read)

-- ============================================
-- VERIFICAÇÃO PÓS-INSTALAÇÃO
-- ============================================

-- Verificar se RLS está ativo em todas as tabelas:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cars', 'address', 'events', 'products', 'orders', 'order_products');

-- Listar todas as policies criadas:
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;