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
  Tooltip,
} from 'ant-design-vue';

// 表格加载状态
const loading = ref(false);
// 邀请列表数据
const inviteList = ref<any[]>([]);
// 搜索关键词
const searchKeyword = ref<string>('');
// 邀请状态过滤
const statusFilter = ref<string>('all');
// 添加邀请对话框可见性
const inviteModalVisible = ref<boolean>(false);
// 表单数据
const formData = ref({
  email: '',
  role: 'user',
  expireTime: 7, // 默认7天有效期
});

// 模拟邀请数据
const mockInviteData = () => {
  const statusOptions = ['pending', 'accepted', 'expired'];
  const roleOptions = ['admin', 'user', 'guest'];

  return Array.from({ length: 15 }).map((_, index) => {
    const status =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const createTime = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    );
    const expireTime = new Date(createTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: `invite_${index + 1}`,
      email: `invited${index + 1}@example.com`,
      inviteCode: `INV${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`,
      role: roleOptions[Math.floor(Math.random() * roleOptions.length)],
      status,
      createTime: createTime.toISOString().split('T')[0],
      expireTime: expireTime.toISOString().split('T')[0],
      acceptTime:
        status === 'accepted'
          ? new Date(
              createTime.getTime() +
                Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0]
          : null,
    };
  });
};

// 获取邀请列表
const fetchInviteList = async () => {
  try {
    loading.value = true;
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    inviteList.value = mockInviteData();
  } catch (error) {
    console.log(error);
    message.error('获取邀请列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索邀请
const handleSearch = () => {
  fetchInviteList();
};

// 重置搜索
const handleReset = () => {
  searchKeyword.value = '';
  statusFilter.value = 'all';
  fetchInviteList();
};

// 添加邀请
const handleAddInvite = () => {
  formData.value = {
    email: '',
    role: 'user',
    expireTime: 7,
  };
  inviteModalVisible.value = true;
};

// 发送邀请
const handleSendInvite = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('邀请发送成功');
    inviteModalVisible.value = false;
    fetchInviteList();
  } catch (error) {
    console.log(error);
    message.error('邀请发送失败');
  }
};

// 复制邀请链接
const handleCopyInviteLink = (record: any) => {
  const inviteLink = `https://example.com/register?code=${record.inviteCode}`;

  // 使用 navigator.clipboard API 复制到剪贴板
  navigator.clipboard
    .writeText(inviteLink)
    .then(() => {
      message.success('邀请链接已复制到剪贴板');
    })
    .catch(() => {
      message.error('复制失败，请手动复制');
    });
};

// 重新发送邀请
const handleResendInvite = async (record: any) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success(`邀请已重新发送至 ${record.email}`);
    fetchInviteList();
  } catch (error) {
    console.log(error);
    message.error('重新发送邀请失败');
  }
};

// 取消邀请
const handleCancelInvite = async (record: any) => {
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消发送给 ${record.email} 的邀请吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success('邀请已取消');
        fetchInviteList();
      } catch (error) {
        console.log(error);
        message.error('取消邀请失败');
      }
    },
  });
};

// 表格列定义
const columns = [
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '邀请码',
    dataIndex: 'inviteCode',
    key: 'inviteCode',
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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) => {
      const statusMap: Record<string, { color: string; label: string }> = {
        pending: { color: 'processing', label: '待接受' },
        accepted: { color: 'success', label: '已接受' },
        expired: { color: 'default', label: '已过期' },
      };
      const { color, label } = statusMap[text] || {
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
    title: '过期时间',
    dataIndex: 'expireTime',
    key: 'expireTime',
  },
  {
    title: '接受时间',
    dataIndex: 'acceptTime',
    key: 'acceptTime',
    customRender: ({ text }: { text: string | null }) => {
      return text || '-';
    },
  },
  {
    title: '操作',
    key: 'action',
    customRender: ({ record }: { record: any }) => {
      const isPending = record.status === 'pending';

      return h('div', [
        h(
          Tooltip,
          { title: '复制邀请链接' },
          {
            default: () =>
              h(
                Button,
                {
                  type: 'link',
                  onClick: () => handleCopyInviteLink(record),
                },
                { default: () => '复制链接' },
              ),
          },
        ),

        isPending
          ? h(
              Button,
              {
                type: 'link',
                onClick: () => handleResendInvite(record),
              },
              { default: () => '重新发送' },
            )
          : null,

        isPending
          ? h(
              Button,
              {
                type: 'link',
                danger: true,
                onClick: () => handleCancelInvite(record),
              },
              { default: () => '取消' },
            )
          : null,
      ]);
    },
  },
];

// 状态选项
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待接受', value: 'pending' },
  { label: '已接受', value: 'accepted' },
  { label: '已过期', value: 'expired' },
];

// 角色选项
const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
  { label: '访客', value: 'guest' },
];

// 有效期选项
const expireTimeOptions = [
  { label: '1天', value: 1 },
  { label: '3天', value: 3 },
  { label: '7天', value: 7 },
  { label: '15天', value: 15 },
  { label: '30天', value: 30 },
];

onMounted(() => {
  fetchInviteList();
});
</script>

<template>
  <div class="invite-manage-container">
    <Card title="邀请管理" :bordered="false">
      <!-- 搜索区域 -->
      <div class="search-container mb-4 flex flex-wrap items-center gap-4">
        <Input
          v-model:value="searchKeyword"
          placeholder="请输入邮箱/邀请码"
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
        <Button type="primary" @click="handleAddInvite">发送邀请</Button>
      </div>

      <!-- 表格区域 -->
      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="inviteList"
        rowKey="id"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
          total: inviteList.length,
        }"
      />

      <!-- 添加邀请对话框 -->
      <Modal
        title="发送邀请"
        v-model:open="inviteModalVisible"
        :maskClosable="false"
        centered
        @ok="handleSendInvite"
      >
        <div class="form-container">
          <div class="form-item mb-4">
            <div class="label mb-1">邮箱</div>
            <Input
              v-model:value="formData.email"
              placeholder="请输入邮箱地址"
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
          <div class="form-item mb-4">
            <div class="label mb-1">有效期</div>
            <Select
              v-model:value="formData.expireTime"
              style="width: 100%"
              :options="expireTimeOptions"
            />
          </div>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<style scoped>
.invite-manage-container {
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
