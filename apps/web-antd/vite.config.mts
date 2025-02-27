import { defineConfig } from '@vben/vite-config';
import type { ConfigEnv } from 'vite';
export default defineConfig(async (config?: ConfigEnv) => {
  // 根据环境模式设置不同的API地址
  const apiUrl =
    config?.mode === 'test'
      ? 'http://47.113.103.202:8090/'
      : 'http://localhost:8090/';
  console.log(apiUrl);
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: apiUrl,
            ws: true,
          },
        },
      },
    },
  };
});
