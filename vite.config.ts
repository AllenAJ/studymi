import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { getSubtitles, extractVideoId } from './services/youtube-fetcher';

// Read .env file directly
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Custom plugin to add transcript API endpoint
function transcriptApiPlugin(): Plugin {
  return {
    name: 'transcript-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/transcript/')) {
          const videoIdParam = req.url.replace('/api/transcript/', '');
          const videoId = extractVideoId(videoIdParam) || videoIdParam;

          try {
            const result = await getSubtitles({
              videoID: videoId,
              lang: 'en',
              enableFallback: true
            });
            const transcript = result.lines.map(line => line.text).join(' ');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ transcript, metadata: result.metadata, success: true }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message, transcript: '', success: false }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), transcriptApiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(envVars.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(envVars.GEMINI_API_KEY || ''),
      'process.env.OPENAI_API_KEY': JSON.stringify(envVars.OPENAI_API_KEY || ''),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(envVars.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(envVars.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(envVars.OPENAI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
