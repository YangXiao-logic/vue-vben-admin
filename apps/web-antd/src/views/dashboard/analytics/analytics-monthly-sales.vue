<script lang="ts" setup>
import { getPayChartApi, AnalyticsManageApi } from '#/api/core/analytics';
import { ref, onMounted } from 'vue';
import { DatePicker, Radio } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const loading = ref(false);
const monthlyTotal = ref(0);

// 当前选择的月份
const currentMonth = ref<Dayjs>(dayjs());

// 支付类型
const payType = ref(AnalyticsManageApi.PayType.VIP_RECHARGE);

const fetchMonthlyData = async (date: Dayjs) => {
  try {
    loading.value = true;
    // 获取选择月份的第一天和最后一天
    const startDate = date.startOf('month');
    const endDate = date.endOf('month');

    const params = {
      startDate: startDate.format('YYYY-MM-DDT00:00:00Z'),
      endDate: endDate.format('YYYY-MM-DDT23:59:59Z'),
      payType: payType.value,
    };

    const response = await getPayChartApi(params);
    // 计算月度总额
    monthlyTotal.value = (response.dataPoints || []).reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 月份变化处理
const handleMonthChange = (value: string | Dayjs, dateString: string) => {
  if (value) {
    const monthDate = typeof value === 'string' ? dayjs(value) : value;
    currentMonth.value = monthDate;
    fetchMonthlyData(monthDate);
  }
};

// 支付类型变化处理
const handlePayTypeChange = (e: any) => {
  payType.value = e.target.value;
  fetchMonthlyData(currentMonth.value);
};

onMounted(() => {
  fetchMonthlyData(currentMonth.value);
});
</script>

<template>
  <div class="monthly-sales">
    <div class="filter-container">
      <div class="month-picker">
        <DatePicker
          v-model:value="currentMonth"
          @change="handleMonthChange"
          picker="month"
          :allowClear="false"
          format="YYYY年MM月"
        />
      </div>

      <Radio.Group :value="payType" @change="handlePayTypeChange">
        <Radio.Button :value="AnalyticsManageApi.PayType.VIP_RECHARGE"
          >会员充值</Radio.Button
        >
        <Radio.Button :value="AnalyticsManageApi.PayType.PDF_PACKAGE"
          >页数充值</Radio.Button
        >
      </Radio.Group>
    </div>

    <div class="total-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="total-amount">
        <div class="label">{{ currentMonth.format('YYYY年MM月') }}销售总额</div>
        <div class="amount">¥{{ monthlyTotal.toLocaleString('zh-CN') }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.monthly-sales {
  padding: 24px;
  background: var(--card-bg-color);
  border-radius: 8px;

  .filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .total-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    .loading {
      color: var(--high-text-color);
    }

    .total-amount {
      text-align: center;

      .label {
        font-size: 16px;
        color: var(--high-text-color);
        margin-bottom: 16px;
      }

      .amount {
        font-size: 36px;
        font-weight: bold;
        color: var(--ant-primary-color);
      }
    }
  }
}
</style>
