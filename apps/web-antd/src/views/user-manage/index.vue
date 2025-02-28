<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Select,
  Table,
  Tag,
} from 'ant-design-vue';

// 表格加载状态
const loading = ref(false);
// 用户列表数据
const userList = ref<any[]>([]);
// 搜索关键词
const searchKeyword = ref<string>('');
// 用户状态过滤
const statusFilter = ref<string>('all');
// 添加/编辑用户对话框可见性
const userModalVisible = ref<boolean>(false);
// 当前编辑的用户
const currentUser = ref<any>(null);
// 表单数据
const formData = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  status: 'active',
  role: 'user',
});

// 模拟用户数据
const mockUserData = () => {
  const statusOptions = ['active', 'inactive', 'locked'];
  const roleOptions = ['admin', 'user', 'guest'];

  return Array.from({ length: 20 }).map((_, index) => ({
    id: `user_${index + 1}`,
    username: `user${index + 1}`,
    realName: `用户${index + 1}`,
    email: `user${index + 1}@example.com`,
    phone: `1381234${String(index + 1).padStart(4, '0')}`,
    status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    role: roleOptions[Math.floor(Math.random() * roleOptions.length)],
    createTime: new Date(
      Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split('T')[0],
  }));
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    userList.value = mockUserData();
  } catch (error) {
    console.log(error);
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const handleSearch = () => {
  fetchUserList();
};

// 重置搜索
const handleReset = () => {
  searchKeyword.value = '';
  statusFilter.value = 'all';
  fetchUserList();
};

// 添加用户
const handleAddUser = () => {
  currentUser.value = null;
  formData.value = {
    username: '',
    realName: '',
    email: '',
    phone: '',
    status: 'active',
    role: 'user',
  };
  userModalVisible.value = true;
};

// 编辑用户
const handleEditUser = (record: any) => {
  currentUser.value = record;
  formData.value = {
    username: record.username,
    realName: record.realName,
    email: record.email,
    phone: record.phone,
    status: record.status,
    role: record.role,
  };
  userModalVisible.value = true;
};

// 保存用户
const handleSaveUser = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentUser.value) {
      message.success('用户信息更新成功');
    } else {
      message.success('用户添加成功');
    }

    userModalVisible.value = false;
    fetchUserList();
  } catch (error) {
    console.log(error);
    message.error('操作失败');
  }
};

// 删除用户
const handleDeleteUser = async (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.realName}" 吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success('用户删除成功');
        fetchUserList();
      } catch (error) {
        console.log(error);
        message.error('删除失败');
      }
    },
  });
};

// 表格列定义
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) => {
      const statusMap: Record<string, { color: string; label: string }> = {
        active: { color: 'success', label: '正常' },
        inactive: { color: 'default', label: '未激活' },
        locked: { color: 'error', label: '已锁定' },
      };
      const { color, label } = statusMap[text] || {
        color: 'default',
        label: text,
      };
      return h(Tag, { color }, { default: () => label });
    },
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    customRender: ({ text }: { text: string }) => {
      const roleMap: Record<string, { color: string; label: string }> = {
        admin: { color: 'blue', label: '管理员' },
        user: { color: 'green', label: '普通用户' },
        guest: { color: 'orange', label: '访客' },
      };
      const { color, label } = roleMap[text] || {
        color: 'default',
        label: text,
      };
      return h(Tag, { color }, { default: () => label });
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
    customRender: ({ record }: { record: any }) => {
      return h('div', [
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleEditUser(record),
          },
          { default: () => '编辑' },
        ),
        h(
          Button,
          {
            type: 'link',
            danger: true,
            onClick: () => handleDeleteUser(record),
          },
          { default: () => '删除' },
        ),
      ]);
    },
  },
];

// 状态选项
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '正常', value: 'active' },
  { label: '未激活', value: 'inactive' },
  { label: '已锁定', value: 'locked' },
];

// 角色选项
const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
  { label: '访客', value: 'guest' },
];

onMounted(() => {
  fetchUserList();
});
</script>

<template>
  <div class="user-manage-container">
    <Card title="用户管理" :bordered="false">
      <!-- 搜索区域 -->
      <div class="search-container mb-4 flex flex-wrap items-center gap-4">
        <Input
          v-model:value="searchKeyword"
          placeholder="请输入用户名/姓名/邮箱"
          style="width: 240px"
          @pressEnter="handleSearch"
        />
        <Select
          v-model:value="statusFilter"
          style="width: 120px"
          placeholder="状态"
          :options="statusOptions"
        />
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="primary" @click="handleAddUser">添加用户</Button>
      </div>

      <!-- 表格区域 -->
      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="userList"
        rowKey="id"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
          total: userList.length,
        }"
      />

      <!-- 添加/编辑用户对话框 -->
      <Modal
        :title="currentUser ? '编辑用户' : '添加用户'"
        v-model:open="userModalVisible"
        :maskClosable="false"
        centered
        @ok="handleSaveUser"
      >
        <div class="form-container">
          <div class="form-item mb-4">
            <div class="label mb-1">用户名</div>
            <Input
              v-model:value="formData.username"
              placeholder="请输入用户名"
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">姓名</div>
            <Input v-model:value="formData.realName" placeholder="请输入姓名" />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">邮箱</div>
            <Input v-model:value="formData.email" placeholder="请输入邮箱" />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">手机号</div>
            <Input v-model:value="formData.phone" placeholder="请输入手机号" />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">状态</div>
            <Select
              v-model:value="formData.status"
              style="width: 100%"
              :options="[
                { label: '正常', value: 'active' },
                { label: '未激活', value: 'inactive' },
                { label: '已锁定', value: 'locked' },
              ]"
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">角色</div>
            <Select
              v-model:value="formData.role"
              style="width: 100%"
              :options="roleOptions"
            />
          </div>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<style scoped>
.user-manage-container {
  padding: 16px;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-container > * {
    margin-bottom: 8px;
    width: 100% !important;
  }
}
</style>
