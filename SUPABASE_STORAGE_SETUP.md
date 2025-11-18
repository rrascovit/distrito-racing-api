# 📦 Configuração do Supabase Storage

## Bucket "eventos" - Armazenamento de Arquivos

### 🎯 Objetivo
Criar um bucket público no Supabase para armazenar imagens e PDFs relacionados aos eventos.

---

## 📋 Passo a Passo

### 1. Acessar Supabase Dashboard
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**

### 2. Criar Bucket "eventos"
1. Clique em **"New bucket"** (ou "+ Create bucket")
2. Preencha os dados:
   - **Name:** `eventos`
   - **Public bucket:** ✅ **Marque esta opção** (bucket público)
   - **File size limit:** `10 MB` (opcional, mas recomendado)
   - **Allowed MIME types:** Deixe vazio (ou especifique: `image/jpeg, image/png, image/webp, application/pdf`)

3. Clique em **Create bucket**

### 3. Configurar Políticas de Acesso (RLS)

#### Opção 1: Usar Template (Mais Fácil)
1. Após criar o bucket, vá em **Policies**
2. Clique em **"New Policy"**
3. Selecione o template **"Allow public read access"**
4. Confirme

#### Opção 2: Criar Manualmente
Adicione as seguintes políticas:

**Policy 1: Public Read (SELECT)**
```sql
-- Nome: Public Read Access
-- Tipo: SELECT
-- Target: public
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'eventos');
```

**Policy 2: Admin Upload (INSERT)**
```sql
-- Nome: Admin Upload Access
-- Tipo: INSERT
-- Target: authenticated
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'eventos');
```

**Policy 3: Admin Delete (DELETE)**
```sql
-- Nome: Admin Delete Access
-- Tipo: DELETE
-- Target: authenticated
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'eventos');
```

### 4. Estrutura de Pastas (Criadas Automaticamente)

O sistema criará automaticamente as seguintes pastas ao fazer upload:

```
eventos/
├── imagens/              - Imagens de capa dos eventos
├── pistas/               - Mapas/layouts das pistas
├── regulamentos/         - PDFs de regulamentos
└── resultados/           - PDFs de resultados (geral, por classe e por voltas)
```

---

## ✅ Verificação

Para verificar se o bucket está configurado corretamente:

1. **Teste de Upload:**
   - No dashboard do Supabase, clique no bucket "eventos"
   - Clique em "Upload file"
   - Faça upload de uma imagem de teste
   - Copie o URL público gerado

2. **Teste de Acesso Público:**
   - Cole o URL copiado no navegador
   - A imagem deve ser exibida sem necessidade de autenticação

---

## 🔗 URLs Públicas

As URLs seguirão o padrão:
```
https://[PROJECT-ID].supabase.co/storage/v1/object/public/eventos/[folder]/[filename]
```

Exemplo:
```
https://xyzabc123.supabase.co/storage/v1/object/public/eventos/imagens/1731890123456-evento-interlagos.jpg
```

---

## 🔒 Segurança

- ✅ **Leitura:** Pública (qualquer pessoa pode acessar os arquivos)
- ✅ **Upload:** Apenas administradores autenticados
- ✅ **Deleção:** Apenas administradores autenticados
- ✅ **Limite de tamanho:** 10MB por arquivo
- ✅ **Tipos permitidos:** Imagens (JPEG, PNG, WEBP) e PDFs

---

## 📊 Monitoramento

### Verificar Uso de Armazenamento
1. No Supabase Dashboard, vá em **Settings** → **Billing**
2. Veja o uso atual de Storage
3. Free tier: 1GB
4. Pro: 100GB ($25/mês)

### Limpar Arquivos Antigos (Opcional)
Se necessário, você pode criar uma função Edge para limpar arquivos não utilizados periodicamente.

---

## 🚀 Próximos Passos

Após configurar o bucket:

1. ✅ Backend já está pronto (`/api/storage/upload` e `/api/storage/delete`)
2. ✅ Frontend já está integrado (EventFormComponent)
3. ✅ Upload de imagens implementado (evento e pista)
4. ✅ Upload de PDFs implementado (regulamento e resultados)
5. 📋 Testar todos os uploads no formulário de evento

---

## 🛠️ Troubleshooting

### Erro: "Bucket not found"
- Verifique se o nome do bucket é exatamente `eventos` (minúsculo)
- Confirme que o bucket foi criado

### Erro: "Access denied"
- Verifique se as políticas RLS estão configuradas corretamente
- Certifique-se de que o bucket está marcado como **público**

### Erro: "File too large"
- Limite padrão: 10MB
- Para aumentar: vá em Settings do bucket e ajuste o limite

---

## 📝 Notas Importantes

1. **Backup:** Supabase faz backup automático, mas considere ter cópias locais de arquivos importantes
2. **CDN:** Supabase usa CDN global automaticamente para todos os arquivos públicos
3. **Transformação de Imagens:** Supabase oferece transformação on-the-fly (resize, crop, etc.) via query params
4. **Custo:** 1GB grátis, depois $0.021/GB/mês no plano Pro

---

**Configuração concluída!** 🎉
