# Início Rápido - API Sol do Oriente

## 1. Instalação

```bash
cd api-sol-do-oriente
npm install
```

## 2. Configuração

1. Copie `env.example.txt` para `.env`:
```bash
cp env.example.txt .env
```

2. Edite o arquivo `.env` e configure:
   - `SUPABASE_SERVICE_ROLE_KEY`: Sua chave de service role do Supabase

## 3. Banco de Dados

Execute este SQL no Supabase para adicionar a coluna de imagem (se ainda não existir):

```sql
ALTER TABLE public."Mensagens" 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;
```

Ou execute o arquivo `add_imagem_url_column.sql` no SQL Editor do Supabase.

## 4. Executar

```bash
npm run dev
```

A API estará rodando em `http://localhost:3000`

## 5. Configurar Webhook na Evolution API

Configure o webhook da Evolution API para apontar para:

```
http://seu-servidor:3000/webhook/messages
```

## 6. Testar

### Health Check
```bash
curl http://localhost:3000/health
```

### Testar Webhook (exemplo)
```bash
curl -X POST http://localhost:3000/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "instancia1",
    "server_url": "https://evolution-api.com",
    "apikey": "sua-api-key",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "message-id"
      },
      "messageType": "conversation",
      "message": {
        "conversation": "Olá, esta é uma mensagem de teste"
      }
    }
  }'
```

## Estrutura de Dados Esperada

O webhook espera receber dados no formato da Evolution API:

```json
{
  "event": "messages.upsert" | "send.message",
  "instance": "nome-da-instancia",
  "server_url": "https://evolution-api.com",
  "apikey": "sua-api-key",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "remoteJidAlt": "5511999999999@lid",
      "fromMe": false,
      "id": "message-id"
    },
    "messageType": "conversation" | "imageMessage" | "audioMessage",
    "message": {
      "conversation": "texto da mensagem",
      "imageMessage": {
        "caption": "legenda da imagem"
      }
    }
  }
}
```

## Tipos de Mensagem Suportados

- ✅ **conversation**: Mensagens de texto
- ✅ **imageMessage**: Imagens (salvas no MinIO)
- ✅ **audioMessage**: Áudios (transcritos com Groq API)

## Logs

A API gera logs coloridos no console:
- 🟢 **SUCCESS**: Operações bem-sucedidas
- 🔵 **INFO**: Informações gerais
- 🟡 **WARN**: Avisos
- 🔴 **ERROR**: Erros

