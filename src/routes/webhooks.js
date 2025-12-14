import express from 'express';
import { processMessage } from '../services/messageProcessor.js';
import { logger } from '../utils/logger.js';
import { logRequest } from '../utils/requestLogger.js';

const router = express.Router();

/**
 * POST /webhook/messages
 * Recebe webhooks da Evolution API com mensagens do WhatsApp
 */
router.post('/messages', async (req, res) => {
  await handleWebhook(req, res);
});

/**
 * POST /webhook (catch-all para qualquer path)
 * Algumas configurações da Evolution API podem enviar direto para /webhook
 */
router.post('*', async (req, res) => {
  await handleWebhook(req, res);
});

/**
 * Função centralizada para processar webhooks
 */
async function handleWebhook(req, res) {
  try {
    logger.info('Webhook recebido:', {
      method: req.method,
      path: req.path,
      url: req.url,
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
    logger.error('Erro no webhook:', error);
    logger.error('Path da requisição:', req.path);
    logger.error('URL completa:', req.url);
    const errorResponse = {
      success: false,
      error: 'Erro ao processar webhook',
    };
    res.status(500).json(errorResponse);
    logRequest(req, errorResponse);
  }
}

export default router;

