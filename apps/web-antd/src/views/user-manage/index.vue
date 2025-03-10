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
  getHistoryPaySituation,
  getPaySituation,
  giftVipApi,
  getUserListApi,
  UserManageApi,
} from '#/api/core/userManage';
import { formatDateTime } from '@vben/utils';

// 设备类型选项
const deviceOptions = [
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'Web', value: 'Web' },
  { label: '其他', value: 'Other' },
];

// 渠道类型枚举
enum ChannelEnum {
  Campus = 'campus',
  Friend = 'friend',
  Other = 'other',
}

// 渠道类型选项
const channelOptions = [
  { label: '特殊邀请码', value: ChannelEnum.Campus },
  { label: '普通邀请码', value: ChannelEnum.Friend },
  { label: '其他', value: ChannelEnum.Other },
];

// 上传文件类型枚举
enum UploadFileTypeEnum {
  NoFileUpload = 'no_file_upload',
  UploadPrivateFile = 'upload_private_file',
  UploadPublicFile = 'upload_public_file',
}

// 上传文件类型选项
const uploadFileTypeOptions = [
  { label: '未上传文件', value: UploadFileTypeEnum.NoFileUpload },
  { label: '已上传私有库', value: UploadFileTypeEnum.UploadPrivateFile },
  { label: '已上传公有库', value: UploadFileTypeEnum.UploadPublicFile },
];

// ===== 状态变量 =====
// 表格加载状态
const loading = ref(false);
// 用户列表数据
const userList = ref<UserManageApi.UserInfo[]>([]);

// 搜索相关状态
const searchForm = ref<any>({});
const registerTimeRange = ref<any>(undefined);
const vipExpirationTimeRange = ref<any>(undefined);
const activeTimeRange = ref<any>(undefined);
const purchaseTimeRange = ref<any>(undefined);

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
const selectedVipType = ref(
  UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_TWO_DAY,
);

// 支付情况相关状态
const payRecordModalVisible = ref(false);
const payRecordLoading = ref(false);
const payRecordData = ref<UserManageApi.PayRecordVo[]>([]);
const selectedUserIdForPayRecord = ref('');

// 邀请历史相关状态
const inviteHistoryModalVisible = ref(false);
const inviteHistoryLoading = ref(false);
const inviteHistoryData = ref<UserManageApi.InviteHistoryVo[]>([]);
const selectedUserIdForInviteHistory = ref('');

// ===== 工具函数 =====
// 移除对象中的空值
const removeEmptyValues = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
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
    searchForm.value.registerStartTime = dates[0]?.format(
      'YYYY-MM-DDT00:00:00Z',
    );
    searchForm.value.registerEndTime = dates[1]?.format('YYYY-MM-DDT23:59:59Z');
  } else {
    delete searchForm.value.registerStartTime;
    delete searchForm.value.registerEndTime;
  }
};

// 处理VIP到期时间范围变化
const handleVipExpirationTimeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    searchForm.value.vipExpirationStartTime = dates[0]?.format(
      'YYYY-MM-DDT00:00:00Z',
    );
    searchForm.value.vipExpirationEndTime = dates[1]?.format(
      'YYYY-MM-DDT23:59:59Z',
    );
  } else {
    delete searchForm.value.vipExpirationStartTime;
    delete searchForm.value.vipExpirationEndTime;
  }
};

// 处理活跃时间范围变化
const handleActiveTimeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    searchForm.value.activeStartTime = dates[0]?.format('YYYY-MM-DDT00:00:00Z');
    searchForm.value.activeEndTime = dates[1]?.format('YYYY-MM-DDT23:59:59Z');
  } else {
    delete searchForm.value.activeStartTime;
    delete searchForm.value.activeEndTime;
  }
};

// 处理购买时间范围变化
const handlePurchaseTimeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    searchForm.value.purchaseStartTime = dates[0]?.format(
      'YYYY-MM-DDT00:00:00Z',
    );
    searchForm.value.purchaseEndTime = dates[1]?.format('YYYY-MM-DDT23:59:59Z');
  } else {
    delete searchForm.value.purchaseStartTime;
    delete searchForm.value.purchaseEndTime;
  }
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    // 深拷贝参数对象
    const params = { ...removeEmptyValues(searchForm.value) };

    // 处理布尔值转换
    if (params.isVip === 'true') params.isVip = true;
    if (params.isVip === 'false') params.isVip = false;
    if (params.isPartnerSchool === 'true') params.isPartnerSchool = true;
    if (params.isPartnerSchool === 'false') params.isPartnerSchool = false;

    const res = await getUserListApi(params);

    // 确保响应数据是数组
    userList.value = Array.isArray(res) ? res : [];
    if (userList.value.length === 0) {
      message.info('暂无符合条件的用户');
    }
  } catch (error) {
    console.error('获取用户列表出错:', error);
    userList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const handleSearch = () => fetchUserList();

// 重置搜索
const handleReset = () => {
  searchForm.value = {};
  registerTimeRange.value = undefined;
  vipExpirationTimeRange.value = undefined;
  activeTimeRange.value = undefined;
  purchaseTimeRange.value = undefined;
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
const handleOpenVipGiftModal = (userId: string) => {
  selectedUserEmail.value = userId;
  vipGiftModalVisible.value = true;
};

// 打开支付情况对话框
const handleOpenPayRecordModal = async (userId: string) => {
  selectedUserIdForPayRecord.value = userId;
  payRecordModalVisible.value = true;

  try {
    payRecordLoading.value = true;
    const res = await getPaySituation(userId);
    payRecordData.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.log(error);
  } finally {
    payRecordLoading.value = false;
  }
};

// 打开邀请历史对话框
const handleOpenInviteHistoryModal = async (userId: string) => {
  selectedUserIdForInviteHistory.value = userId;
  inviteHistoryModalVisible.value = true;

  try {
    inviteHistoryLoading.value = true;
    const res = await getHistoryPaySituation(userId);
    inviteHistoryData.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.log(error);
  } finally {
    inviteHistoryLoading.value = false;
  }
};

// 表单提交处理函数
const handleSubmit = async (type: 'user' | 'vip') => {
  if (type === 'user') {
    // 添加用户
    if (addUserLoading.value) return;

    // 验证必填字段
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !formData.value.primaryEmail ||
      !emailRegex.test(formData.value.primaryEmail)
    ) {
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
      if (userData.inviteCode === '') {
        delete userData.inviteCode;
      }
      await addUserApi(userData);
      message.success('用户添加成功');
      userModalVisible.value = false;
      fetchUserList();
    } catch (error) {
      console.error('添加用户出错:', error);
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
    title: '设备',
    dataIndex: 'device',
    key: 'device',
    customRender: ({ text }: { text: string | null }) => text || '未知',
  },
  {
    title: '学校',
    dataIndex: 'school',
    key: 'school',
    customRender: ({ text }: { text: string[] | null }) => {
      if (!text || text.length === 0) return '未设置';
      return text.join(', ');
    },
  },
  {
    title: 'VIP状态',
    dataIndex: 'isVip',
    key: 'isVip',
    customRender: ({ text }: { text: boolean }) =>
      h(
        Tag,
        { color: text ? 'success' : 'default' },
        { default: () => (text ? 'VIP' : '普通用户') },
      ),
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    key: 'registerTime',
    customRender: ({ text }: { text: string }) => formatDateTime(text),
  },
  {
    title: 'VIP到期时间',
    dataIndex: 'vipExpirationTime',
    key: 'vipExpirationTime',
    customRender: ({ text }: { text: string }) =>
      text ? formatDateTime(text) : '未开通VIP',
  },
  {
    title: '首次购买时间',
    dataIndex: 'firstPurchaseTime',
    key: 'firstPurchaseTime',
    customRender: ({ text }: { text: string }) =>
      text ? formatDateTime(text) : '未购买',
  },
  {
    title: '最近购买时间',
    dataIndex: 'lastPurchaseTime',
    key: 'lastPurchaseTime',
    customRender: ({ text }: { text: string }) =>
      text ? formatDateTime(text) : '未购买',
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    customRender: ({ record }: { record: UserManageApi.UserInfo }) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleOpenVipGiftModal(record.userId || ''),
          },
          { default: () => '赠送VIP' },
        ),
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleOpenPayRecordModal(record.userId || ''),
          },
          { default: () => '支付情况' },
        ),
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleOpenInviteHistoryModal(record.userId || ''),
          },
          { default: () => '邀请历史' },
        ),
      ]),
  },
];

// VIP类型选项
const vipTypeOptions = [
  {
    label: '2天VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_TWO_DAY,
  },
  {
    label: '3天VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_THREE_DAY,
  },
  {
    label: '5天VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_FIVE_DAY,
  },
  {
    label: '一周VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_WEEK,
  },
  {
    label: '一个月VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_MONTH,
  },
  {
    label: '半年VIP',
    value: UserManageApi.VipRechargeTypeEnum.REGULAR_VIP_HALF_YEAR,
  },
];

// 初始化加载
onMounted(() => {
  fetchUserList();
});
</script>

<template>
  <div class="user-manage-container">
    <Card title="用户管理" :bordered="false">
      <Button type="primary" @click="handleAddUser">添加新用户</Button>

      <!-- 搜索区域 -->
      <div class="search-container my-4 flex flex-wrap items-center gap-4">
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
          style="width: 160px"
          @pressEnter="handleSearch"
          allowClear
        />
        <Input
          v-model:value="searchForm.school"
          placeholder="学校"
          style="width: 160px"
          @pressEnter="handleSearch"
          allowClear
        />
        <Select
          v-model:value="searchForm.channelEnum"
          style="width: 120px"
          placeholder="注册渠道"
          :options="channelOptions"
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
        <Select
          v-model:value="searchForm.isPartnerSchool"
          style="width: 180px"
          placeholder="是否在合作学校"
          :options="[
            { label: '是', value: 'true' },
            { label: '否', value: 'false' },
          ]"
          allowClear
        />
        <Select
          v-model:value="searchForm.isVip"
          style="width: 100px"
          placeholder="VIP状态"
          :options="[
            { label: 'VIP用户', value: 'true' },
            { label: '普通用户', value: 'false' },
          ]"
          allowClear
        />
        <div>
          <span>VIP购买时间：</span>
          <DatePicker.RangePicker
            v-model:value="purchaseTimeRange"
            style="width: 240px"
            @change="handlePurchaseTimeChange"
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
        <Select
          v-model:value="searchForm.uploadFileTypeEnum"
          style="width: 140px"
          placeholder="文件上传状态"
          :options="uploadFileTypeOptions"
          allowClear
        />
        <Select
          v-model:value="searchForm.device"
          style="width: 120px"
          placeholder="设备类型"
          :options="deviceOptions"
          allowClear
        />
        <div>
          <span>活跃时间：</span>
          <DatePicker.RangePicker
            v-model:value="activeTimeRange"
            style="width: 240px"
            @change="handleActiveTimeChange"
            allowClear
          />
        </div>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
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
        :scroll="{ x: 1200 }"
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
            <div class="label mb-1">
              主邮箱 <span class="text-red-500">*</span>
            </div>
            <Input
              v-model:value="formData.primaryEmail"
              placeholder="请输入主邮箱"
            />
            <div class="mt-1 text-xs text-gray-400">
              主邮箱将作为账号登录使用
            </div>
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">
              密码 <span class="text-red-500">*</span>
            </div>
            <Input.Password
              v-model:value="formData.password"
              placeholder="请输入密码"
            />
            <div class="mt-1 text-xs text-gray-400">密码长度至少为6位</div>
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">邀请码</div>
            <Input
              v-model:value="formData.inviteCode"
              placeholder="请输入邀请码"
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">其他附属邮箱</div>
            <div class="flex gap-2">
              <Input
                v-model:value="otherEmailInput"
                placeholder="请输入其他附属邮箱"
                @pressEnter="handleAddOtherEmail"
              />
              <Button type="primary" @click="handleAddOtherEmail"
                >继续添加</Button
              >
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
            <div class="label mb-1">用户ID</div>
            <Input
              v-model:value="selectedUserEmail"
              placeholder="用户ID"
              disabled
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">
              VIP类型 <span class="text-red-500">*</span>
            </div>
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

      <!-- 支付情况对话框 -->
      <Modal
        title="支付情况"
        v-model:open="payRecordModalVisible"
        :maskClosable="false"
        centered
        :footer="null"
        width="800px"
      >
        <div v-if="payRecordLoading" class="py-4 text-center">
          <div class="ant-spin ant-spin-lg ant-spin-spinning">
            <span class="ant-spin-dot ant-spin-dot-spin">
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
            </span>
          </div>
        </div>

        <div v-else>
          <div class="mb-4">
            <div class="mb-1 font-bold">
              用户ID: {{ selectedUserIdForPayRecord }}
            </div>
          </div>

          <div
            v-if="payRecordData.length === 0"
            class="py-4 text-center text-gray-500"
          >
            暂无支付记录
          </div>

          <Table
            v-else
            :dataSource="payRecordData"
            :pagination="false"
            :columns="[
              {
                title: '交易单号',
                dataIndex: 'outTradeNo',
                key: 'outTradeNo',
              },
              {
                title: '支付时间',
                dataIndex: 'createTime',
                key: 'createTime',
                customRender: ({ text }) => formatDateTime(text),
              },
              {
                title: '支付金额',
                dataIndex: 'payAmount',
                key: 'payAmount',
              },
              {
                title: '支付类型',
                dataIndex: 'payTypeDescription',
                key: 'payTypeDescription',
              },
              {
                title: '支付来源',
                dataIndex: 'paySourceDescription',
                key: 'paySourceDescription',
              },
              {
                title: '是否赠送',
                dataIndex: 'gifted',
                key: 'gifted',
                customRender: ({ text }) => (text ? '是' : '否'),
              },
            ]"
          />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <Button @click="payRecordModalVisible = false">关闭</Button>
        </div>
      </Modal>

      <!-- 邀请历史对话框 -->
      <Modal
        title="邀请历史"
        v-model:open="inviteHistoryModalVisible"
        :maskClosable="false"
        centered
        :footer="null"
        width="800px"
      >
        <div v-if="inviteHistoryLoading" class="py-4 text-center">
          <div class="ant-spin ant-spin-lg ant-spin-spinning">
            <span class="ant-spin-dot ant-spin-dot-spin">
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
              <i class="ant-spin-dot-item"></i>
            </span>
          </div>
        </div>

        <div v-else>
          <div class="mb-4">
            <div class="mb-1 font-bold">
              用户ID: {{ selectedUserIdForInviteHistory }}
            </div>
          </div>

          <div
            v-if="inviteHistoryData.length === 0"
            class="py-4 text-center text-gray-500"
          >
            暂无邀请历史
          </div>

          <Table
            v-else
            :dataSource="inviteHistoryData"
            :pagination="false"
            :columns="[
              {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                customRender: ({ text }) => formatDateTime(text),
              },
              {
                title: '被邀请用户',
                dataIndex: 'toUserAccount',
                key: 'toUserAccount',
                customRender: ({ text }) => text || '无',
              },
              {
                title: 'VIP充值类型',
                dataIndex: 'vipRechargeType',
                key: 'vipRechargeType',
              },
            ]"
          />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <Button @click="inviteHistoryModalVisible = false">关闭</Button>
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
