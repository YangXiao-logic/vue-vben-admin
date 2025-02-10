import type { RouteRecordRaw } from 'vue-router';

import { BookOutlined } from '@ant-design/icons-vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/school',
    name: 'School',
    component: () => import('#/views/school/index.vue'),
    meta: {
      title: '学校管理',
      icon: BookOutlined,
    },
  },
];

export default routes;
