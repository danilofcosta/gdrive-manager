/**
 * Cria pastas no Google Drive com suporte a estrutura aninhada.
 *
 *  Funcionalidades:
 * - Aceita caminhos como "pastaA/pastaB/pastaC"
 * - Cria cada nível automaticamente se não existir
 * - Evita duplicação em cada nível
 * - Usa "root" como padrão se não informar parentId
 *
 * @param drive - Instância autenticada da API do Google Drive
 * @param folderPath - Caminho da pasta (ex: "A/B/C")
 * @param parentId - ID da pasta pai inicial (opcional)
 *
 * @returns ID da última pasta criada/encontrada ou null em caso de erro
 *
 * @example
 * const id = await createDriveFolderPath(
 *   drive,
 *   'Clientes/2026/João'
 * );
 *
 * console.log(id);
 */
export async function createDriveFolderPath(
  drive: any,
  folderPath: string,
  parentId?: string
): Promise<string | null> {
  try {
    const folders = folderPath.split('/').filter(Boolean);
    let currentParent = parentId ?? 'root';

    for (const folderName of folders) {
      // Escapa aspas simples pra não quebrar a query
      const safeName = folderName.replace(/'/g, "\\'");

      // Verifica se já existe no nível atual
      const listRes = await drive.files.list({
        q: `name = '${safeName}' and '${currentParent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)',
      });

      if (listRes.data.files && listRes.data.files.length > 0) {
        currentParent = listRes.data.files[0].id;
        continue;
      }

      // Cria a pasta se não existir
      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentParent],
        },
        fields: 'id',
      });

      currentParent = response.data.id;
    }

    return currentParent;
  } catch (error) {
    console.error(`Erro ao criar caminho ${folderPath}:`, error);
    return null;
  }
}