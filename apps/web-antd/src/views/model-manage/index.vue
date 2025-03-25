<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { InputNumber, Table, Card, message } from 'ant-design-vue';
import { getModelFailureRates } from '#/api/core/modelManage';
import type { ModelManageApi } from '#/api/core/modelManage';

// 定义状态变量
const loading = ref(false);
const hours = ref<number>(1);
const failureRates = ref<ModelManageApi.ModelFailureRate[]>([]);

// 表格列定义
const columns = [
  {
    title: '配置名称',
    dataIndex: 'configName',
    key: 'configName',
  },
  {
    title: '模型',
    dataIndex: 'model',
    key: 'model',
  },
  {
    title: '总请求数',
    dataIndex: 'totalRequests',
    key: 'totalRequests',
  },
  {
    title: '成功数',
    dataIndex: 'successCount',
    key: 'successCount',
  },
  {
    title: '失败数',
    dataIndex: 'failureCount',
    key: 'failureCount',
  },
  {
    title: '失败率',
    dataIndex: 'failureRate',
    key: 'failureRate',
    customRender: ({ text }: { text: number | null }) => {
      if (text === null) return '-';
      return `${text.toFixed(2)}%`;
    },
  },
  {
    title: '环境',
    dataIndex: 'environment',
    key: 'environment',
  },
];

// 获取数据的方法
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getModelFailureRates(hours.value);
    failureRates.value = data || [];
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 小时数变化处理
const handleHoursChange = (value: number) => {
  hours.value = value;
  fetchData();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="model-manage">
    <Card class="model-manage-card">
      <div class="header">
        <h2>模型失败率统计</h2>
        <div class="hours-input">
          <span class="hours-label">统计时长：</span>
          <InputNumber
            v-model:value="hours"
            :min="1"
            :precision="0"
            @change="handleHoursChange"
            placeholder="请输入小时数"
            :style="{ width: '120px' }"
          />
          <span class="hours-unit">小时</span>
        </div>
      </div>

      <Table
        :columns="columns"
        :dataSource="failureRates"
        rowKey="configName"
        :loading="loading"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `共 ${total} 条`,
        }"
      />
    </Card>
  </div>
</template>

<style lang="less" scoped>
.model-manage {
  padding: 16px;

  &-card {
    background-color: var(--card-bg-color);
    border-radius: 8px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      color: var(--high-text-color);
      margin: 0;
    }
  }

  .hours-input {
    display: flex;
    align-items: center;
    gap: 8px;

    .hours-label {
      white-space: nowrap;
    }

    .hours-unit {
      white-space: nowrap;
    }
  }

  :deep(.ant-table) {
    background-color: var(--bg-light-color);
  }

  :deep(.ant-pagination-item-active) {
    border-color: var(--border-color);

    a {
      color: var(--high-text-color);
    }
  }

  @media (max-width: 576px) {
    .header {
      flex-direction: column;
      align-items: flex-start;

      h2 {
        margin-bottom: 16px;
      }

      .hours-input {
        width: 100%;
      }
    }
  }
}
</style>
