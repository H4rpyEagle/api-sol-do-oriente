import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Salva uma mensagem na tabela Mensagens
 * Remove campos que não existem na tabela (como imagem_url se não existir)
 */
export async function saveMessage(messageData) {
  try {
    // Campos permitidos na tabela Mensagens (baseado no schema)
    const allowedFields = ['telefone', 'instancia', 'remetente', 'mensagem', 'criado_em'];
    
    // Filtra apenas os campos que existem na tabela
    const filteredData = {};
    for (const field of allowedFields) {
      if (messageData[field] !== undefined) {
        filteredData[field] = messageData[field];
      }
    }

    logger.info('Dados filtrados para inserção:', filteredData);

    const { data, error } = await supabase
      .from('Mensagens')
      .insert([filteredData])
      .select()
      .single();

    if (error) {
      logger.error('Erro ao salvar mensagem no Supabase:', error);
      logger.error('Código do erro:', error.code);
      logger.error('Mensagem do erro:', error.message);
      logger.error('Detalhes:', error.details);
      logger.error('Hint:', error.hint);
      throw error;
    }

    logger.success('Mensagem salva com sucesso! ID:', data.id);
    logger.debug('Dados salvos:', data);
    return data;
  } catch (error) {
    logger.error('Erro ao salvar mensagem:', error);
    throw error;
  }
}

/**
 * Verifica conexão com Supabase
 */
export async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('Mensagens')
      .select('id')
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

