import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  // 从环境变量获取API URL，使用 import.meta.env 来访问环境变

  return {
    server: {
      application: {},
      port: 3000,
      proxy: {
        '/api': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          target: "http://localhost:8090/",
          ws: true,
        }
      }
    }
  };
});
