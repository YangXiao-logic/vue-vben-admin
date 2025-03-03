<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  DatePicker,
  Input,
  message,
  Modal,
  Select,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  addUserApi,
  giftVipApi,
  getUserListApi,
  UserManageApi,
} from '#/api/core/userManage';

// ===== 状态变量 =====
// 表格加载状态
const loading = ref(false);
// 用户列表数据
const userList = ref<UserManageApi.UserInfo[]>([]);

// 搜索相关状态
const searchForm = ref<Partial<UserManageApi.UserQueryParams>>({ isVip: false });
const registerTimeRange = ref<any[]>([]);
const vipExpirationTimeRange = ref<any[]>([]);

// 添加用户相关状态
const userModalVisible = ref(false);
const addUserLoading = ref(false);
const formData = ref<UserManageApi.AddUserParams>({
  primaryEmail: '',
  password: '',
  inviteCode: '',
  otherEmails: [],
});
const otherEmailInput = ref('');

// 赠送VIP相关状态
const vipGiftModalVisible = ref(false);
const giftVipLoading = ref(false);
const selectedUserEmail = ref('');
const selectedVipType = ref(UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_FIVE_DAY);

// ===== 工具函数 =====
// 移除对象中的空值
const removeEmptyValues = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

// ===== 事件处理函数 =====
// 处理注册时间范围变化
const handleRegisterTimeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    searchForm.value.registerStartTime = dates[0]?.format('YYYY-MM-DDT00:00:00Z');
    searchForm.value.registerEndTime = dates[1]?.format('YYYY-MM-DDT23:59:59Z');
  } else {
    delete searchForm.value.registerStartTime;
    delete searchForm.value.registerEndTime;
  }
};

// 处理VIP到期时间范围变化
const handleVipExpirationTimeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    searchForm.value.vipExpirationStartTime = dates[0]?.format('YYYY-MM-DDT00:00:00Z');
    searchForm.value.vipExpirationEndTime = dates[1]?.format('YYYY-MM-DDT23:59:59Z');
  } else {
    delete searchForm.value.vipExpirationStartTime;
    delete searchForm.value.vipExpirationEndTime;
  }
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    const params = removeEmptyValues(searchForm.value);
    const res = await getUserListApi(params as UserManageApi.UserQueryParams);
    userList.value = Array.isArray(res.data.data) ? res.data.data : [];
    if (userList.value.length === 0) {
      message.info('暂无符合条件的用户');
    }
  } catch (error) {
    console.error('获取用户列表出错:', error);
    message.error('获取用户列表失败，请稍后重试');
    userList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const handleSearch = () => fetchUserList();

// 重置搜索
const handleReset = () => {
  searchForm.value = { isVip: false };
  registerTimeRange.value = [];
  vipExpirationTimeRange.value = [];
  fetchUserList();
};

// 添加用户
const handleAddUser = () => {
  formData.value = {
    primaryEmail: '',
    password: '',
    inviteCode: '',
    otherEmails: [],
  };
  otherEmailInput.value = '';
  userModalVisible.value = true;
};

// 添加其他邮箱
const handleAddOtherEmail = () => {
  if (otherEmailInput.value.trim()) {
    formData.value.otherEmails.push(otherEmailInput.value);
    otherEmailInput.value = '';
  }
};

// 移除其他邮箱
const handleRemoveOtherEmail = (index: number) => {
  formData.value.otherEmails.splice(index, 1);
};

// 打开赠送VIP对话框
const handleOpenVipGiftModal = (email: string) => {
  selectedUserEmail.value = email;
  vipGiftModalVisible.value = true;
};

// 表单提交处理函数
const handleSubmit = async (type: 'user' | 'vip') => {
  if (type === 'user') {
    // 添加用户
    if (addUserLoading.value) return;
    
    // 验证必填字段
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.value.primaryEmail || !emailRegex.test(formData.value.primaryEmail)) {
      message.warning('请输入有效的主邮箱');
      return;
    }
    
    if (!formData.value.password || formData.value.password.length < 6) {
      message.warning('密码长度至少为6位');
      return;
    }

    try {
      addUserLoading.value = true;
      
      // 准备数据
      const userData = { ...formData.value };
      await addUserApi(userData);
      message.success('用户添加成功');
      userModalVisible.value = false;
      fetchUserList();
    } catch (error) {
      console.error('添加用户出错:', error);
      message.error('添加用户失败，请稍后重试');
    } finally {
      addUserLoading.value = false;
    }
  } else {
    // 赠送VIP
    if (giftVipLoading.value) return;
    
    if (!selectedUserEmail.value) {
      message.warning('请选择用户');
      return;
    }

    try {
      giftVipLoading.value = true;
      
      await giftVipApi(selectedUserEmail.value, selectedVipType.value);
      message.success('VIP赠送成功');
      vipGiftModalVisible.value = false;
      fetchUserList();
    } catch (error) {
      console.error('赠送VIP出错:', error);
      message.error('VIP赠送失败，请稍后重试');
    } finally {
      giftVipLoading.value = false;
    }
  }
};

// 表格列定义
const columns = [
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 220,
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
    customRender: ({ text }: { text: string | null }) => text || '未绑定',
  },
  {
    title: 'VIP状态',
    dataIndex: 'isVip',
    key: 'isVip',
    customRender: ({ text }: { text: boolean }) => h(
      Tag,
      { color: text ? 'success' : 'default' },
      { default: () => (text ? 'VIP' : '普通用户') }
    ),
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    key: 'registerTime',
  },
  {
    title: 'VIP到期时间',
    dataIndex: 'vipExpirationTime',
    key: 'vipExpirationTime',
    customRender: ({ text }: { text: string }) => text || '未开通VIP',
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    customRender: ({ record }: { record: UserManageApi.UserInfo }) => h(
      Button,
      {
        type: 'link',
        onClick: () => handleOpenVipGiftModal(record.email),
      },
      { default: () => '赠送VIP' }
    ),
  },
];

// VIP类型选项
const vipTypeOptions = [
  { label: '2天VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_TWO_DAY },
  { label: '3天VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_THREE_DAY },
  { label: '5天VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_FIVE_DAY },
  { label: '一周VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_WEEK },
  { label: '一个月VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_MONTH },
  { label: '半年VIP', value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_HALF_YEAR },
];

// 初始化加载
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
          v-model:value="searchForm.userId"
          placeholder="用户ID"
          style="width: 180px"
          @pressEnter="handleSearch"
          allowClear
        />
        <Input
          v-model:value="searchForm.email"
          placeholder="邮箱"
          style="width: 180px"
          @pressEnter="handleSearch"
          allowClear
        />
        <Input
          v-model:value="searchForm.phone"
          placeholder="手机号"
          style="width: 180px"
          @pressEnter="handleSearch"
          allowClear
        />
        <Select
          v-model:value="searchForm.isVip"
          style="width: 120px"
          placeholder="VIP状态"
          :options="[
            { label: '所有用户', value: undefined },
            { label: 'VIP用户', value: true },
            { label: '普通用户', value: false },
          ]"
          allowClear
        />
        <div>
          <span>注册时间：</span>
          <DatePicker.RangePicker
            v-model:value="registerTimeRange"
            style="width: 240px"
            @change="handleRegisterTimeChange"
            allowClear
          />
        </div>
        <div>
          <span>VIP到期时间：</span>
          <DatePicker.RangePicker
            v-model:value="vipExpirationTimeRange"
            style="width: 240px"
            @change="handleVipExpirationTimeChange"
            allowClear
          />
        </div>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <Button type="primary" @click="handleAddUser">添加用户</Button>
      </div>

      <!-- 表格区域 -->
      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="userList"
        rowKey="userId"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
        }"
      />

      <!-- 添加用户对话框 -->
      <Modal
        title="添加用户"
        v-model:open="userModalVisible"
        :maskClosable="false"
        centered
        :footer="null"
        width="600px"
      >
        <div class="form-container">
          <div class="form-item mb-4">
            <div class="label mb-1">主邮箱 <span class="text-red-500">*</span></div>
            <Input
              v-model:value="formData.primaryEmail"
              placeholder="请输入主邮箱"
            />
            <div class="text-xs text-gray-400 mt-1">主邮箱将作为账号登录使用</div>
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">密码 <span class="text-red-500">*</span></div>
            <Input.Password
              v-model:value="formData.password"
              placeholder="请输入密码"
            />
            <div class="text-xs text-gray-400 mt-1">密码长度至少为6位</div>
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">邀请码 <span class="text-red-500">*</span></div>
            <Input
              v-model:value="formData.inviteCode"
              placeholder="请输入邀请码"
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">其他邮箱</div>
            <div class="flex gap-2">
              <Input
                v-model:value="otherEmailInput"
                placeholder="请输入其他邮箱"
                @pressEnter="handleAddOtherEmail"
              />
              <Button type="primary" @click="handleAddOtherEmail">添加</Button>
            </div>
            <div class="other-emails mt-2">
              <Tag 
                v-for="(email, index) in formData.otherEmails" 
                :key="index"
                closable
                @close="handleRemoveOtherEmail(index)"
                class="mb-1 mr-1"
              >
                {{ email }}
              </Tag>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <Button @click="userModalVisible = false">取消</Button>
          <Button 
            type="primary" 
            :loading="addUserLoading" 
            @click="handleSubmit('user')"
          >
            确认添加
          </Button>
        </div>
      </Modal>

      <!-- 赠送VIP对话框 -->
      <Modal
        title="赠送VIP"
        v-model:open="vipGiftModalVisible"
        :maskClosable="false"
        centered
        :footer="null"
      >
        <div class="form-container">
          <div class="form-item mb-4">
            <div class="label mb-1">用户邮箱</div>
            <Input
              v-model:value="selectedUserEmail"
              placeholder="用户邮箱"
              disabled
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">VIP类型 <span class="text-red-500">*</span></div>
            <Select
              v-model:value="selectedVipType"
              style="width: 100%"
              :options="vipTypeOptions"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <Button @click="vipGiftModalVisible = false">取消</Button>
          <Button 
            type="primary" 
            :loading="giftVipLoading" 
            @click="handleSubmit('vip')"
          >
            确认赠送
          </Button>
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
