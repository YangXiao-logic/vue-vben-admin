import type { RouteRecordRaw } from 'vue-router';

import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  RobotOutlined,
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
  {
    path: '/model-manage',
    name: 'ModelManage',
    component: () => import('#/views/model-manage/index.vue'),
    meta: {
      title: '模型管理',
      icon: RobotOutlined,
    },
  },
];

export default routes;
