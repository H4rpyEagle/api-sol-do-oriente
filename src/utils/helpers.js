/**
 * Extrai o número de telefone do objeto key da Evolution API
 */
export function extractPhoneNumber(key) {
  const remoteJid = key?.remoteJid || '';
  const remoteJidAlt = key?.remoteJidAlt || '';

  // 1) PRIORIDADE: remoteJid com @s.whatsapp.net (telefone clássico)
  if (remoteJid && remoteJid.includes('@s.whatsapp.net')) {
    return remoteJid.split('@')[0];
  }

  // 2) Se remoteJid existir e não tiver sufixo estranho, usa ele mesmo
  if (remoteJid && !remoteJid.includes('@')) {
    return remoteJid;
  }

  // 3) COMO ÚLTIMO RECURSO: remoteJidAlt (ex.: 72615733555244@lid)
  if (remoteJidAlt) {
    return remoteJidAlt.split('@')[0];
  }

  return null;
}

/**
 * Gera timestamp atual no formato do Supabase
 */
export function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Converte base64 para Buffer
 */
export function base64ToBuffer(base64String) {
  // Remove data URL prefix se existir
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Gera nome do arquivo para upload
 */
export function generateFileName(telefone, extension = 'jpg') {
  const timestamp = Date.now();
  return `${timestamp}_${telefone}.${extension}`;
}

/**
 * Gera caminho completo do arquivo no MinIO
 */
export function generateFilePath(telefone, fileName) {
  return `mensagens/${telefone}/${fileName}`;
}

