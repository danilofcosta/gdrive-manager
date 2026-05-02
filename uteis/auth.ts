import fs from 'fs';
import path from 'path';
import http from 'http';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive',
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'client_secret.json');

export async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);

  const { client_secret, client_id } =
    credentials.installed || credentials.web;

  const redirectUri = 'http://localhost:3000/oauth2callback';
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  //  Listener automático de atualização de tokens
  oAuth2Client.on('tokens', (tokens) => {
    try {
      let current = {};

      if (fs.existsSync(TOKEN_PATH)) {
        current = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      }

      const updated = {
        ...current,
        ...tokens, // mantém access_token atualizado
      };

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated));
      console.log('🔄 Token atualizado automaticamente');
    } catch (err) {
      console.error('Erro ao atualizar token:', err);
    }
  });

  // Se já tem token salvo
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return google.drive({ version: 'v3', auth: oAuth2Client });
  }

  return getNewToken(oAuth2Client);
}

async function getNewToken(oAuth2Client: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('🌐 Abra no navegador:\n', authUrl);

  return new Promise((resolve, reject) => {
    const server = http
      .createServer(async (req, res) => {
        if (req.url?.includes('/oauth2callback')) {
          const url = new URL(req.url, 'http://localhost:3000');
          const code = url.searchParams.get('code');

          res.end('Autorizado! Pode fechar esta aba.');
          server.close();

          try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Salva token inicial
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('✅ Token salvo automaticamente!');

            resolve(
              google.drive({ version: 'v3', auth: oAuth2Client })
            );
          } catch (err) {
            reject(err);
          }
        }
      })
      .listen(3000, () => {
        console.log('🚀 Aguardando autenticação...');
      });
  });
}