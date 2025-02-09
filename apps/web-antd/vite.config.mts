import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';

export default defineConfig(async (config?: ConfigEnv) => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // target: process.env.VITE_API_BASE_URL,
            target: 'http://47.113.103.202:8020/',
            ws: true,
          },
          '/api/auth': {
            changeOrigin: true,
            rewrite: (path) => {
              const rewrittenPath = path.replace(/^\/api/, '');
              return rewrittenPath;
            },
            target: 'http://47.113.103.202:8010/',
            ws: true,
          },
        },
      },
    },
  };
});
