import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Salva uma mensagem na tabela Mensagens
 */
export async function saveMessage(messageData) {
  try {
    const { data, error } = await supabase
      .from('Mensagens')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      logger.error('Erro ao salvar mensagem no Supabase:', error);
      throw error;
    }

    logger.success('Mensagem salva com sucesso:', data.id);
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

