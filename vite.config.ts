import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Support both .env file and environment variables (for CI/CD).
    // Prefers VENUS_API_KEY; falls back to legacy GEMINI_API_KEY for backward compat.
    const apiKey =
      env.VENUS_API_KEY ||
      process.env.VENUS_API_KEY ||
      env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '';
    // Proxy Venus internal endpoints through the Vite dev/preview server so
    // the browser doesn't hit a CORS preflight wall. The frontend talks to
    // /venus-api/... (same-origin), Vite forwards to v2.open.venus.oa.com.
    const venusProxy = {
      '/venus-api': {
        target: 'http://v2.open.venus.oa.com',
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/venus-api/, ''),
      },
    };
    return {
      base: '/snaptranslate-ai/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: venusProxy,
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        proxy: venusProxy,
      },
      plugins: [react()],
      define: {
        'process.env.VENUS_API_KEY': JSON.stringify(apiKey),
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
