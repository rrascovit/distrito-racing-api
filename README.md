# Distrito Racing API

API Node.js com TypeScript para gerenciamento de eventos de corrida, utilizando Firebase Authentication e Supabase como banco de dados.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express** - Framework web
- **Firebase Admin SDK** - Autenticação
- **Supabase** - Banco de dados PostgreSQL
- **Express Validator** - Validação de requisições

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Conta Firebase com projeto configurado
- Projeto Supabase configurado

## 🔧 Instalação

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

3. Configure o Firebase:
   - Baixe o arquivo JSON de credenciais do Firebase Admin SDK
   - Extraia as informações necessárias para o arquivo `.env`

4. Configure o Supabase:
   - Obtenha a URL e as chaves do seu projeto Supabase
   - Adicione ao arquivo `.env`

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações (Firebase, Supabase, etc)
├── middlewares/      # Middlewares (autenticação, validação, etc)
├── models/           # Interfaces TypeScript
├── repositories/     # Camada de acesso a dados
├── services/         # Lógica de negócio
├── controllers/      # Controllers das rotas
├── routes/           # Definição das rotas
├── utils/            # Utilitários
└── index.ts          # Ponto de entrada
```

## 🔑 Autenticação

A API utiliza Firebase Authentication. O frontend Angular deve enviar o token JWT no header:

```
Authorization: Bearer <firebase-token>
```

## 📚 API Endpoints

### Profiles
- `GET /api/profiles/me` - Obtém perfil do usuário logado
- `PUT /api/profiles/me` - Atualiza perfil do usuário logado
- `GET /api/profiles/:id` - Obtém perfil por ID (admin)

### Addresses
- `GET /api/addresses` - Lista endereços do usuário
- `GET /api/addresses/:id` - Obtém endereço específico
- `POST /api/addresses` - Cria novo endereço
- `PUT /api/addresses/:id` - Atualiza endereço
- `DELETE /api/addresses/:id` - Remove endereço

### Cars
- `GET /api/cars` - Lista carros do usuário
- `POST /api/cars` - Cria novo carro
- `PUT /api/cars/:id` - Atualiza carro
- `DELETE /api/cars/:id` - Remove carro

### Events
- `GET /api/events` - Lista eventos
- `GET /api/events/:id` - Obtém evento específico
- `POST /api/events` - Cria evento (admin)
- `PUT /api/events/:id` - Atualiza evento (admin)
- `DELETE /api/events/:id` - Remove evento (admin)

### Products
- `GET /api/products/event/:eventId` - Lista produtos de um evento
- `GET /api/products/:id` - Obtém produto específico
- `POST /api/products` - Cria produto (admin)
- `PUT /api/products/:id` - Atualiza produto (admin)

### Orders
- `GET /api/orders` - Lista pedidos do usuário
- `GET /api/orders/:id` - Obtém pedido específico
- `POST /api/orders` - Cria novo pedido
- `PUT /api/orders/:id/payment` - Atualiza status de pagamento

## 🔒 Segurança

- CORS configurado para aceitar apenas origens permitidas
- Helmet para headers de segurança
- Validação de entrada com express-validator
- Autenticação obrigatória em rotas protegidas

## 📄 Licença

MIT
