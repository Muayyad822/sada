import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-token-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/token' && req.method === 'POST') {
              try {
                const clientId = env.VITE_QF_CLIENT_ID || env.QF_CLIENT_ID;
                const clientSecret = env.QF_CLIENT_SECRET;
                const authUrl = env.QF_AUTH_URL || 'https://oauth2.quran.foundation';

                if (!clientId || !clientSecret) {
                  throw new Error('Missing QF_CLIENT_ID or QF_CLIENT_SECRET in .env');
                }

                const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                const response = await fetch(`${authUrl}/oauth2/token`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`,
                  },
                  body: 'grant_type=client_credentials&scope=content',
                });

                const data = await response.json();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              } catch (error) {
                console.error('Local Dev API Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to fetch token in local dev', details: error instanceof Error ? error.message : String(error) }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
  }
})
