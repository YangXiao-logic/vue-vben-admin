import type { RouteRecordRaw } from 'vue-router';

import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';

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
  {
    path: '/user-manage',
    name: 'UserManage',
    component: () => import('#/views/user-manage/index.vue'),
    meta: {
      title: '用户管理',
      icon: UserOutlined,
    },
  },
  {
    path: '/invite-manage',
    name: 'InviteManage',
    component: () => import('#/views/invite-manage/index.vue'),
    meta: {
      title: '邀请管理',
      icon: TeamOutlined,
    },
  },
];

export default routes;
