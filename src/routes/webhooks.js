import express from 'express';
import { processMessage } from '../services/messageProcessor.js';
import { logger } from '../utils/logger.js';

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

    // Processa a mensagem de forma assíncrona
    processMessage({ body: req.body })
      .then(result => {
        logger.success('Mensagem processada com sucesso');
      })
      .catch(error => {
        logger.error('Erro ao processar mensagem:', error);
      });

    // Responde imediatamente para não fazer a Evolution API esperar
    res.status(200).json({
      success: true,
      message: 'Webhook recebido e em processamento',
    });
  } catch (error) {
    logger.error('Erro no webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook',
    });
  }
});

export default router;

