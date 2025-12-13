import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET || 'media',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    region: process.env.MINIO_REGION || 'us-east-1',
  },
};

// Validação de variáveis obrigatórias
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
  
  // No Vercel, apenas loga o erro mas não encerra o processo
  // As variáveis podem ser configuradas depois e o deploy será refeito
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.error('⚠️ Configure as variáveis de ambiente no dashboard do Vercel');
    console.error('📖 Veja o arquivo CONFIGURAR_VERCEL.md para instruções');
  } else {
    console.error('Por favor, configure o arquivo .env');
    process.exit(1);
  }
}

