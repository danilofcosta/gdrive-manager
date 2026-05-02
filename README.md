# gdrive-manager 🚀

Um módulo simples e eficiente para gerenciar arquivos e pastas no Google Drive usando TypeScript.

## 📦 Instalação

Como este é um módulo local, você pode instalá-lo em outros projetos apontando para a pasta:

```bash
npm install ../caminho-para/gdrive-manager
```
```bash
npm install https://github.com/usuario/repositorio.git
```

Ou simplesmente copie os arquivos para o seu projeto. Certifique-se de ter as dependências instaladas:

```bash
npm install googleapis mime-types
```

## 🔐 Configuração do Google Cloud

Para usar este módulo, você precisa de um arquivo `client_secret.json` obtido no [Google Cloud Console](https://console.cloud.google.com/):

1. Crie um projeto.
2. Ative a **Google Drive API**.
3. Configure a tela de consentimento OAuth.
4. Crie credenciais do tipo **ID do cliente OAuth** (escolha "App de Desktop").
5. Baixe o JSON e renomeie para `client_secret.json` na raiz do seu projeto.
6. criar um tela de login basica para autenticar o usuario.
7. incluir o email na lista de usuarios autorizados.

## 🚀 Como usar

### 1. Autenticação

O módulo lida com a autenticação automaticamente. Na primeira vez, ele abrirá uma URL no seu navegador para você autorizar o acesso. O token será salvo em `token.json`.

```typescript
import { authorize } from 'gdrive-manager';

async function main() {
  const drive = await authorize();
  // Agora você pode usar as outras funções
}
```

### 2. Gerenciando Pastas

Você pode criar pastas de forma aninhada (ex: `Pasta A/Pasta B`). Se a pasta já existir, o módulo retornará o ID dela sem criar duplicatas.

```typescript
import { authorize, createDriveFolderPath } from 'gdrive-manager';

const drive = await authorize();
const folderId = await createDriveFolderPath(drive, 'Meus Documentos/Projetos/2026');
console.log('ID da pasta:', folderId);
```

### 3. Upload de Arquivos

O upload detecta automaticamente o tipo de arquivo e evita duplicatas na mesma pasta.

```typescript
import { authorize, createDriveFile } from 'gdrive-manager';

const drive = await authorize();
const fileId = await createDriveFile(
  drive, 
  './documento.pdf', // caminho local
  'documento.pdf',    // nome no drive
  'ID_DA_PASTA'      // opcional (default é root)
);
```

### 4. Atualizar Arquivos

Você pode substituir o conteúdo de um arquivo ou renomeá-lo.

```typescript
import { authorize, updateDriveFile } from 'gdrive-manager';

const drive = await authorize();

// Atualizar conteúdo e nome
await updateDriveFile(drive, 'ID_DO_ARQUIVO', {
  filePath: './versao-nova.pdf',
  newFileName: 'documento-v2.pdf'
});
```

### 5. Deletar Arquivos ou Pastas

Suporta deleção suave (lixeira) ou permanente.

```typescript
import { authorize, deleteDriveItem } from 'gdrive-manager';

const drive = await authorize();

// Mover para lixeira
await deleteDriveItem(drive, 'ID_OU_NOME_DO_ARQUIVO', { parentId: 'ID_PAI' });

// Deletar permanentemente
await deleteDriveItem(drive, 'ID_DO_ARQUIVO', { permanent: true });
```

## 🛠️ Funções Exportadas

| Função | Descrição |
| :--- | :--- |
| `authorize()` | Autentica e retorna a instância do Google Drive. |
| `createDriveFile(...)` | Faz upload de um arquivo para o Drive. |
| `createDriveFolderPath(...)` | Cria uma estrutura de pastas (recursivo). |
| `updateDriveFile(...)` | Atualiza o conteúdo ou nome de um arquivo. |
| `deleteDriveItem(...)` | Remove arquivos ou pastas. |

## 📄 Licença

ISC
