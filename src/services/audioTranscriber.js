import fetch from 'node-fetch';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { base64ToBuffer } from '../utils/helpers.js';

/**
 * Transcreve um áudio usando Groq API
 * @param {string} base64Audio - Áudio em base64
 * @returns {Promise<string>} - Texto transcrito
 */
export async function transcribeAudio(base64Audio) {
  try {
    logger.info('Iniciando transcrição de áudio...');

    // Converte base64 para Buffer
    const audioBuffer = base64ToBuffer(base64Audio);

    // Cria um FormData para enviar o arquivo
    const { default: FormData } = await import('form-data');
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.ogg',
      contentType: 'audio/ogg',
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0.5');
    formData.append('response_format', 'json');
    formData.append('language', 'pt');

    // Faz requisição para Groq API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Erro na API Groq: ${response.status} - ${errorText}`);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const transcribedText = result.text || '';

    logger.success(`Áudio transcrito: ${transcribedText.substring(0, 50)}...`);
    return transcribedText;
  } catch (error) {
    logger.error('Erro ao transcrever áudio:', error);
    throw error;
  }
}

