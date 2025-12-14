import express from 'express';
import { getRequests, getStats } from '../utils/requestLogger.js';

const router = express.Router();

/**
 * GET /dashboard
 * Retorna página HTML para visualizar requisições
 */
router.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - API Sol do Oriente</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2em;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-card .number {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .stat-card .label {
      font-size: 0.9em;
      opacity: 0.9;
    }
    
    .controls {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
    }
    
    .auto-refresh {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .auto-refresh input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    
    .requests-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .request-item {
      border-left: 4px solid #667eea;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      transition: all 0.3s;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .request-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .request-item.webhook {
      border-left-color: #28a745;
      background: #f0fff4;
    }
    
    .request-item.error {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    
    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .request-method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85em;
    }
    
    .method-get {
      background: #17a2b8;
      color: white;
    }
    
    .method-post {
      background: #28a745;
      color: white;
    }
    
    .request-path {
      font-family: 'Courier New', monospace;
      color: #667eea;
      font-weight: 600;
      font-size: 1.1em;
    }
    
    .request-time {
      color: #6c757d;
      font-size: 0.9em;
    }
    
    .request-body {
      background: white;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .request-response {
      background: #e7f3ff;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85em;
    }
    
    .status-200 {
      background: #28a745;
      color: white;
    }
    
    .status-404 {
      background: #ffc107;
      color: #333;
    }
    
    .status-500 {
      background: #dc3545;
      color: white;
    }
    
    .message-steps {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px dashed #dee2e6;
    }
    
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
      background: white;
    }
    
    .step-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8em;
    }
    
    .step-success {
      background: #28a745;
      color: white;
    }
    
    .step-processing {
      background: #ffc107;
      color: #333;
    }
    
    .step-error {
      background: #dc3545;
      color: white;
    }
    
    .step-text {
      flex: 1;
      font-size: 0.9em;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }
    
    .empty-state svg {
      width: 100px;
      height: 100px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: #667eea;
    }
    
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .filter-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 6px 12px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: all 0.3s;
    }
    
    .filter-btn.active {
      background: #667eea;
      color: white;
    }
    
    .filter-btn:hover {
      background: #667eea;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Dashboard - API Sol do Oriente</h1>
      <p>Monitoramento de requisições em tempo real</p>
      
      <div class="stats" id="stats">
        <div class="stat-card">
          <div class="number" id="totalRequests">0</div>
          <div class="label">Total de Requisições</div>
        </div>
        <div class="stat-card">
          <div class="number" id="webhookCount">0</div>
          <div class="label">Webhooks Recebidos</div>
        </div>
        <div class="stat-card">
          <div class="number" id="successCount">0</div>
          <div class="label">Sucessos</div>
        </div>
        <div class="stat-card">
          <div class="number" id="errorCount">0</div>
          <div class="label">Erros</div>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button class="btn btn-primary" onclick="loadRequests()">🔄 Atualizar</button>
      <button class="btn btn-secondary" onclick="clearRequests()">🗑️ Limpar</button>
      
      <div class="auto-refresh">
        <input type="checkbox" id="autoRefresh" onchange="toggleAutoRefresh()">
        <label for="autoRefresh">Auto-refresh (3s)</label>
      </div>
      
      <div class="filter-buttons">
        <button class="filter-btn active" onclick="filterRequests('all')">Todos</button>
        <button class="filter-btn" onclick="filterRequests('webhook')">Webhooks</button>
        <button class="filter-btn" onclick="filterRequests('messages')">Mensagens</button>
        <button class="filter-btn" onclick="filterRequests('errors')">Erros</button>
      </div>
    </div>
    
    <div class="requests-container">
      <div id="requestsList">
        <div class="loading">
          <div class="spinner"></div>
          <p>Carregando requisições...</p>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let autoRefreshInterval = null;
    let currentFilter = 'all';
    let allRequests = [];
    
    function formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    function extractMessageInfo(body) {
      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        if (data.event === 'messages.upsert' || data.event === 'send.message') {
          const messageType = data.data?.messageType || 'unknown';
          const message = data.data?.message || {};
          const key = data.data?.key || {};
          const telefone = key.remoteJid?.split('@')[0] || key.remoteJidAlt?.split('@')[0] || 'Desconhecido';
          
          let messageText = '';
          if (messageType === 'conversation') {
            messageText = message.conversation || '';
          } else if (messageType === 'imageMessage') {
            messageText = message.imageMessage?.caption || '📷 Imagem enviada';
          } else if (messageType === 'audioMessage') {
            messageText = '🎵 Áudio enviado';
          } else {
            messageText = 'Mensagem recebida';
          }
          
          return {
            type: messageType,
            telefone: telefone,
            mensagem: messageText,
            instancia: data.instance || 'Desconhecida',
            fromMe: key.fromMe || false
          };
        }
      } catch (e) {
        return null;
      }
      return null;
    }
    
    function getProcessingSteps(request) {
      const steps = [];
      const messageInfo = extractMessageInfo(request.body);
      
      if (messageInfo) {
        steps.push({
          icon: '📨',
          text: \`Mensagem recebida de \${messageInfo.telefone}\`,
          status: 'success'
        });
        
        steps.push({
          icon: '🔄',
          text: \`Processando mensagem: "\${messageInfo.mensagem.substring(0, 50)}\${messageInfo.mensagem.length > 50 ? '...' : ''}"\`,
          status: 'processing'
        });
        
        if (request.response) {
          try {
            const response = typeof request.response === 'string' 
              ? JSON.parse(request.response) 
              : request.response;
            
            if (response.success) {
              steps.push({
                icon: '✅',
                text: 'Mensagem salva no Supabase com sucesso',
                status: 'success'
              });
            } else {
              steps.push({
                icon: '❌',
                text: \`Erro: \${response.error || 'Erro desconhecido'}\`,
                status: 'error'
              });
            }
          } catch (e) {
            steps.push({
              icon: '✅',
              text: 'Resposta recebida',
              status: 'success'
            });
          }
        }
      }
      
      return steps;
    }
    
    function renderRequest(request) {
      const messageInfo = extractMessageInfo(request.body);
      const isWebhook = request.path === '/' && request.method === 'POST';
      const isError = request.response?.status >= 400 || request.response?.error;
      const steps = getProcessingSteps(request);
      
      let statusClass = '';
      let statusText = '';
      if (request.response?.status) {
        statusClass = \`status-\${request.response.status}\`;
        statusText = request.response.status;
      } else if (request.response?.error) {
        statusClass = 'status-500';
        statusText = 'Erro';
      } else {
        statusClass = 'status-200';
        statusText = '200';
      }
      
      const itemClass = isWebhook ? 'request-item webhook' : 
                       isError ? 'request-item error' : 
                       'request-item';
      
      let bodyPreview = '';
      try {
        const bodyData = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
        bodyPreview = JSON.stringify(bodyData, null, 2);
      } catch (e) {
        bodyPreview = request.body || '{}';
      }
      
      return \`
        <div class="\${itemClass}" data-type="\${isWebhook ? 'webhook' : 'other'}" data-message="\${messageInfo ? 'yes' : 'no'}">
          <div class="request-header">
            <div>
              <span class="request-method method-\${request.method.toLowerCase()}">\${request.method}</span>
              <span class="request-path">\${request.path || request.url}</span>
              <span class="status-badge \${statusClass}">\${statusText}</span>
            </div>
            <div class="request-time">\${formatTime(request.timestamp)}</div>
          </div>
          
          \${messageInfo ? \`
            <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <strong>💬 Mensagem Recebida:</strong><br>
              <strong>Telefone:</strong> \${messageInfo.telefone}<br>
              <strong>Instância:</strong> \${messageInfo.instancia}<br>
              <strong>Remetente:</strong> \${messageInfo.fromMe ? 'Agente' : 'Cliente'}<br>
              <strong>Mensagem:</strong> "\${messageInfo.mensagem}"
            </div>
          \` : ''}
          
          \${steps.length > 0 ? \`
            <div class="message-steps">
              <strong>📋 Etapas de Processamento:</strong>
              \${steps.map(step => \`
                <div class="step">
                  <div class="step-icon step-\${step.status}">\${step.icon}</div>
                  <div class="step-text">\${step.text}</div>
                </div>
              \`).join('')}
            </div>
          \` : ''}
          
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: 600; color: #667eea;">📄 Ver detalhes completos</summary>
            <div class="request-body">\${bodyPreview}</div>
            \${request.response ? \`
              <div class="request-response">
                <strong>Resposta:</strong><br>
                \${JSON.stringify(request.response, null, 2)}
              </div>
            \` : ''}
          </details>
        </div>
      \`;
    }
    
    function filterRequests(type) {
      currentFilter = type;
      
      // Atualiza botões
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      displayRequests();
    }
    
    function displayRequests() {
      const container = document.getElementById('requestsList');
      
      if (allRequests.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3>Nenhuma requisição encontrada</h3>
            <p>As requisições aparecerão aqui quando chegarem</p>
          </div>
        \`;
        return;
      }
      
      let filtered = allRequests;
      
      if (currentFilter === 'webhook') {
        filtered = allRequests.filter(r => r.path === '/' && r.method === 'POST');
      } else if (currentFilter === 'messages') {
        filtered = allRequests.filter(r => {
          const info = extractMessageInfo(r.body);
          return info !== null;
        });
      } else if (currentFilter === 'errors') {
        filtered = allRequests.filter(r => 
          r.response?.status >= 400 || r.response?.error
        );
      }
      
      container.innerHTML = filtered.map(renderRequest).join('');
      
      // Atualiza estatísticas
      updateStats();
    }
    
    function updateStats() {
      const webhooks = allRequests.filter(r => r.path === '/' && r.method === 'POST').length;
      const messages = allRequests.filter(r => extractMessageInfo(r.body) !== null).length;
      const errors = allRequests.filter(r => 
        r.response?.status >= 400 || r.response?.error
      ).length;
      const success = allRequests.length - errors;
      
      document.getElementById('totalRequests').textContent = allRequests.length;
      document.getElementById('webhookCount').textContent = webhooks;
      document.getElementById('successCount').textContent = success;
      document.getElementById('errorCount').textContent = errors;
    }
    
    async function loadRequests() {
      try {
        const response = await fetch('/requests?limit=100');
        const data = await response.json();
        
        if (data.success && data.requests) {
          allRequests = data.requests;
          displayRequests();
        }
      } catch (error) {
        console.error('Erro ao carregar requisições:', error);
        document.getElementById('requestsList').innerHTML = \`
          <div class="empty-state">
            <h3>❌ Erro ao carregar requisições</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      }
    }
    
    async function clearRequests() {
      if (!confirm('Tem certeza que deseja limpar todas as requisições?')) {
        return;
      }
      
      try {
        await fetch('/requests', { method: 'DELETE' });
        allRequests = [];
        displayRequests();
      } catch (error) {
        console.error('Erro ao limpar requisições:', error);
      }
    }
    
    function toggleAutoRefresh() {
      const checkbox = document.getElementById('autoRefresh');
      
      if (checkbox.checked) {
        autoRefreshInterval = setInterval(loadRequests, 3000);
      } else {
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
        }
      }
    }
    
    // Carrega requisições ao carregar a página
    loadRequests();
    
    // Limpa intervalo ao sair da página
    window.addEventListener('beforeunload', () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    });
  </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

export default router;

