/**
 * Remove (ou envia para lixeira) um arquivo OU pasta no Google Drive.
 *
 * Funcionalidades:
 * - Funciona para arquivos e pastas
 * - Aceita ID ou nome
 * - Suporte a deleção:
 *    - Soft delete (lixeira)
 *    - Hard delete (permanente)
 *
 *  Observações:
 * - Pastas são tratadas como arquivos no Drive
 * - Deletar uma pasta remove TODO o conteúdo (especialmente no permanente)
 *
 * @param drive - Instância autenticada do Google Drive
 * @param identifier - ID ou nome do arquivo/pasta
 * @param options.parentId - Pasta onde buscar (obrigatório se usar nome)
 * @param options.permanent - Se true, deleta permanentemente
 *
 * @returns true se sucesso, false se erro
 */
export async function deleteDriveItem(
  drive: any,
  identifier: string,
  options?: {
    parentId?: string;
    permanent?: boolean;
  }
): Promise<boolean> {
  try {
    let fileId = identifier;

    const isId = identifier.length > 20;

    // 🔍 Buscar por nome (se não for ID)
    if (!isId) {
      if (!options?.parentId) {
        throw new Error('parentId é obrigatório quando buscar por nome');
      }

      const safeName = identifier.replace(/'/g, "\\'");

      const listRes = await drive.files.list({
        q: `name = '${safeName}' and '${options.parentId}' in parents and trashed = false`,
        fields: 'files(id, mimeType)',
      });

      if (!listRes.data.files || listRes.data.files.length === 0) {
        throw new Error(`Item "${identifier}" não encontrado`);
      }

      fileId = listRes.data.files[0].id;
    }

    // 🗑️ Soft delete (lixeira)
    if (!options?.permanent) {
      await drive.files.update({
        fileId,
        requestBody: {
          trashed: true,
        },
      });

      console.log(`Movido para lixeira: ${fileId}`);
      return true;
    }

    // ❌ Hard delete (permanente)
    await drive.files.delete({
      fileId,
    });

    console.log(`❌ Deletado permanentemente: ${fileId}`);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao deletar ${identifier}:`, error);
    return false;
  }
}