/**
 * Sistema de log de requisições em memória
 * Armazena as últimas N requisições para visualização em tempo real
 */

const MAX_REQUESTS = 100; // Máximo de requisições armazenadas
const requests = [];

/**
 * Adiciona uma requisição ao log
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

  return requestLog;
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

