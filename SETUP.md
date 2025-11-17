# 🏎️ Distrito Racing API - Guia de Configuração

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- Node.js >= 18.0.0
- npm ou yarn
- Conta no Firebase (https://console.firebase.google.com)
- Projeto no Supabase (https://supabase.com)

## 🔧 Configuração Passo a Passo

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Firebase

#### 2.1. Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação do projeto

#### 2.2. Habilitar Authentication

1. No menu lateral, vá em "Authentication"
2. Clique em "Começar"
3. Habilite os métodos de autenticação desejados (Email/Senha, Google, etc.)

#### 2.3. Obter Credenciais do Admin SDK

1. Vá em "Configurações do Projeto" (ícone de engrenagem)
2. Acesse a aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Salve o arquivo JSON baixado (NÃO comite este arquivo!)

#### 2.4. Extrair Informações para o .env

Do arquivo JSON baixado, você precisará de:
- `project_id` → FIREBASE_PROJECT_ID
- `private_key` → FIREBASE_PRIVATE_KEY
- `client_email` → FIREBASE_CLIENT_EMAIL

### 3. Configuração do Supabase

#### 3.1. Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados e aguarde a criação

#### 3.2. Criar as Tabelas

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Tabela profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text UNIQUE CHECK (char_length(username) >= 3),
  fullname text UNIQUE,
  cpf text UNIQUE,
  phone text,
  birthdate text,
  emergencyContactName text,
  emergencyContactPhone text,
  categoryMembership text,
  membershipNumber text,
  zipcode text,
  streetAddress text,
  additionalAddress text,
  district text,
  city text,
  state text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Tabela cars
CREATE TABLE public.cars (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  userId uuid NOT NULL DEFAULT auth.uid(),
  brand text,
  model text,
  version text,
  carClass text,
  CONSTRAINT cars_pkey PRIMARY KEY (id),
  CONSTRAINT cars_userId_fkey FOREIGN KEY (userId) REFERENCES public.profiles(id)
);

-- Tabela events
CREATE TABLE public.events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text,
  subtitle text,
  shortDescription text,
  description text,
  image text,
  externalTickets text,
  trackImage text,
  regulation text,
  membershipRequired boolean,
  result text,
  resultClass text,
  resultLap text,
  chatLink text,
  registrationPossible boolean DEFAULT false,
  lastDay date,
  possibleDays jsonb,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- Tabela products
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  eventId bigint,
  name text,
  priceCents numeric,
  numberDays numeric,
  startDate date,
  finalDate date,
  tier text,
  paymentLink text,
  quantity numeric,
  isFirstDriver boolean NOT NULL DEFAULT false,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_eventId_fkey FOREIGN KEY (eventId) REFERENCES public.events(id)
);

-- Tabela orders
CREATE TABLE public.orders (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  userId uuid NOT NULL DEFAULT auth.uid(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  isPaid boolean NOT NULL DEFAULT false,
  car text NOT NULL,
  carClass text NOT NULL,
  number numeric NOT NULL,
  days jsonb NOT NULL,
  paymentMethod text NOT NULL,
  firstDriverName text,
  eventId bigint NOT NULL,
  isFirstDriver boolean NOT NULL,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_eventId_fkey FOREIGN KEY (eventId) REFERENCES public.events(id),
  CONSTRAINT orders_userId_fkey FOREIGN KEY (userId) REFERENCES public.profiles(id)
);

-- Tabela order_products
CREATE TABLE public.order_products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  productId bigint,
  orderId bigint,
  priceCents numeric,
  quantity numeric,
  CONSTRAINT order_products_pkey PRIMARY KEY (id),
  CONSTRAINT order_products_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.orders(id),
  CONSTRAINT order_products_productId_fkey FOREIGN KEY (productId) REFERENCES public.products(id)
);
```

#### 3.3. Obter Credenciais

1. No painel do projeto, vá em "Settings" → "API"
2. Você encontrará:
   - Project URL → SUPABASE_URL
   - anon/public key → SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_ROLE_KEY (⚠️ Mantenha secreto!)

### 4. Configurar Arquivo .env

Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha com suas credenciais:

```env
PORT=3000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave aqui...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# CORS - adicione o URL do seu frontend Angular
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 5. Executar o Projeto

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

## 🔒 Segurança

### RLS (Row Level Security) no Supabase

Configure políticas de segurança no Supabase:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (usuário só pode ver/editar próprio perfil)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para cars (usuário só pode gerenciar próprios carros)
CREATE POLICY "Users can view own cars" ON cars
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can insert own cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update own cars" ON cars
  FOR UPDATE USING (auth.uid() = userId);

CREATE POLICY "Users can delete own cars" ON cars
  FOR DELETE USING (auth.uid() = userId);
```

## 🧪 Testando a API

Use ferramentas como Postman, Insomnia ou Thunder Client.

### Exemplo de autenticação:

1. No frontend Angular, faça login com Firebase
2. Obtenha o token JWT do usuário
3. Envie o token no header das requisições:

```
Authorization: Bearer <seu-token-firebase>
```

### Endpoints disponíveis:

- `GET /api/health` - Health check
- `GET /api/profiles/me` - Perfil do usuário
- `GET /api/cars` - Carros do usuário
- `GET /api/events` - Lista de eventos
- `GET /api/products/event/:eventId` - Produtos de um evento
- `POST /api/orders` - Criar pedido

## 📱 Integração com Angular

No seu projeto Angular, configure o HttpClient para incluir o token:

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: Auth) {}

  async intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = await this.auth.currentUser?.getIdToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o URL do frontend está em `ALLOWED_ORIGINS` no `.env`

### Erro de autenticação Firebase
- Verifique se o `FIREBASE_PRIVATE_KEY` está formatado corretamente (com `\n`)
- Certifique-se de que as credenciais estão corretas

### Erro de conexão com Supabase
- Verifique se as URLs e chaves estão corretas
- Confirme que as tabelas foram criadas no banco

## 📚 Recursos Adicionais

- [Documentação Firebase Admin](https://firebase.google.com/docs/admin/setup)
- [Documentação Supabase](https://supabase.com/docs)
- [Express.js](https://expressjs.com/)
