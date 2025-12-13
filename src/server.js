import express from 'express';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Rotas
app.use('/webhook', webhookRoutes);
app.use('/health', healthRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'API Sol do Oriente',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      webhook: '/webhook/messages',
      health: '/health',
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: config.server.nodeEnv === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
  });
});

// Inicia servidor
const server = app.listen(config.server.port, () => {
  logger.success(`🚀 API Sol do Oriente rodando na porta ${config.server.port}`);
  logger.info(`📡 Health check: http://localhost:${config.server.port}/health`);
  logger.info(`📨 Webhook: http://localhost:${config.server.port}/webhook/messages`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`👋 ${signal} recebido. Fechando servidor...`);
  server.close(() => {
    logger.success('✅ Servidor fechado.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

