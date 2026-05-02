import fs from 'fs';
import mime from 'mime-types';

/**
 * Faz upload de um arquivo para o Google Drive.
 *
 * Funcionalidades:
 * - Evita upload duplicado (verifica se já existe pelo nome na pasta)
 * - Detecta automaticamente o MIME type do arquivo
 * - Faz upload via stream (melhor para arquivos grandes)
 *
 * @param drive - Instância autenticada da API do Google Drive
 * @param filePath - Caminho local do arquivo (ex: "./uploads/video.mp4")
 * @param fileName - Nome do arquivo no Drive
 * @param parentId - ID da pasta no Drive (usa "root" se não informado)
 *
 * @returns ID do arquivo no Google Drive ou null em caso de erro
 *
 * @example
 * const fileId = await uploadFile(
 *   drive,
 *   './uploads/image.png',
 *   'image.png',
 *   'PASTA_ID'
 * );
 *
 * console.log(fileId);
 */
export async function createDriveFile(
  drive: any,
  filePath: string,
  fileName: string,
  parentId?: string
): Promise<string | null> {
  try {
    const parent = parentId ?? 'root';

    // Verifica se o arquivo já existe para evitar duplicação
    const listRes = await drive.files.list({
      q: `name = '${fileName}' and '${parent}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (listRes.data.files && listRes.data.files.length > 0) {
      console.log(`- Arquivo ${fileName} já existe (ID: ${listRes.data.files[0].id})`);
      return listRes.data.files[0].id;
    }

    // Detecta automaticamente o MIME type com base na extensão
    const mimeType = mime.lookup(fileName) || 'application/octet-stream';

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [parent],
      },
      media: {
        mimeType,
        body: fs.createReadStream(filePath),
      },
      fields: 'id',
    });

    console.log(`✅ Arquivo enviado: ${fileName} (${response.data.id})`);
    return response.data.id;
  } catch (error) {
    console.error(`❌ Erro ao enviar arquivo ${fileName}:`, error);
    return null;
  }
}