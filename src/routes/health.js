import express from 'express';
import { checkConnection as checkSupabase } from '../services/supabaseService.js';
import { checkMinIOConnection } from '../services/imageUploader.js';
import { logger } from '../utils/logger.js';
import { logRequest } from '../utils/requestLogger.js';

const router = express.Router();

/**
 * GET /health
 * Health check da API e suas dependências
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Verifica Supabase
    const supabaseStatus = await checkSupabase();
    health.services.supabase = supabaseStatus;

    // Verifica MinIO
    const minioStatus = await checkMinIOConnection();
    health.services.minio = minioStatus;

    // Verifica se todos os serviços estão funcionando
    const allServicesOk = 
      health.services.supabase?.connected &&
      health.services.minio?.connected;

    if (!allServicesOk) {
      const degradedResponse = {
        ...health,
        status: 'degraded',
      };
      res.status(503).json(degradedResponse);
      logRequest(req, degradedResponse);
      return;
    }

    res.json(health);
    logRequest(req, health);
  } catch (error) {
    logger.error('Erro no health check:', error);
    const errorResponse = {
      status: 'error',
      error: error.message,
    };
    res.status(500).json(errorResponse);
    logRequest(req, errorResponse);
  }
});

export default router;

