import { authorize, createDriveFolderPath, createDriveFile } from './index';

async function test() {
  console.log('--- Testando Módulo ---');
  console.log('Verificando se as funções estão disponíveis:');
  
  if (typeof authorize === 'function' && typeof createDriveFolderPath === 'function' && typeof createDriveFile === 'function') {
    console.log(' Funções exportadas com sucesso!');
  } else {
    console.log(' Falha ao encontrar funções exportadas.');
  }

  // Não vamos rodar a autenticação real para não travar o processo, 
  // apenas verificar se os imports funcionam.
}

test().catch(console.error);
