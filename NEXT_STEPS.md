# Distrito Racing API

Este projeto foi criado com sucesso! ✅

## 🎯 Próximos Passos

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar credenciais:**
   - Copie `.env.example` para `.env`
   - Preencha com suas credenciais do Firebase e Supabase
   - Veja o arquivo `SETUP.md` para instruções detalhadas

3. **Executar o projeto:**
   ```bash
   npm run dev
   ```

4. **Testar a API:**
   - Use o arquivo `api-examples.http` com a extensão REST Client do VS Code
   - Ou use Postman/Insomnia com os exemplos fornecidos

## 📁 Estrutura Criada

```
distrito-racing-api/
├── src/
│   ├── config/           # Configurações (Firebase, Supabase)
│   ├── controllers/      # Controladores das rotas
│   ├── middlewares/      # Middlewares (auth, validação, erros)
│   ├── models/           # Interfaces TypeScript
│   ├── repositories/     # Acesso a dados
│   ├── routes/           # Rotas da API
│   ├── services/         # Lógica de negócio
│   ├── utils/            # Utilitários
│   └── index.ts          # Ponto de entrada
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json
├── tsconfig.json
├── README.md
├── SETUP.md             # Guia completo de configuração
└── api-examples.http    # Exemplos de requisições
```

## 🔑 Recursos Implementados

### Autenticação
- ✅ Firebase Authentication
- ✅ Middleware de verificação de token JWT
- ✅ Rotas protegidas e públicas

### Banco de Dados
- ✅ Integração com Supabase
- ✅ Repositories para todas as tabelas
- ✅ Models TypeScript completos

### Endpoints REST API
- ✅ **Profiles** - Gerenciamento de perfis
- ✅ **Cars** - Gerenciamento de carros
- ✅ **Events** - Listagem e gerenciamento de eventos
- ✅ **Products** - Produtos/ingressos dos eventos
- ✅ **Orders** - Sistema completo de pedidos

### Segurança
- ✅ CORS configurado para Angular
- ✅ Helmet para headers de segurança
- ✅ Validação de entrada com express-validator
- ✅ Tratamento de erros centralizado

### Developer Experience
- ✅ TypeScript com configuração estrita
- ✅ ESLint e Prettier
- ✅ Nodemon para hot reload
- ✅ Morgan para logging
- ✅ Documentação completa

## 📚 Documentação

- **README.md** - Visão geral e uso básico
- **SETUP.md** - Guia completo de configuração passo a passo
- **api-examples.http** - Exemplos de todas as requisições HTTP

## 🔗 Integração com Angular

O projeto está pronto para ser consumido pelo seu frontend Angular. Certifique-se de:

1. Adicionar o URL do Angular em `ALLOWED_ORIGINS` no `.env`
2. Configurar um interceptor HTTP no Angular para incluir o token Firebase
3. Usar a mesma configuração de Firebase nos dois projetos

## ⚙️ Scripts Disponíveis

```bash
npm run dev      # Executa em modo desenvolvimento
npm run build    # Compila para produção
npm start        # Executa versão compilada
npm run lint     # Verifica código com ESLint
npm run format   # Formata código com Prettier
```

## 🆘 Precisa de Ajuda?

Consulte o arquivo `SETUP.md` para instruções detalhadas de configuração, incluindo:
- Como configurar Firebase
- Como configurar Supabase
- Como criar as tabelas no banco de dados
- Configuração de Row Level Security
- Troubleshooting de problemas comuns

Boa sorte com o projeto Distrito Racing! 🏎️💨
