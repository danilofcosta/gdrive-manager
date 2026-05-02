import fs from 'fs';
import mime from 'mime-types';

/**
 * Atualiza ou renomeia um arquivo no Google Drive.
 *
 *  Funcionalidades:
 * - Permite buscar por ID ou nome
 * - Pode alterar o nome do arquivo
 * - Pode substituir o conteúdo do arquivo
 * - Pode fazer as duas coisas ao mesmo tempo
 *
 * @param drive - Instância autenticada do Google Drive
 * @param identifier - ID do arquivo OU nome do arquivo
 * @param options.filePath - Novo arquivo local (opcional)
 * @param options.newFileName - Novo nome do arquivo (opcional)
 * @param options.parentId - Pasta onde buscar (obrigatório se usar nome)
 *
 * @returns ID do arquivo atualizado ou null em caso de erro
 *
 * @example
 * // Renomear
 * await updateDriveFile(drive, 'fileId123', {
 *   newFileName: 'novo-nome.png'
 * });
 *
 * @example
 * // Substituir conteúdo
 * await updateDriveFile(drive, 'fileId123', {
 *   filePath: './novo-arquivo.png'
 * });
 *
 * @example
 * // Buscar por nome e atualizar
 * await updateDriveFile(drive, 'imagem.png', {
 *   parentId: 'PASTA_ID',
 *   newFileName: 'imagem-nova.png',
 *   filePath: './nova.png'
 * });
 */
export async function updateDriveFile(
  drive: any,
  identifier: string,
  options: {
    filePath?: string;
    newFileName?: string;
    parentId?: string;
  }
): Promise<string | null> {
  try {
    let fileId = identifier;

    // 🔍 Se não parece ID, tenta buscar por nome
    const isId = identifier.length > 20; // heurística simples

    if (!isId) {
      if (!options.parentId) {
        throw new Error('parentId é obrigatório quando buscar por nome');
      }

      const safeName = identifier.replace(/'/g, "\\'");

      const listRes = await drive.files.list({
        q: `name = '${safeName}' and '${options.parentId}' in parents and trashed = false`,
        fields: 'files(id)',
      });

      if (!listRes.data.files || listRes.data.files.length === 0) {
        throw new Error(`Arquivo "${identifier}" não encontrado`);
      }

      fileId = listRes.data.files[0].id;
    }

    const requestBody: any = {};
    let media: any = undefined;

    // ✏️ Renomear
    if (options.newFileName) {
      requestBody.name = options.newFileName;
    }

    // 🔁 Atualizar conteúdo
    if (options.filePath) {
      const fileName = options.newFileName || identifier;
      const mimeType = mime.lookup(fileName) || 'application/octet-stream';

      media = {
        mimeType,
        body: fs.createReadStream(options.filePath),
      };
    }

    // 🚀 Atualiza no Drive
    const response = await drive.files.update({
      fileId,
      requestBody,
      media,
      fields: 'id',
    });

    console.log(`✅ Arquivo atualizado: ${fileId}`);
    return response.data.id;
  } catch (error) {
    console.error(`❌ Erro ao atualizar arquivo ${identifier}:`, error);
    return null;
  }
}