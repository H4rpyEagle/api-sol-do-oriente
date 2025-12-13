# 🔗 Endereço do Webhook no Vercel

## Como descobrir a URL do seu webhook:

Após fazer deploy no Vercel, você terá uma URL no formato:

```
https://api-sol-do-oriente.vercel.app
```

ou se você configurou um domínio customizado:

```
https://seu-dominio.com
```

## 📨 Endereço do Webhook:

O webhook estará disponível em:

```
https://SUA_URL_VERCEL/webhook/messages
```

### Exemplo:
```
https://api-sol-do-oriente.vercel.app/webhook/messages
```

## 🔍 Como encontrar sua URL:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Clique no seu projeto `api-sol-do-oriente`
3. Na página do projeto, você verá a URL de produção
4. Copie essa URL e adicione `/webhook/messages` no final

## ✅ Testar o Webhook:

### Health Check:
```bash
curl https://SUA_URL_VERCEL/health
```

### Testar Webhook:
```bash
curl -X POST https://SUA_URL_VERCEL/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "teste",
    "server_url": "https://evolution-api.com",
    "apikey": "test",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test-id"
      },
      "messageType": "conversation",
      "message": {
        "conversation": "Teste"
      }
    }
  }'
```

## ⚙️ Configurar na Evolution API:

Na configuração do webhook da Evolution API, use:

```
https://SUA_URL_VERCEL/webhook/messages
```

## 🔐 Variáveis de Ambiente no Vercel:

Certifique-se de configurar todas as variáveis de ambiente no Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione todas as variáveis do arquivo `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `MINIO_ENDPOINT`
   - `MINIO_ACCESS_KEY`
   - `MINIO_SECRET_KEY`
   - `MINIO_BUCKET`
   - `MINIO_USE_SSL`
   - `MINIO_REGION`

## 📝 Nota:

Se você já fez o deploy, a URL está visível no dashboard do Vercel. Se precisar, posso ajudar a encontrá-la!

