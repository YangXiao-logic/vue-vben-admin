import type { RouteRecordRaw } from 'vue-router';

import { FolderAddOutlined } from '@ant-design/icons-vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/collection',
    name: 'Collection',
    component: () => import('#/views/collection/collection.vue'),
    meta: {
      title: '文件夹管理',
      icon: FolderAddOutlined,
    },
  },
];

export default routes;
