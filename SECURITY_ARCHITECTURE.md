# 🔒 Segurança e Arquitetura de Autenticação - Distrito Racing

## Situação Atual

### Stack de Autenticação
- **Frontend:** Firebase Auth (email/senha + Google OAuth)
- **Backend:** Node.js + Express + Middleware de autenticação
- **Database:** Supabase (PostgreSQL) com Service Role Key

### Fluxo de Autenticação
```
1. Frontend → Firebase Auth → Token JWT
2. Frontend → API Node.js (Header: Authorization: Bearer <token>)
3. API valida token via Firebase Admin SDK
4. API acessa Supabase com Service Role Key (bypassa RLS)
```

---

## ⚠️ Problema com RLS "Public"

As políticas RLS configuradas como `public` (permitir tudo) **NÃO PROTEGEM** contra:
- Vazamento de credenciais Supabase
- Acesso direto ao banco via SDK Supabase
- Exploração de vulnerabilidades na API

---

## ✅ Solução Implementada: RLS Restritivas (Service Role Only)

### Arquitetura Atual:
- **Supabase Auth:** NÃO usado (tabela vazia) ✅
- **auth.uid():** Sempre NULL (Firebase não integra)
- **Service Role Key:** Backend bypassa RLS
- **RLS Strategy:** **BLOQUEAR TUDO**, exceto leitura pública necessária

### O que foi feito:
1. ✅ RLS habilitado em TODAS as tabelas
2. ✅ Políticas `USING (false)` → bloqueia tudo por padrão
3. ✅ Service Role Key bypassa = backend funciona normalmente
4. ✅ Exceções: Events e Products (leitura pública)

### Políticas Implementadas:

```sql
-- Exemplo: Profiles (100% bloqueado)
CREATE POLICY "Block all direct SELECT access"
ON profiles FOR SELECT
USING (false); -- Service Role bypassa isto

-- Exemplo: Events (leitura pública permitida)
CREATE POLICY "Public can view events"
ON events FOR SELECT
USING (true); -- Home precisa mostrar eventos
```

### Tabelas e Políticas:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| **profiles** | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **cars** | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **addresses** | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **events** | ✅ Público | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **products** | ✅ Público | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **orders** | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

**Importante:** Service Role Key (backend) bypassa TODAS as RLS ✅

---

## 🛡️ Camadas de Segurança

### Camada 1: Frontend - Firebase Auth
- Autenticação de usuários
- Geração de tokens JWT
- Proteção de rotas (Guards)

### Camada 2: Backend - Middleware `authenticate`
```typescript
// src/middlewares/auth.middleware.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.user = decodedToken; // Firebase UID disponível
  next();
};
```

### Camada 3: Backend - Middleware `requireAdmin`
```typescript
// src/middlewares/admin.middleware.ts
export const requireAdmin = async (req, res, next) => {
  const profile = await profileRepo.findByUserId(req.user.uid);
  if (profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Camada 4: Supabase - RLS
- **Estratégia:** Bloquear tudo por padrão (`USING false`)
- Service Role Key bypassa RLS (backend funciona)
- Exceções: Events e Products (leitura pública)
- **Resultado:** Impossível acessar dados sem passar pela API

---

## 🔄 Alternativas de Arquitetura
### Opção 1: Arquitetura Atual (Recomendado) ✅
**Prós:**
- ✅ Máxima segurança (RLS bloqueiam tudo)
- ✅ Simples e funcional
- ✅ Backend tem controle total
- ✅ Service Role Key nunca exposto ao frontend
- ✅ Impossível acessar banco sem passar pela API

**Contras:**
- ⚠️ Todas as requisições passam pela API Node.js
- ⚠️ Não é possível usar SDK Supabase direto no frontend

**Uso ideal:**
- ✅ Aplicações com regras de negócio complexas (como a DR)
- ✅ Máximo controle sobre operações no banco
- ✅ Proteção total contra vazamento de credenciais
- Controle total sobre operações no banco

---

### Opção 2: Integração Firebase JWT → Supabase Auth

**Como funciona:**
1. Frontend → Firebase Auth → Token JWT
2. Frontend → Supabase Edge Function (valida token Firebase)
3. Edge Function → Define `auth.uid()` do Supabase
4. Frontend → Supabase SDK direto (RLS valida auth.uid())

**Implementação:**
```typescript
// Supabase Edge Function (Deno)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

serve(async (req) => {
  const firebaseToken = req.headers.get('authorization')?.split('Bearer ')[1];
  
  // Validar token Firebase
  const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
  
  // Criar sessão Supabase com userId do Firebase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  await supabase.auth.setSession({
    access_token: customSupabaseToken,
    refresh_token: ''
  });
  
  // Agora auth.uid() = decodedToken.uid
  return new Response(JSON.stringify({ userId: decodedToken.uid }));
});
```

**Prós:**
- ✅ Frontend pode usar SDK Supabase direto
- ✅ RLS funcionam nativamente
- ✅ Menos carga no backend Node.js

**Contras:**
- ⚠️ Complexidade aumentada (Edge Functions)
- ⚠️ Necessário custom token para Supabase
- ⚠️ Latência adicional (validação Firebase + Supabase)

**Documentação:**
- https://supabase.com/docs/guides/auth/custom-claims
- https://firebase.google.com/docs/auth/admin/create-custom-tokens

---

### Opção 3: Migrar 100% para Supabase Auth

**Como funciona:**
1. Remover Firebase Auth
2. Usar Supabase Auth nativo
3. RLS funcionam automaticamente

**Prós:**
- ✅ Simplicidade máxima
- ✅ RLS nativos e eficientes
- ✅ SDK Supabase direto no frontend
- ✅ Sem necessidade de backend Node.js (opcional)

**Contras:**
- ⚠️ Requer migração completa de autenticação
- ⚠️ Perda de funcionalidades Firebase (Google OAuth, etc)
- ⚠️ Necessário reescrever lógica de autenticação

---

## 📋 Checklist de Segurança

### Backend (Já Implementado) ✅
- [x] Middleware `authenticate` validando tokens Firebase
- [x] Middleware `requireAdmin` verificando role
- [x] Service Role Key em variável de ambiente (`.env`)
- [x] `.env` no `.gitignore`
- [x] CORS configurado (apenas origens permitidas)
- [x] Helmet.js para headers de segurança
- [x] Rate limiting

### Supabase (Para Implementar) 🔄
- [ ] Executar `SUPABASE_RLS_POLICIES.sql` no Supabase SQL Editor
- [ ] Verificar RLS ativo em todas as tabelas
- [ ] Testar acesso direto ao Supabase (deve falhar)
- [ ] Verificar Service Role Key segura (não exposta)
- [ ] Configurar backup automático do banco

### Frontend (Já Implementado) ✅
- [x] Guards protegendo rotas privadas
- [x] Tokens JWT em headers HTTP
- [x] Nunca expor credenciais Firebase no código
- [x] Environment files no `.gitignore`
- [x] Interceptor adicionando token automaticamente

---

## 🚀 Próximos Passos

### Imediato (Alta Prioridade)
1. ✅ **Executar RLS Policies no Supabase**
   - Copiar `SUPABASE_RLS_POLICIES.sql`
   - Executar no Supabase SQL Editor
   - Verificar policies criadas

2. **Testar Segurança**
   - Tentar acessar Supabase direto (sem API)
   - Verificar se RLS bloqueiam acesso
   - Testar com usuário comum e admin

3. **Monitoramento**
   - Logs de acesso ao banco
   - Alertas de tentativas de acesso não autorizado

### Médio Prazo (Opcional)
4. **Auditoria de Segurança**
   - Revisar todas as rotas da API
   - Verificar rate limiting
   - Testar vulnerabilidades (OWASP Top 10)

5. **Backup e Recuperação**
   - Configurar backup automático diário
   - Plano de disaster recovery
   - Testar restauração de backup

### Longo Prazo (Melhorias)
6. **Logging Avançado**
   - Winston/Pino para logs estruturados
   - Sentry para monitoramento de erros
   - Analytics de segurança

7. **Considerar Opção 2** (se necessário acesso direto ao Supabase)
   - Implementar Edge Function
   - Integrar Firebase JWT → Supabase Auth
   - Migrar queries do backend para frontend

---

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Supabase Custom Claims](https://supabase.com/docs/guides/auth/custom-claims)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)
