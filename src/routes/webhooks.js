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
  try {
    logger.info('Webhook recebido:', {
      event: req.body?.event,
      messageType: req.body?.data?.messageType,
    });

    // Responde imediatamente para não fazer a Evolution API esperar
    const response = {
      success: true,
      message: 'Webhook recebido e em processamento',
    };

    res.status(200).json(response);

    // Registra a requisição após responder
    logRequest(req, response);

    // Processa a mensagem de forma assíncrona
    processMessage({ body: req.body })
      .then(result => {
        logger.success('Mensagem processada com sucesso:', result);
      })
      .catch(error => {
        logger.error('Erro ao processar mensagem:', error);
        logger.error('Stack trace:', error.stack);
        logger.error('Body recebido:', JSON.stringify(req.body, null, 2));
      });
  } catch (error) {
    logger.error('Erro no webhook:', error);
    const errorResponse = {
      success: false,
      error: 'Erro ao processar webhook',
    };
    res.status(500).json(errorResponse);
    logRequest(req, errorResponse);
  }
});

export default router;

