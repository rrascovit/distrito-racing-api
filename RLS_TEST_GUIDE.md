# 🧪 Guia de Teste - RLS Policies Distrito Racing

## ⚡ Quick Start

### 1️⃣ Executar Políticas no Supabase

1. Abra **Supabase Dashboard** → Seu Projeto
2. Menu lateral → **SQL Editor**
3. Abra o arquivo `SUPABASE_RLS_POLICIES.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ▶️

### 2️⃣ Verificar Instalação

Execute estas queries no SQL Editor para confirmar:

```sql
-- Verificar se RLS está ativo em todas as tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cars', 'addresses', 'events', 'products', 'orders');

-- Resultado esperado: todas com rowsecurity = true
```

```sql
-- Listar todas as policies criadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Resultado esperado: ~24 policies (4 por tabela)
```

---

## 🔬 Testes de Segurança

### Teste 1: Verificar Bloqueio de SELECT (Profiles)

**No Supabase SQL Editor, execute:**

```sql
-- Tentar ler profiles diretamente (SEM Service Role)
SELECT * FROM profiles;
```

**Resultado Esperado:**
```
Error: new row violates row-level security policy
```

✅ **Se falhar** = Políticas funcionando!  
❌ **Se retornar dados** = RLS não ativado corretamente

---

### Teste 2: Verificar Leitura Pública (Events)

**No Supabase SQL Editor, execute:**

```sql
-- Tentar ler events diretamente
SELECT * FROM events;
```

**Resultado Esperado:**
```
Lista de eventos retornada com sucesso
```

✅ **Se retornar dados** = Leitura pública funcionando!  
❌ **Se falhar** = Policy pública não criada corretamente

---

### Teste 3: Verificar Bloqueio de INSERT

**No Supabase SQL Editor, execute:**

```sql
-- Tentar inserir perfil diretamente
INSERT INTO profiles ("userId", name, email, role)
VALUES ('test123', 'Teste', 'teste@email.com', 'user');
```

**Resultado Esperado:**
```
Error: new row violates row-level security policy
```

✅ **Se falhar** = Políticas bloqueando inserções!  
❌ **Se inserir** = RLS não funcionando

---

### Teste 4: Verificar Backend Funciona (Service Role)

**Teste via Postman/Thunder Client:**

```http
GET http://localhost:3000/api/profiles/me
Authorization: Bearer <seu-token-firebase>
```

**Resultado Esperado:**
```json
{
  "id": "uuid-aqui",
  "userId": "firebase-uid",
  "name": "Seu Nome",
  "email": "seu@email.com"
}
```

✅ **Se retornar dados** = Backend bypassa RLS corretamente!  
❌ **Se falhar** = Problema no Service Role Key

---

## 📊 Checklist de Validação

Marque conforme testa:

- [ ] RLS ativo em todas as tabelas (6/6)
- [ ] 24+ policies criadas
- [ ] SELECT em profiles: **BLOQUEADO** ✅
- [ ] SELECT em events: **PERMITIDO** ✅
- [ ] INSERT direto em qualquer tabela: **BLOQUEADO** ✅
- [ ] Backend API continua funcionando: **OK** ✅

---

## 🛑 Troubleshooting

### Problema: SQL retorna erro de sintaxe

**Causa:** Tabela não existe ainda

**Solução:** Execute primeiro `SUPABASE_SCHEMA.sql` para criar as tabelas

---

### Problema: Backend retorna 403/401

**Causa:** Service Role Key incorreta ou middleware de auth com problema

**Solução:** 
1. Verifique `.env` → `SUPABASE_SERVICE_ROLE_KEY`
2. Confirme que é a **Service Role Key** (não Anon Key)
3. Reinicie o servidor Node.js

---

### Problema: Policies não bloqueiam acesso

**Causa:** RLS não foi habilitado nas tabelas

**Solução:**
```sql
-- Habilitar RLS manualmente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

---

### Problema: Events não são visíveis publicamente

**Causa:** Policy pública não criada ou mal configurada

**Solução:**
```sql
-- Verificar policy de events
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Recriar se necessário
DROP POLICY IF EXISTS "Public can view events" ON events;
CREATE POLICY "Public can view events"
ON events FOR SELECT
USING (true);
```

---

## 🎯 Teste Final: Segurança Completa

Execute este teste para validar TODA a segurança:

```sql
-- 1. Profiles: BLOQUEADO
SELECT * FROM profiles; -- Deve FALHAR

-- 2. Cars: BLOQUEADO
SELECT * FROM cars; -- Deve FALHAR

-- 3. Addresses: BLOQUEADO
SELECT * FROM addresses; -- Deve FALHAR

-- 4. Events: PÚBLICO
SELECT * FROM events; -- Deve FUNCIONAR

-- 5. Products: PÚBLICO
SELECT * FROM products; -- Deve FUNCIONAR

-- 6. Orders: BLOQUEADO
SELECT * FROM orders; -- Deve FALHAR

-- 7. Insert: BLOQUEADO
INSERT INTO profiles ("userId", name, email)
VALUES ('test', 'Test', 'test@test.com'); -- Deve FALHAR
```

**Score Esperado:** 4 ✅ e 3 ❌

---

## 🔐 Segurança Confirmada?

Se todos os testes acima passaram:

✅ **RLS estão ativas e funcionando**  
✅ **Dados protegidos contra acesso direto**  
✅ **Leitura pública apenas onde necessário**  
✅ **Backend continua operando normalmente**  
✅ **Máxima segurança implementada**

🎉 **Seu Supabase está SEGURO!**

---

## 📞 Próximos Passos

1. ✅ Testar todos os fluxos do app (login, inscrição, perfil)
2. ✅ Monitorar logs de erro no Supabase
3. ✅ Configurar backup automático do banco
4. ✅ Atualizar `CONTEXTO_PROJETO.md` com resultado dos testes

---

## 📚 Referências

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Service Role Key](https://supabase.com/docs/guides/api#the-service_role-key)
