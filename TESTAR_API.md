# 🧪 Como Testar a API

## 📡 Endpoints Disponíveis

### 1. Health Check
Verifica se a API está funcionando e se os serviços estão conectados:

```
GET https://api-sol-do-oriente.vercel.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-13T18:50:00.000Z",
  "services": {
    "supabase": { "connected": true },
    "minio": { "connected": true }
  }
}
```

### 2. Ver Últimas Requisições (TEMPO REAL)
Mostra as últimas requisições recebidas pela API:

```
GET https://api-sol-do-oriente.vercel.app/requests
```

**Com limite:**
```
GET https://api-sol-do-oriente.vercel.app/requests?limit=10
```

**Resposta:**
```json
{
  "success": true,
  "total": 10,
  "requests": [
    {
      "id": 1734123456789.123,
      "timestamp": "2025-12-13T18:50:00.000Z",
      "method": "POST",
      "path": "/webhook/messages",
      "url": "/webhook/messages",
      "headers": { ... },
      "body": "{ ... }",
      "response": { ... }
    }
  ]
}
```

### 3. Estatísticas das Requisições
Mostra estatísticas sobre as requisições recebidas:

```
GET https://api-sol-do-oriente.vercel.app/requests/stats
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total": 50,
    "byMethod": {
      "POST": 45,
      "GET": 5
    },
    "byPath": {
      "/webhook/messages": 45,
      "/health": 5
    },
    "oldest": "2025-12-13T18:00:00.000Z",
    "newest": "2025-12-13T18:50:00.000Z"
  }
}
```

### 4. Ver Requisição Específica
Ver detalhes de uma requisição específica por ID:

```
GET https://api-sol-do-oriente.vercel.app/requests/1734123456789.123
```

### 5. Limpar Requisições
Limpa todas as requisições armazenadas:

```
DELETE https://api-sol-do-oriente.vercel.app/requests
```

## 🧪 Testar no Navegador

### Teste Rápido:
1. Abra: https://api-sol-do-oriente.vercel.app/health
2. Deve mostrar o status da API

### Ver Requisições em Tempo Real:
1. Abra: https://api-sol-do-oriente.vercel.app/requests
2. Atualize a página para ver novas requisições
3. Ou use um auto-refresh (extensão do navegador)

## 🧪 Testar com cURL

### Health Check:
```bash
curl https://api-sol-do-oriente.vercel.app/health
```

### Ver Requisições:
```bash
curl https://api-sol-do-oriente.vercel.app/requests
```

### Ver Estatísticas:
```bash
curl https://api-sol-do-oriente.vercel.app/requests/stats
```

### Testar Webhook:
```bash
curl -X POST https://api-sol-do-oriente.vercel.app/webhook/messages \
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
        "conversation": "Teste de mensagem"
      }
    }
  }'
```

Depois verifique se apareceu em:
```bash
curl https://api-sol-do-oriente.vercel.app/requests
```

## 📊 Monitoramento em Tempo Real

### Opção 1: Auto-refresh no Navegador
1. Abra: https://api-sol-do-oriente.vercel.app/requests
2. Use uma extensão de auto-refresh (ex: "Auto Refresh" no Chrome)
3. Configure para atualizar a cada 2-5 segundos

### Opção 2: Script JavaScript
Crie um arquivo HTML local:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Monitor API Sol do Oriente</title>
  <meta http-equiv="refresh" content="3">
</head>
<body>
  <h1>Últimas Requisições</h1>
  <pre id="requests"></pre>
  
  <script>
    fetch('https://api-sol-do-oriente.vercel.app/requests?limit=20')
      .then(r => r.json())
      .then(data => {
        document.getElementById('requests').textContent = 
          JSON.stringify(data, null, 2);
      });
  </script>
</body>
</html>
```

### Opção 3: Usar Postman/Insomnia
Configure uma requisição GET para `/requests` e use o auto-refresh.

## ✅ Checklist de Teste

- [ ] Health check retorna `status: "ok"`
- [ ] Endpoint `/requests` mostra requisições
- [ ] Endpoint `/requests/stats` mostra estatísticas
- [ ] Webhook recebe e processa mensagens
- [ ] Requisições aparecem em tempo real em `/requests`

## 🔍 O que Observar

1. **Timestamp**: Verifique se as requisições estão sendo registradas
2. **Body**: Veja o conteúdo das mensagens recebidas
3. **Response**: Veja como a API respondeu
4. **Status Codes**: Verifique se há erros (500, 400, etc.)

## 💡 Dica

Mantenha a aba `/requests` aberta enquanto testa o webhook para ver as requisições chegando em tempo real!

