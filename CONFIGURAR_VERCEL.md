# ⚙️ Configurar Variáveis de Ambiente no Vercel

## 🚨 Erro Atual

O erro que você está vendo é porque as variáveis de ambiente não estão configuradas no Vercel.

## 📝 Passo a Passo

### 1. Acesse o Dashboard do Vercel

1. Vá em: https://vercel.com/dashboard
2. Clique no projeto **api-sol-do-oriente**
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### 2. Adicione as Variáveis

Adicione cada uma das variáveis abaixo. **IMPORTANTE**: Selecione os ambientes **Production**, **Preview** e **Development**.

#### Variáveis Obrigatórias:

| Nome da Variável | Valor | Descrição |
|-----------------|-------|-----------|
| `SUPABASE_URL` | `https://supabase.soldooriente.online` | URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `sua_chave_service_role_aqui` | Chave de service role do Supabase |
| `GROQ_API_KEY` | `sua_chave_groq_aqui` | Chave da API Groq |
| `MINIO_ENDPOINT` | `s3.soldooriente.online` | Endpoint do MinIO |
| `MINIO_ACCESS_KEY` | `admin` | Chave de acesso do MinIO |
| `MINIO_SECRET_KEY` | `sua_chave_secreta_minio` | Chave secreta do MinIO |
| `MINIO_BUCKET` | `media` | Nome do bucket |
| `MINIO_USE_SSL` | `true` | Usar SSL |
| `MINIO_REGION` | `us-east-1` | Região do MinIO |

### 3. Como Adicionar Cada Variável

Para cada variável:

1. Clique em **Add New** (Adicionar Nova)
2. **Key** (Chave): Digite o nome da variável (ex: `SUPABASE_URL`)
3. **Value** (Valor): Cole o valor correspondente
4. **Environments** (Ambientes): Marque todas as opções:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Clique em **Save** (Salvar)

### 4. Após Adicionar Todas as Variáveis

1. Vá em **Deployments** (Implantações)
2. Clique nos **3 pontinhos** (⋯) do último deployment
3. Clique em **Redeploy** (Reimplantar)
4. Ou faça um novo commit/push para triggerar um novo deploy

## ✅ Verificar se Funcionou

Após reimplantar, teste:

```bash
curl https://api-sol-do-oriente.vercel.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "supabase": { "connected": true },
    "minio": { "connected": true }
  }
}
```

## 🔐 Onde Encontrar as Chaves

### SUPABASE_SERVICE_ROLE_KEY

1. Acesse: https://supabase.soldooriente.online
2. Vá em **Settings** → **API**
3. Copie a **service_role key** (secret) - **CUIDADO**: Esta chave tem acesso total!

### Outras Chaves

- **GROQ_API_KEY**: Use a chave que você já tem configurada
- **MINIO**: Use as credenciais do seu MinIO

## 📋 Checklist

- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `GROQ_API_KEY` configurada
- [ ] `MINIO_ENDPOINT` configurada
- [ ] `MINIO_ACCESS_KEY` configurada
- [ ] `MINIO_SECRET_KEY` configurada
- [ ] `MINIO_BUCKET` configurada
- [ ] `MINIO_USE_SSL` configurada
- [ ] `MINIO_REGION` configurada
- [ ] Todas marcadas para Production, Preview e Development
- [ ] Deployment refeito após adicionar variáveis

## 🚀 Após Configurar

O webhook estará disponível em:

```
https://api-sol-do-oriente.vercel.app/webhook/messages
```

Ou a URL que aparecer no dashboard do Vercel.

