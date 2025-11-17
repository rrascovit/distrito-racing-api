# 📊 Estrutura de Dados e Exemplos

## 🗄️ Dados de Exemplo para Supabase

Após configurar as tabelas no Supabase, você pode inserir alguns dados de teste:

### Events (Eventos)

```sql
INSERT INTO public.events (
  title, 
  subtitle, 
  short_description, 
  description, 
  image, 
  track_image,
  membership_required,
  registration_possible,
  last_day,
  possible_days
) VALUES 
(
  'Track Day Interlagos - Dezembro 2024',
  'Edição Especial de Final de Ano',
  'Um dia completo de adrenalina no lendário autódromo de Interlagos',
  'Descrição completa do evento com detalhes sobre horários, categorias, regulamento...',
  'https://exemplo.com/interlagos.jpg',
  'https://exemplo.com/pista-interlagos.jpg',
  true,
  true,
  '2024-12-20',
  '[
    {"date": "2024-12-15", "description": "Sábado - Dia completo"},
    {"date": "2024-12-16", "description": "Domingo - Dia completo"}
  ]'::jsonb
),
(
  'Track Day Velocitta - Janeiro 2025',
  'Temporada 2025',
  'Abertura da temporada 2025 no autódromo Velocitta',
  'Descrição completa...',
  'https://exemplo.com/velocitta.jpg',
  'https://exemplo.com/pista-velocitta.jpg',
  false,
  true,
  '2025-01-30',
  '[
    {"date": "2025-01-25", "description": "Sábado"},
    {"date": "2025-01-26", "description": "Domingo"}
  ]'::jsonb
);
```

### Products (Produtos/Ingressos)

```sql
INSERT INTO public.products (
  event_id,
  name,
  price_cents,
  number_days,
  start_date,
  final_date,
  tier,
  quantity,
  is_first_driver
) VALUES
-- Produtos do primeiro evento
(1, 'Early Bird - 1 Dia', 45000, 1, '2024-12-15', '2024-12-15', 'early-bird', 30, true),
(1, 'Early Bird - 2 Dias', 80000, 2, '2024-12-15', '2024-12-16', 'early-bird', 20, true),
(1, 'Segundo Piloto - 1 Dia', 25000, 1, '2024-12-15', '2024-12-15', 'second-driver', 30, false),
(1, 'Regular - 1 Dia', 55000, 1, '2024-12-15', '2024-12-15', 'regular', 50, true),
(1, 'Regular - 2 Dias', 95000, 2, '2024-12-15', '2024-12-16', 'regular', 30, true),

-- Produtos do segundo evento
(2, 'Lote 1 - 1 Dia', 40000, 1, '2025-01-25', '2025-01-25', 'batch-1', 40, true),
(2, 'Lote 1 - Weekend', 70000, 2, '2025-01-25', '2025-01-26', 'batch-1', 25, true),
(2, 'Segundo Piloto', 20000, 1, '2025-01-25', '2025-01-25', 'second-driver', 40, false);
```

## 📝 Exemplos de Uso da API

### 1. Fluxo de Cadastro Completo

```typescript
// 1. Usuário se registra no Firebase
const userCredential = await createUserWithEmailAndPassword(
  auth, 
  'usuario@email.com', 
  'senha123'
);

// 2. Após login, completa o perfil
const profile = await fetch('http://localhost:3000/api/profiles/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: 'João Silva',
    username: 'joaosilva',
    cpf: '12345678900',
    phone: '11987654321',
    birthdate: '1990-01-15',
    emergencyContactName: 'Maria Silva',
    emergencyContactPhone: '11987654322',
    categoryMembership: 'CBA',
    membershipNumber: '12345',
    zipcode: '01310-100',
    streetAddress: 'Avenida Paulista, 1000',
    city: 'São Paulo',
    state: 'SP'
  })
});

// 3. Cadastra um carro
const car = await fetch('http://localhost:3000/api/cars', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    brand: 'Honda',
    model: 'Civic',
    version: 'Type R',
    carClass: 'Turismo A'
  })
});
```

### 2. Fluxo de Inscrição em Evento

```typescript
// 1. Lista eventos disponíveis
const events = await fetch('http://localhost:3000/api/events/upcoming');

// 2. Seleciona um evento e busca produtos
const products = await fetch('http://localhost:3000/api/products/event/1');

// 3. Cria o pedido
const order = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: 1,
    car: 'Honda Civic Type R',
    carClass: 'Turismo A',
    number: 77,
    days: [
      { date: '2024-12-15', description: 'Sábado' }
    ],
    paymentMethod: 'pix',
    isFirstDriver: true,
    productIds: [1] // ID do produto Early Bird - 1 Dia
  })
});

// 4. Após pagamento, atualiza status
const updated = await fetch('http://localhost:3000/api/orders/1/payment', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isPaid: true
  })
});
```

### 3. Exemplo com Segundo Piloto

```typescript
// Piloto principal cria inscrição
const mainDriverOrder = await createOrder({
  eventId: 1,
  car: 'BMW M3',
  carClass: 'Turismo A',
  number: 88,
  days: [{ date: '2024-12-15' }],
  paymentMethod: 'credit_card',
  isFirstDriver: true,
  productIds: [1] // Produto para piloto principal
});

// Segundo piloto adiciona sua inscrição
const secondDriverOrder = await createOrder({
  eventId: 1,
  car: 'BMW M3', // Mesmo carro
  carClass: 'Turismo A',
  number: 88, // Mesmo número
  days: [{ date: '2024-12-15' }],
  paymentMethod: 'pix',
  isFirstDriver: false,
  firstDriverName: 'João Silva', // Nome do piloto principal
  productIds: [3] // Produto específico para segundo piloto
});
```

## 🔍 Queries Úteis no Supabase

### Buscar pedidos de um evento específico

```sql
SELECT 
  o.*,
  p.fullname as user_name,
  e.title as event_title
FROM orders o
JOIN profiles p ON o.user_id = p.id
JOIN events e ON o.event_id = e.id
WHERE o.event_id = 1
ORDER BY o.created_at DESC;
```

### Buscar produtos vendidos

```sql
SELECT 
  p.name,
  COUNT(op.id) as quantidade_vendida,
  SUM(op.quantity) as total_quantity,
  SUM(op.price_cents) as total_revenue_cents
FROM products p
LEFT JOIN order_products op ON p.id = op.product_id
WHERE p.event_id = 1
GROUP BY p.id, p.name;
```

### Listar participantes de um evento

```sql
SELECT 
  pr.fullname,
  pr.phone,
  o.car,
  o.car_class,
  o.number,
  o.is_first_driver,
  o.is_paid,
  o.days
FROM orders o
JOIN profiles pr ON o.user_id = pr.id
WHERE o.event_id = 1
ORDER BY o.number;
```

### Verificar disponibilidade de vagas

```sql
SELECT 
  p.name,
  p.quantity as vagas_totais,
  COUNT(op.id) as vagas_vendidas,
  (p.quantity - COUNT(op.id)) as vagas_disponiveis
FROM products p
LEFT JOIN order_products op ON p.id = op.product_id
WHERE p.event_id = 1
GROUP BY p.id, p.name, p.quantity;
```

## 📊 Estrutura de JSONs

### possibleDays (Events)

```json
[
  {
    "date": "2024-12-15",
    "description": "Sábado - Treino livre e classificação"
  },
  {
    "date": "2024-12-16",
    "description": "Domingo - Corrida e sessões livres"
  }
]
```

### days (Orders)

```json
[
  {
    "date": "2024-12-15",
    "description": "Sábado"
  }
]
```

## 🎯 Classes de Carros Sugeridas

```typescript
export const CAR_CLASSES = [
  'Turismo Light',
  'Turismo',
  'Turismo A',
  'Super Turismo',
  'GT3',
  'GT4',
  'Marcas',
  'Protótipo',
  'Livre'
];
```

## 💳 Métodos de Pagamento

```typescript
export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'bank_slip', label: 'Boleto Bancário' },
  { value: 'bank_transfer', label: 'Transferência Bancária' }
];
```

## 🏷️ Tiers de Produtos

```typescript
export const PRODUCT_TIERS = [
  { value: 'early-bird', label: 'Early Bird', discount: 20 },
  { value: 'batch-1', label: 'Lote 1', discount: 10 },
  { value: 'batch-2', label: 'Lote 2', discount: 5 },
  { value: 'regular', label: 'Regular', discount: 0 },
  { value: 'last-minute', label: 'Última Hora', discount: -10 },
  { value: 'second-driver', label: 'Segundo Piloto', discount: 50 }
];
```

## 📱 Dados para Testes

Use estes dados para testar a aplicação:

**Usuário de Teste:**
- Email: teste@distritoracing.com
- Senha: Teste123!

**CPF de Teste:**
- 123.456.789-00 (válido para testes)

**Cartão de Teste (ambiente sandbox):**
- Número: 4111 1111 1111 1111
- Validade: 12/2025
- CVV: 123

## 🔐 Políticas RLS Recomendadas

```sql
-- Permitir que usuários vejam todos os eventos
CREATE POLICY "Events are viewable by everyone" 
  ON events FOR SELECT 
  USING (true);

-- Permitir que usuários vejam todos os produtos
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

-- Usuários só podem ver seus próprios pedidos
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Apenas admins podem criar eventos
CREATE POLICY "Only admins can create events" 
  ON events FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

## 📈 Próximos Passos

1. **Implementar sistema de pagamento**
   - Integração com gateway (Mercado Pago, PagSeguro, etc.)
   - Webhooks para confirmação de pagamento

2. **Sistema de notificações**
   - Email de confirmação de pedido
   - SMS para lembretes de evento
   - Push notifications

3. **Dashboard administrativo**
   - Relatórios de vendas
   - Gestão de eventos
   - Lista de participantes

4. **Features adicionais**
   - Sistema de waiver/termo de responsabilidade
   - Upload de documentos (CNH, certificado médico)
   - Cronômetro e resultados ao vivo
   - Galeria de fotos do evento
