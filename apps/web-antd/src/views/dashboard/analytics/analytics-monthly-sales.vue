<script lang="ts" setup>
import { getPayChartApi, AnalyticsManageApi } from '#/api/core/analytics';
import { ref, onMounted, computed } from 'vue';
import { DatePicker } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const loading = ref(false);
const vipTotal = ref(0);
const pdfTotal = ref(0);

// 当前选择的月份
const currentMonth = ref<Dayjs>(dayjs());

// 计算总金额
const totalAmount = computed(() => vipTotal.value + pdfTotal.value);

const fetchMonthlyData = async (date: Dayjs) => {
  try {
    loading.value = true;
    // 获取选择月份的第一天和最后一天
    const startDate = date.startOf('month');
    const endDate = date.endOf('month');

    const params = {
      startDate: startDate.format('YYYY-MM-DDT00:00:00Z'),
      endDate: endDate.format('YYYY-MM-DDT23:59:59Z'),
    };

    // 并行请求两个接口
    const [vipResponse, pdfResponse] = await Promise.all([
      getPayChartApi({
        ...params,
        payType: AnalyticsManageApi.PayType.VIP_RECHARGE,
      }),
      getPayChartApi({
        ...params,
        payType: AnalyticsManageApi.PayType.PDF_PACKAGE,
      }),
    ]);

    // 计算会员充值总额
    vipTotal.value = (vipResponse.dataPoints || []).reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );

    // 计算页数充值总额
    pdfTotal.value = (pdfResponse.dataPoints || []).reduce(
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
    </div>

    <div class="total-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="amounts-grid">
        <div class="amount-card total">
          <div class="label">
            {{ currentMonth.format('YYYY年MM月') }}销售总额
          </div>
          <div class="amount">¥{{ totalAmount.toLocaleString('zh-CN') }}</div>
        </div>
        <div class="amount-card sub">
          <div class="label">会员充值总额</div>
          <div class="amount">¥{{ vipTotal.toLocaleString('zh-CN') }}</div>
        </div>
        <div class="amount-card sub">
          <div class="label">页数充值总额</div>
          <div class="amount">¥{{ pdfTotal.toLocaleString('zh-CN') }}</div>
        </div>
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
    justify-content: center;
    margin-bottom: 32px;
  }

  .total-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    .loading {
      color: var(--high-text-color);
    }

    .amounts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      width: 100%;
      max-width: 900px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }

      .amount-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        text-align: center;
        transition: box-shadow 0.2s;
        position: relative;

        &.total {
          background: var(--bg-hover-color);
          box-shadow: 0 4px 16px rgba(137, 91, 255, 0.08);
          border: 2px solid var(--ant-primary-color);
          .label {
            font-size: 18px;
            color: var(--high-text-color);
            margin-bottom: 18px;
            font-weight: 600;
          }
          .amount {
            font-size: 46px;
            font-weight: bold;
            color: var(--ant-primary-color);
            letter-spacing: 2px;
          }
        }
        &.sub {
          background: var(--bg-light-color);
          .label {
            font-size: 15px;
            color: var(--high-text-color);
            margin-bottom: 10px;
            font-weight: 500;
          }
          .amount {
            font-size: 28px;
            font-weight: 600;
            color: var(--ant-primary-color);
          }
        }
      }
    }
  }
}
</style>
