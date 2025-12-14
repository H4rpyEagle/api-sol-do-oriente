/**
 * Sistema de log de requisições em memória
 * Armazena as últimas N requisições para visualização em tempo real
 * Também salva logs no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { logger } from './logger.js';

const MAX_REQUESTS = 100; // Máximo de requisições armazenadas
const requests = [];

// Cliente Supabase para salvar logs
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Salva log no Supabase de forma assíncrona (não bloqueia)
 * Retorna uma Promise
 */
async function saveLogToSupabase(requestLog, responseData) {
  try {
    // Determina o tipo de log baseado no path
    let tipo = 'API';
    const path = requestLog.path || requestLog.url || '';
    
    if (path.includes('webhook/messages')) {
      tipo = 'Mensagem';
    } else if (path.includes('health')) {
      tipo = 'Health';
    } else if (path.includes('stats')) {
      tipo = 'Stats';
    } else if (path.includes('webhook')) {
      tipo = 'Webhook';
    }
    
    // Extrai mensagem do body se for webhook de mensagem
    let mensagem = `${requestLog.method} ${path}`;
    
    if (tipo === 'Mensagem' && requestLog.body) {
      try {
        const bodyData = typeof requestLog.body === 'string' 
          ? JSON.parse(requestLog.body) 
          : requestLog.body;
        
        const event = bodyData?.event || bodyData?.data?.event;
        const messageData = bodyData?.data?.message || bodyData?.data?.key;
        const messageText = messageData?.conversation || 
                           messageData?.extendedTextMessage?.text || 
                           messageData?.imageMessage?.caption ||
                           (messageData?.audioMessage ? '🎵 Áudio recebido' : null) ||
                           (messageData?.stickerMessage ? '🎨 Sticker recebido' : null);
        
        if (messageText) {
          mensagem = `[${event || 'Webhook'}] ${messageText}`;
        } else if (event) {
          mensagem = `[${event}] ${requestLog.method} ${path}`;
        }
      } catch (e) {
        // Se não conseguir parsear, usa a mensagem padrão
      }
    }
    
    // Prepara dados para inserção
    // Tenta usar criado_em primeiro, depois created_at (compatibilidade)
    const logData = {
      tipo: tipo,
      mensagem: mensagem.substring(0, 5000), // Limita tamanho da mensagem
      method: requestLog.method,
      path: path,
      body: requestLog.body ? (typeof requestLog.body === 'string' ? requestLog.body : JSON.stringify(requestLog.body)).substring(0, 10000) : null,
      response: responseData ? (typeof responseData === 'string' ? responseData : JSON.stringify(responseData)).substring(0, 10000) : null,
      query_params: requestLog.query && Object.keys(requestLog.query).length > 0 ? requestLog.query : null,
    };
    
    // Adiciona timestamp (tenta ambos os nomes para compatibilidade)
    const timestamp = new Date(requestLog.timestamp);
    logData.criado_em = timestamp.toISOString().replace('T', ' ').substring(0, 19);
    logData.created_at = timestamp.toISOString();
    
    // Remove campos null para não ocupar espaço
    Object.keys(logData).forEach(key => {
      if (logData[key] === null) {
        delete logData[key];
      }
    });
    
    // Salva no Supabase de forma assíncrona (não bloqueia)
    // Retorna Promise para que logRequest possa retornar uma Promise
    return supabase
      .from('logs')
      .insert([logData])
      .then(({ data, error }) => {
        if (error) {
          logger.error('Erro ao salvar log no Supabase:', error);
          logger.error('Código:', error.code);
          logger.error('Mensagem:', error.message);
          logger.error('Detalhes:', error.details);
          logger.error('Dados tentados:', logData);
          throw error; // Lança erro para que o .catch() funcione
        } else {
          logger.debug('Log salvo no Supabase com sucesso:', data?.[0]?.id);
          return data;
        }
      })
      .catch(err => {
        logger.error('Erro ao salvar log no Supabase:', err);
        throw err; // Re-lança para que o .catch() funcione
      });
  } catch (error) {
    // Não bloqueia o fluxo se houver erro ao salvar log
    logger.warn('Erro ao preparar log para Supabase (não crítico):', error.message);
  }
}

/**
 * Adiciona uma requisição ao log
 * Retorna uma Promise para compatibilidade com código que usa .catch()
 */
export function logRequest(req, responseData = null) {
  const requestLog = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin'],
    },
    body: req.body ? JSON.stringify(req.body, null, 2) : null,
    query: req.query,
    response: responseData,
  };

  // Adiciona no início do array
  requests.unshift(requestLog);

  // Mantém apenas as últimas MAX_REQUESTS
  if (requests.length > MAX_REQUESTS) {
    requests.pop();
  }

  // Salva no Supabase de forma assíncrona e retorna Promise
  // Isso permite usar .catch() no código que chama esta função
  return saveLogToSupabase(requestLog, responseData)
    .then(() => requestLog)
    .catch(() => {
      // Erro já foi logado em saveLogToSupabase
      return requestLog; // Retorna mesmo em caso de erro
    });
}

/**
 * Retorna todas as requisições armazenadas
 */
export function getRequests(limit = 50) {
  return requests.slice(0, limit);
}

/**
 * Retorna uma requisição específica por ID
 */
export function getRequestById(id) {
  return requests.find(req => req.id === id);
}

/**
 * Limpa todas as requisições
 */
export function clearRequests() {
  requests.length = 0;
}

/**
 * Retorna estatísticas das requisições
 */
export function getStats() {
  const total = requests.length;
  const byMethod = {};
  const byPath = {};

  requests.forEach(req => {
    byMethod[req.method] = (byMethod[req.method] || 0) + 1;
    byPath[req.path] = (byPath[req.path] || 0) + 1;
  });

  return {
    total,
    byMethod,
    byPath,
    oldest: requests[requests.length - 1]?.timestamp,
    newest: requests[0]?.timestamp,
  };
}

