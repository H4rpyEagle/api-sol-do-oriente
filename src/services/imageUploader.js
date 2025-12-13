import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { base64ToBuffer, generateFileName, generateFilePath } from '../utils/helpers.js';

// Configuração do cliente S3 (MinIO é compatível com S3)
const s3Client = new S3Client({
  endpoint: config.minio.useSSL 
    ? `https://${config.minio.endpoint}` 
    : `http://${config.minio.endpoint}`,
  region: config.minio.region,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
  forcePathStyle: true, // Necessário para MinIO
});

/**
 * Faz upload de uma imagem para o MinIO
 * @param {string} base64Image - Imagem em base64
 * @param {string} telefone - Número de telefone
 * @returns {Promise<string>} - URL pública da imagem
 */
export async function uploadImageToMinIO(base64Image, telefone) {
  try {
    logger.info(`Iniciando upload de imagem para telefone: ${telefone}`);

    // Converte base64 para Buffer
    const imageBuffer = base64ToBuffer(base64Image);

    // Gera nome do arquivo e caminho
    const fileName = generateFileName(telefone, 'jpg');
    const filePath = generateFilePath(telefone, fileName);

    logger.debug(`Caminho do arquivo: ${filePath}`);

    // Faz upload para MinIO
    const command = new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: filePath,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);

    // Gera URL pública
    const publicUrl = `https://${config.minio.endpoint}/${config.minio.bucket}/${filePath}`;

    logger.success(`Imagem enviada com sucesso: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    logger.error('Erro ao fazer upload da imagem no MinIO:', error);
    throw error;
  }
}

/**
 * Verifica conexão com MinIO
 */
export async function checkMinIOConnection() {
  try {
    // Tenta listar buckets para verificar conexão
    const { ListBucketsCommand } = await import('@aws-sdk/client-s3');
    const command = new ListBucketsCommand({});
    await s3Client.send(command);
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

