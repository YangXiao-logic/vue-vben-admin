<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  message,
  Modal,
  InputNumber,
  Form,
  Select,
} from 'ant-design-vue';
import {
  getRedemptionCodeList,
  exportRedemptionCode,
  RedemptionCodeApi,
} from '#/api/core/redemptionCodeManage';
import { downloadFileFromBlobPart, formatDateTime } from '@vben/utils';

// 状态变量
const loading = ref(false);
const codeList = ref<RedemptionCodeApi.RedemptionCode[]>([]);
const generateModalVisible = ref(false);
const generateLoading = ref(false);
const generateForm = ref({
  count: 1,
  vipRechargeType: RedemptionCodeApi.VipRechargeType.RegularVipMonth,
});

// 表格列定义
const columns = [
  {
    title: '兑换码',
    dataIndex: 'redemptionCode',
    key: 'redemptionCode',
  },
  {
    title: '状态',
    dataIndex: 'isUsed',
    key: 'isUsed',
    customRender: ({ text }: { text: boolean }) => (text ? '已使用' : '未使用'),
  },
  {
    title: '使用用户',
    dataIndex: 'account',
    key: 'account',
    customRender: ({ text }: { text: string }) => text || '-',
  },
  {
    title: 'VIP类型',
    dataIndex: 'vipRechargeType',
    key: 'vipRechargeType',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    customRender: ({ text }: { text: string }) => formatDateTime(text),
  },
  {
    title: '使用时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    customRender: ({ record }: { record: RedemptionCodeApi.RedemptionCode }) => {
      return record.isUsed && record.updateTime ? formatDateTime(record.updateTime) : '-';
    },
  },
];

// VIP类型选项
const vipTypeOptions = [
  {
    label: '半年会员',
    value: RedemptionCodeApi.VipRechargeType.RegularVipHalfYear,
  },
  {
    label: '月度会员',
    value: RedemptionCodeApi.VipRechargeType.RegularVipMonth,
  },
  {
    label: '周会员',
    value: RedemptionCodeApi.VipRechargeType.RegularVipWeek,
  },
];

// 获取兑换码列表
const fetchCodeList = async () => {
  try {
    loading.value = true;
    const res = await getRedemptionCodeList();
    codeList.value = res || [];
  } catch (error) {
    console.error('获取兑换码列表失败:', error);
    message.error('获取兑换码列表失败');
  } finally {
    loading.value = false;
  }
};

// 生成兑换码
const handleGenerateCode = async () => {
  if (!generateForm.value.count || generateForm.value.count < 1) {
    message.error('请输入有效的生成数量');
    return;
  }

  try {
    generateLoading.value = true;
    const res = await exportRedemptionCode({
      count: generateForm.value.count,
      vipRechargeType: generateForm.value.vipRechargeType,
    });

    if (res && res.length > 0) {
      // 将兑换码导出为txt文件
      const content = res.map(item => item.redemptionCode).join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      // 下载文件
      downloadFileFromBlobPart({
        fileName: `兑换码_${formatDateTime(new Date())}.txt`,
        source: blob,
      });

      message.success('兑换码生成成功并已下载');
      generateModalVisible.value = false;
      fetchCodeList(); // 刷新列表
    }
  } catch (error) {
    console.error('生成兑换码失败:', error);
    message.error('生成兑换码失败');
  } finally {
    generateLoading.value = false;
  }
};

onMounted(() => {
  fetchCodeList();
});
</script>

<template>
  <div class="redemption-code-container">
    <Card title="兑换码管理" :bordered="false">
      <!-- 操作区域 -->
      <div class="search-container my-4 flex flex-wrap items-center gap-4">
        <Button
          type="primary"
          @click="generateModalVisible = true"
        >
          生成兑换码
        </Button>
      </div>

      <!-- 表格区域 -->
      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="codeList"
        rowKey="redemptionCode"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
        }"
      />

      <!-- 生成兑换码对话框 -->
      <Modal
        title="生成兑换码"
        v-model:open="generateModalVisible"
        :maskClosable="false"
        centered
        @ok="handleGenerateCode"
        :confirmLoading="generateLoading"
      >
        <Form layout="vertical">
          <Form.Item
            label="VIP类型"
            :rules="[{ required: true, message: '请选择VIP类型' }]"
          >
            <Select
              v-model:value="generateForm.vipRechargeType"
              :options="vipTypeOptions"
              placeholder="请选择VIP类型"
            />
          </Form.Item>
          <Form.Item
            label="生成数量"
            :rules="[{ required: true, message: '请输入生成数量' }]"
          >
            <InputNumber
              v-model:value="generateForm.count"
              :min="1"
              :max="100"
              style="width: 100%"
              placeholder="请输入要生成的兑换码数量"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  </div>
</template>

<style scoped>
.redemption-code-container {
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
