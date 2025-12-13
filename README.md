# API Sol do Oriente

API para processamento de mensagens do WhatsApp, integrada com Supabase, MinIO e Groq API.

## Funcionalidades

- ✅ Recebimento de webhooks da Evolution API
- ✅ Processamento de mensagens de texto
- ✅ Transcrição de áudios usando Groq API
- ✅ Upload de imagens para MinIO
- ✅ Salvamento de mensagens no Supabase

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `env.example.txt` para `.env`:
```bash
cp env.example.txt .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
   - `SUPABASE_URL`: URL do seu Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role do Supabase
   - `GROQ_API_KEY`: Chave da API Groq (já configurada)
   - `MINIO_*`: Configurações do MinIO (já configuradas)

3. **Importante**: Execute o SQL `add_imagem_url_column.sql` no Supabase para adicionar a coluna `imagem_url` na tabela `Mensagens` (necessária para salvar URLs de imagens).

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints

### POST /webhook/messages
Recebe webhooks da Evolution API com mensagens do WhatsApp.

### GET /health
Health check da API.

## Estrutura

```
api-sol-do-oriente/
├── src/
│   ├── server.js              # Servidor principal
│   ├── routes/
│   │   ├── webhooks.js        # Rotas de webhook
│   │   └── health.js          # Health check
│   ├── services/
│   │   ├── messageProcessor.js    # Processa mensagens
│   │   ├── imageUploader.js      # Upload de imagens no MinIO
│   │   ├── audioTranscriber.js   # Transcrição de áudios
│   │   └── supabaseService.js    # Cliente Supabase
│   └── utils/
│       ├── logger.js              # Sistema de logs
│       └── helpers.js            # Funções auxiliares
├── .env.example
├── package.json
└── README.md
```

