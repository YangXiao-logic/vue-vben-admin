import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';
export default defineConfig(async (config?: ConfigEnv) => {
  const currentUrl =
    config?.mode === 'test'
      ? 'http://47.113.103.202:8090/'
      : 'http://localhost:8090/';
  console.log(currentUrl);
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: currentUrl,
            ws: true,
          },
        },
      },
    },
  };
});
