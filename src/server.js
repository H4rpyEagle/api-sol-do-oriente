import express from 'express';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';
import requestsRoutes from './routes/requests.js';
import { logRequest } from './utils/requestLogger.js';

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

// Middleware para logar requisições (exceto /requests para evitar loop)
app.use((req, res, next) => {
  // Não loga requisições para /requests para evitar loop infinito
  if (!req.path.startsWith('/requests')) {
    // Loga após a resposta ser enviada
    const originalJson = res.json;
    const originalSend = res.send;
    
    res.json = function(data) {
      const responseData = {
        status: res.statusCode,
        body: typeof data === 'string' ? data : JSON.stringify(data),
      };
      // Chama logRequest de forma assíncrona
      logRequest(req, responseData).catch(err => {
        console.error('Erro ao logar requisição:', err);
      });
      return originalJson.call(this, data);
    };
    
    res.send = function(data) {
      if (res.headersSent) return originalSend.call(this, data);
      const responseData = {
        status: res.statusCode,
        body: typeof data === 'string' ? data : JSON.stringify(data),
      };
      // Chama logRequest de forma assíncrona
      logRequest(req, responseData).catch(err => {
        console.error('Erro ao logar requisição:', err);
      });
      return originalSend.call(this, data);
    };
  }
  next();
});

// Rotas
app.use('/webhook', webhookRoutes);
app.use('/health', healthRoutes);
app.use('/requests', requestsRoutes);

// Rota POST na raiz para receber webhooks da Evolution API
// A Evolution API está configurada para enviar para https://mensagem.soldooriente.online/
app.post('/', async (req, res) => {
  // Importa e usa o mesmo handler do webhook
  const { processMessage } = await import('./services/messageProcessor.js');
  const { logRequest } = await import('./utils/requestLogger.js');
  
  try {
    logger.info('Webhook recebido na raiz:', {
      event: req.body?.event,
      messageType: req.body?.data?.messageType,
    });

    // Verifica se tem dados de mensagem
    if (!req.body || !req.body.event) {
      logger.warn('Webhook recebido sem dados válidos:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Dados do webhook inválidos',
      });
    }

    // Responde imediatamente para não fazer a Evolution API esperar
    const response = {
      success: true,
      message: 'Webhook recebido e em processamento',
    };

    res.status(200).json(response);

    // Registra a requisição após responder (assíncrono)
    logRequest(req, response).catch(err => {
      logger.error('Erro ao logar requisição:', err);
    });

    // Processa a mensagem de forma assíncrona
    processMessage({ body: req.body })
      .then(result => {
        logger.success('Mensagem processada com sucesso:', result);
      })
      .catch(error => {
        logger.error('Erro ao processar mensagem:', error);
        logger.error('Stack trace:', error.stack);
        logger.error('Body recebido:', JSON.stringify(req.body, null, 2));
        // Tenta salvar o erro também
        logRequest(req, { 
          error: error.message, 
          stack: error.stack,
          status: 500 
        }).catch(() => {});
      });
  } catch (error) {
    logger.error('Erro no webhook raiz:', error);
    const errorResponse = {
      success: false,
      error: 'Erro ao processar webhook',
    };
    res.status(500).json(errorResponse);
    logRequest(req, errorResponse);
  }
});

// Rota GET na raiz
app.get('/', (req, res) => {
  const response = {
    name: 'API Sol do Oriente',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      webhook: '/webhook/messages',
      webhookRoot: 'POST /',
      health: '/health',
      requests: '/requests',
      requestsStats: '/requests/stats',
    },
  };
  res.json(response);
  logRequest(req, response);
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: config.server.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Rota catch-all para webhooks (antes do 404)
// Algumas configurações podem enviar para /webhook diretamente
// Isso já é coberto pelo router.use('/webhook', webhookRoutes) acima

// 404 handler
app.use((req, res) => {
  logger.warn(`Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /requests',
      'POST /webhook/messages',
    ],
  });
});

// Exporta para Vercel (serverless)
export default app;

// Inicia servidor apenas se não estiver no Vercel
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
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
}

