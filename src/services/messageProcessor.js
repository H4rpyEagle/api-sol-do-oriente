import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { extractPhoneNumber, getCurrentTimestamp } from '../utils/helpers.js';
import { saveMessage } from './supabaseService.js';
import { uploadImageToMinIO } from './imageUploader.js';
import { transcribeAudio } from './audioTranscriber.js';

/**
 * Obtém o base64 de uma mídia da Evolution API
 */
async function getMediaBase64(serverUrl, instance, apikey, messageId) {
  const maxRetries = 5;
  const retryDelay = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Tentativa ${attempt}/${maxRetries} de obter mídia: ${messageId}`);

      const response = await fetch(
        `${serverUrl}/chat/getBase64FromMediaMessage/${instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apikey,
          },
          body: JSON.stringify({
            'message.key.id': messageId,
          }),
        }
      );

      if (!response.ok) {
        if (attempt < maxRetries && response.status >= 500) {
          logger.warn(`Erro ${response.status}, tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.base64;
    } catch (error) {
      if (attempt === maxRetries) {
        logger.error('Erro ao obter mídia após todas as tentativas:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Processa uma mensagem de texto
 */
async function processTextMessage(webhookData) {
  try {
    const { body } = webhookData;
    const key = body.data?.key || {};
    const telefone = extractPhoneNumber(key);
    const instancia = body.instance;
    const mensagem = body.data?.message?.conversation || '';

    logger.info(`Extraindo dados - Telefone: ${telefone}, Instância: ${instancia}, Mensagem: ${mensagem.substring(0, 50)}...`);

    if (!telefone) {
      logger.warn('Não foi possível extrair o número de telefone');
      logger.warn('Key recebido:', JSON.stringify(key, null, 2));
      throw new Error('Telefone não encontrado no webhook');
    }

    if (!instancia) {
      logger.warn('Instância não encontrada no webhook');
    }

    const messageData = {
      telefone,
      instancia: instancia || 'desconhecida',
      remetente: body.data?.key?.fromMe ? 'Agente' : 'Cliente',
      mensagem: mensagem || '',
      criado_em: getCurrentTimestamp(),
    };

    logger.info('Salvando mensagem no Supabase:', messageData);
    const saved = await saveMessage(messageData);
    logger.success(`Mensagem de texto salva com sucesso! ID: ${saved.id}, Telefone: ${telefone}`);
  } catch (error) {
    logger.error('Erro ao processar mensagem de texto:', error);
    throw error;
  }
}

/**
 * Processa uma mensagem de imagem
 */
async function processImageMessage(webhookData) {
  const { body } = webhookData;
  const key = body.data?.key || {};
  const telefone = extractPhoneNumber(key);
  const instancia = body.instance;
  const messageId = key.id;
  const caption = body.data?.message?.imageMessage?.caption || '';

  if (!telefone) {
    logger.warn('Não foi possível extrair o número de telefone');
    return;
  }

  try {
    // Obtém o base64 da imagem
    const base64Image = await getMediaBase64(
      body.server_url,
      instancia,
      body.apikey,
      messageId
    );

    if (!base64Image) {
      throw new Error('Base64 da imagem não encontrado');
    }

    // Faz upload para MinIO
    const imageUrl = await uploadImageToMinIO(base64Image, telefone);

    // Salva mensagem no Supabase
    // Nota: imagem_url não está na tabela, então não incluímos
    // Se precisar salvar a URL da imagem, adicione a coluna na tabela primeiro
    const messageData = {
      telefone,
      instancia,
      remetente: body.data?.key?.fromMe ? 'Agente' : 'Cliente',
      mensagem: caption || `Imagem enviada: ${imageUrl}`, // Inclui URL da imagem na mensagem
      criado_em: getCurrentTimestamp(),
    };

    await saveMessage(messageData);
    logger.success(`Mensagem com imagem processada: ${telefone}`);
  } catch (error) {
    logger.error('Erro ao processar mensagem de imagem:', error);
    throw error;
  }
}

/**
 * Processa uma mensagem de áudio
 */
async function processAudioMessage(webhookData) {
  const { body } = webhookData;
  const key = body.data?.key || {};
  const telefone = extractPhoneNumber(key);
  const instancia = body.instance;
  const messageId = key.id;

  if (!telefone) {
    logger.warn('Não foi possível extrair o número de telefone');
    return;
  }

  try {
    // Obtém o base64 do áudio
    const base64Audio = await getMediaBase64(
      body.server_url,
      instancia,
      body.apikey,
      messageId
    );

    if (!base64Audio) {
      throw new Error('Base64 do áudio não encontrado');
    }

    // Transcreve o áudio
    const transcribedText = await transcribeAudio(base64Audio);

    // Salva mensagem no Supabase com transcrição
    const messageData = {
      telefone,
      instancia,
      remetente: body.data?.key?.fromMe ? 'Agente' : 'Cliente',
      mensagem: `Áudio transcrito: ${transcribedText}`,
      criado_em: getCurrentTimestamp(),
    };

    await saveMessage(messageData);
    logger.success(`Mensagem de áudio processada: ${telefone}`);
  } catch (error) {
    logger.error('Erro ao processar mensagem de áudio:', error);
    throw error;
  }
}

/**
 * Processa uma mensagem recebida via webhook
 */
export async function processMessage(webhookData) {
  try {
    const { body } = webhookData;
    const event = body.event;
    const messageType = body.data?.messageType;

    logger.info(`Processando evento: ${event}, tipo: ${messageType}`);
    logger.debug('Body completo:', JSON.stringify(body, null, 2));

    // Só processa eventos de mensagens
    if (event !== 'messages.upsert' && event !== 'send.message') {
      logger.warn(`Evento ignorado: ${event}`);
      return { processed: false, reason: 'Evento não suportado' };
    }

    // Processa baseado no tipo de mensagem
    let result;
    switch (messageType) {
      case 'conversation':
        logger.info('Processando mensagem de texto...');
        await processTextMessage(webhookData);
        result = { processed: true, type: 'text' };
        break;

      case 'imageMessage':
        logger.info('Processando mensagem de imagem...');
        await processImageMessage(webhookData);
        result = { processed: true, type: 'image' };
        break;

      case 'audioMessage':
        logger.info('Processando mensagem de áudio...');
        await processAudioMessage(webhookData);
        result = { processed: true, type: 'audio' };
        break;

      default:
        logger.warn(`Tipo de mensagem não suportado: ${messageType}`);
        // Tenta processar como texto se tiver conversation
        if (body.data?.message?.conversation) {
          logger.info('Tentando processar como texto (fallback)...');
          await processTextMessage(webhookData);
          result = { processed: true, type: 'text', fallback: true };
        } else {
          result = { processed: false, reason: `Tipo não suportado: ${messageType}` };
        }
        break;
    }

    logger.success('Mensagem processada:', result);
    return result;
  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    logger.error('Stack trace:', error.stack);
    logger.error('Webhook data:', JSON.stringify(webhookData, null, 2));
    throw error;
  }
}

