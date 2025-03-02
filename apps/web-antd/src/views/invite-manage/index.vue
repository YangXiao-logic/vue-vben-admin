<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Table,
  Tag,
  Tooltip,
  Select,
} from 'ant-design-vue';
import { EyeOutlined, CopyOutlined, EditOutlined } from '@ant-design/icons-vue';

import {
  getInviteCodeListApi,
  addSpecialInviteCodeApi,
  updateSpecialInviteCodeDescriptionApi,
  getInviteHistoryApi,
  InviteManageApi,
} from '#/api/core/inviteManage';

// 表格加载状态
const loading = ref(false);
// 邀请码列表数据
const inviteCodeList = ref<InviteManageApi.SpecialInviteCode[]>([]);
// 表单数据
const formData = ref({
  account: '',
  description: '',
  vipRechargeType: InviteManageApi.VipRechargeType.RegularVipMonth,
});

// 邀请历史记录相关
const historyModalVisible = ref<boolean>(false);
const historyLoading = ref<boolean>(false);
const currentInviteCode = ref<string>('');
const inviteHistoryList = ref<InviteManageApi.InviteHistory[]>([]);

// 编辑描述相关
const editDescModalVisible = ref<boolean>(false);
const editingInviteCode = ref<InviteManageApi.SpecialInviteCode | null>(null);
const newDescription = ref<string>('');
const newVipRechargeType = ref<InviteManageApi.VipRechargeType>(
  InviteManageApi.VipRechargeType.RegularVipMonth,
);

// VIP充值类型选项
const vipRechargeTypeOptions = [
  {
    label: '两天会员',
    value: InviteManageApi.VipRechargeType.RegularVipTwoDay,
  },
  {
    label: '三天会员',
    value: InviteManageApi.VipRechargeType.RegularVipThreeDay,
  },
  {
    label: '五天会员',
    value: InviteManageApi.VipRechargeType.RegularVipFiveDay,
  },
  {
    label: '周会员',
    value: InviteManageApi.VipRechargeType.RegularVipWeek,
  },
  {
    label: '月度会员',
    value: InviteManageApi.VipRechargeType.RegularVipMonth,
  },
  {
    label: '半年会员',
    value: InviteManageApi.VipRechargeType.RegularVipHalfYear,
  },
];

// 获取邀请码列表
const fetchInviteCodeList = async () => {
  try {
    loading.value = true;
    const res = await getInviteCodeListApi();
    inviteCodeList.value = res || [];
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};
fetchInviteCodeList();

// 生成特殊邀请码
const handleGenerateInviteCode = async () => {
  try {
    if (!formData.value.account) {
      message.warning('请输入账号');
      return;
    }

    const params = {
      account: formData.value.account,
      description: formData.value.description,
      vipRechargeType: formData.value.vipRechargeType,
    };

    const res = await addSpecialInviteCodeApi(params);

    message.success('特殊邀请码生成成功');
    // 清空表单
    formData.value = {
      account: '',
      description: '',
      vipRechargeType: InviteManageApi.VipRechargeType.RegularVipMonth,
    };
    fetchInviteCodeList();
  } catch (error) {
    console.log(error);
  }
};

// 复制邀请码
const handleCopyInviteCode = (record: InviteManageApi.SpecialInviteCode) => {
  if (!record.inviteCode) {
    message.error('邀请码不存在');
    return;
  }

  // 使用 navigator.clipboard API 复制到剪贴板
  navigator.clipboard
    .writeText(record.inviteCode)
    .then(() => {
      message.success('邀请码已复制到剪贴板');
    })
    .catch(() => {
      message.error('复制失败，请手动复制');
    });
};

// 查看邀请历史
const handleViewHistory = async (record: InviteManageApi.SpecialInviteCode) => {
  if (!record.inviteCode) {
    message.error('邀请码不存在');
    return;
  }

  try {
    historyLoading.value = true;
    currentInviteCode.value = record.inviteCode;
    const res = await getInviteHistoryApi(record.inviteCode);
    inviteHistoryList.value = res || [];
    historyModalVisible.value = true;
  } catch (error) {
    console.log(error);
  } finally {
    historyLoading.value = false;
  }
};

// 编辑描述
const handleEditDescription = (record: InviteManageApi.SpecialInviteCode) => {
  editingInviteCode.value = record;
  newDescription.value = record.description || '';
  newVipRechargeType.value = record.vipRechargeType;
  editDescModalVisible.value = true;
};

// 保存描述
const handleSaveDescription = async () => {
  if (!editingInviteCode.value?.inviteCodeId) {
    message.error('邀请码ID不存在');
    return;
  }

  try {
    const updateData = {
      description: newDescription.value,
      vipRechargeType: newVipRechargeType.value,
    };

    await updateSpecialInviteCodeDescriptionApi(
      editingInviteCode.value.inviteCodeId,
      updateData,
    );
    message.success('更新成功');
    editDescModalVisible.value = false;
    fetchInviteCodeList();
  } catch (error) {
    console.log(error);
  }
};

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return '-';

  if (typeof time === 'object' && time.seconds) {
    // 处理Instant类型
    const date = new Date(Number(time.seconds) * 1000);
    return date.toLocaleString();
  }

  return time;
};

// 获取VIP充值类型显示文本
const getVipRechargeTypeText = (
  type: InviteManageApi.VipRechargeType | string | null,
) => {
  if (!type) return '-';

  const option = vipRechargeTypeOptions.find((opt) => opt.value === type);
  return option ? option.label : type;
};

// 邀请码列表表格列定义
const columns = [
  {
    title: '邀请码',
    dataIndex: 'inviteCode',
    key: 'inviteCode',
  },
  {
    title: '用户邮箱',
    dataIndex: 'userEmail',
    key: 'userEmail',
    customRender: ({ text }: { text: string | null }) => {
      return text || '-';
    },
  },
  {
    title: '描述标记',
    dataIndex: 'description',
    key: 'description',
    customRender: ({ text }: { text: string | null }) => {
      if (!text) return '-';

      // 根据描述内容显示不同标签
      if (text.includes('小红书')) {
        return h(Tag, { color: 'red' }, { default: () => text });
      } else if (text.includes('大使')) {
        return h(Tag, { color: 'blue' }, { default: () => text });
      } else if (text.includes('公众号')) {
        return h(Tag, { color: 'green' }, { default: () => text });
      }

      return text;
    },
  },
  {
    title: 'VIP充值类型',
    dataIndex: 'vipRechargeType',
    key: 'vipRechargeType',
    customRender: ({ text }: { text: InviteManageApi.VipRechargeType }) => {
      return h(
        Tag,
        { color: 'purple' },
        { default: () => getVipRechargeTypeText(text) },
      );
    },
  },
  {
    title: '操作',
    key: 'action',
    customRender: ({
      record,
    }: {
      record: InviteManageApi.SpecialInviteCode;
    }) => {
      return h('div', [
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleViewHistory(record),
            style: { color: '#1890ff' },
          },
          {
            default: () => [
              h(EyeOutlined, { style: { marginRight: '4px' } }),
              '查看邀请记录',
            ],
          },
        ),
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleCopyInviteCode(record),
            style: { color: '#52c41a' },
          },
          {
            default: () => [
              h(CopyOutlined, { style: { marginRight: '4px' } }),
              '复制邀请码',
            ],
          },
        ),
        h(
          Button,
          {
            type: 'link',
            onClick: () => handleEditDescription(record),
            style: { color: '#faad14' },
          },
          {
            default: () => [
              h(EditOutlined, { style: { marginRight: '4px' } }),
              '编辑',
            ],
          },
        ),
      ]);
    },
  },
];

// 邀请历史表格列定义
const historyColumns = [
  {
    title: '时间',
    dataIndex: 'createTime',
    key: 'createTime',
    customRender: ({ text }: { text: any }) => formatTime(text),
  },
  {
    title: '用户账号',
    dataIndex: 'toUserAccount',
    key: 'toUserAccount',
    customRender: ({ text }: { text: string | null }) => text || '-',
  },
  {
    title: '充值类型',
    dataIndex: 'vipRechargeType',
    key: 'vipRechargeType',
    customRender: ({ text }: { text: string | null }) => {
      if (!text) return '-';
      return h(
        Tag,
        { color: 'purple' },
        { default: () => getVipRechargeTypeText(text) },
      );
    },
  },
];

onMounted(() => {
  fetchInviteCodeList();
});
</script>

<template>
  <div class="invite-manage-container">
    <Card title="特殊邀请码管理" :bordered="false">
      <!-- 添加特殊邀请码模块 -->
      <Card
        title="添加特殊邀请码："
        class="mb-4"
        :bordered="false"
        size="small"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="col-span-1">
            <div class="label mb-1">账号</div>
            <Input
              v-model:value="formData.account"
              placeholder="请输入邮箱账号"
            />
          </div>
          <div class="col-span-1">
            <div class="label mb-1">描述标记</div>
            <Input
              v-model:value="formData.description"
              placeholder="请输入描述，如：小红书/大使/公众号等"
              class="mb-2"
            />
            <div class="mb-2 text-xs text-gray-400">
              提示：可以添加"小红书"、"大使"、"公众号"等标记，系统会自动显示对应颜色的标签
            </div>
          </div>
          <div class="col-span-1 md:col-span-1">
            <div class="label mb-1">VIP充值类型</div>
            <div class="flex gap-2">
              <Select
                v-model:value="formData.vipRechargeType"
                :options="vipRechargeTypeOptions"
                style="width: 100%"
              />

              <Button type="primary" @click="handleGenerateInviteCode"
                >生成邀请码</Button
              >
            </div>
          </div>
        </div>
      </Card>
      <!-- 介绍说明 -->
      <div class="mb-2 ml-3 text-sm font-bold">特殊邀请码列表：</div>
      <div class="mb-4 rounded-md bg-gray-50 p-4">
        <div class="text-gray-600">
          特殊邀请码用于记录特殊邀请人的邀请历史，可以添加不同标记（小红书、大使、公众号等）以区分来源。
          您可以查看每个邀请码的使用记录，了解邀请效果。
        </div>
      </div>

      <!-- 表格区域 -->
      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="inviteCodeList"
        rowKey="inviteCodeId"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
        }"
        :scroll="{ x: 1000 }"
      />

      <!-- 邀请历史对话框 -->
      <Modal
        title="邀请历史记录"
        v-model:open="historyModalVisible"
        :footer="null"
        :maskClosable="true"
        centered
        width="700px"
      >
        <div v-if="currentInviteCode" class="mb-4">
          <span class="font-bold">邀请码：</span>{{ currentInviteCode }}
        </div>
        <div class="mb-4">
          <span class="font-bold">邀请人数：</span
          >{{ inviteHistoryList.length }}
        </div>
        <Table
          :loading="historyLoading"
          :columns="historyColumns"
          :dataSource="inviteHistoryList"
          :pagination="false"
        />
      </Modal>

      <!-- 编辑对话框 -->
      <Modal
        title="编辑信息"
        v-model:open="editDescModalVisible"
        :maskClosable="false"
        centered
        @ok="handleSaveDescription"
      >
        <div class="form-container">
          <div class="form-item mb-4">
            <div class="label mb-1">VIP充值类型</div>
            <Select
              v-model:value="newVipRechargeType"
              :options="vipRechargeTypeOptions"
              style="width: 100%"
            />
          </div>
          <div class="form-item mb-4">
            <div class="label mb-1">描述标记</div>
            <Input
              v-model:value="newDescription"
              placeholder="请输入描述，如：小红书/大使/公众号等"
            />
            <div class="mt-1 text-xs text-gray-400">
              提示：可以添加"小红书"、"大使"、"公众号"等标记，系统会自动显示对应颜色的标签
            </div>
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
