import express from 'express';
import { getRequests, getRequestById, clearRequests, getStats } from '../utils/requestLogger.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /requests
 * Retorna as últimas requisições recebidas
 */
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const requests = getRequests(limit);

    res.json({
      success: true,
      total: requests.length,
      requests: requests,
    });
  } catch (error) {
    logger.error('Erro ao buscar requisições:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar requisições',
    });
  }
});

/**
 * GET /requests/stats
 * Retorna estatísticas das requisições
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
    });
  }
});

/**
 * GET /requests/:id
 * Retorna uma requisição específica por ID
 */
router.get('/:id', (req, res) => {
  try {
    const request = getRequestById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Requisição não encontrada',
      });
    }

    res.json({
      success: true,
      request: request,
    });
  } catch (error) {
    logger.error('Erro ao buscar requisição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar requisição',
    });
  }
});

/**
 * DELETE /requests
 * Limpa todas as requisições armazenadas
 */
router.delete('/', (req, res) => {
  try {
    clearRequests();
    res.json({
      success: true,
      message: 'Requisições limpas com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao limpar requisições:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar requisições',
    });
  }
});

export default router;

