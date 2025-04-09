<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { getPayChartApi, AnalyticsManageApi } from '#/api/core/analytics';
import { ref, onMounted, reactive, computed } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { DatePicker, Radio } from 'ant-design-vue';
import dayjs from 'dayjs';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
const loading = ref(false);

// 默认查询最近1个月数据
const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);
oneMonthAgo.setHours(0, 0, 0, 0);

// 设置当天最后时刻
const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

// 格式化日期为固定格式的 ISO 字符串
const formatISODate = (date: Date, isEnd: boolean = false): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = isEnd ? '23' : '01';
  const minutes = isEnd ? '59' : '00';
  const seconds = isEnd ? '59' : '00';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
};

const chartParams = reactive({
  startDate: formatISODate(oneMonthAgo, false),
  endDate: formatISODate(endOfToday, true),
  payType: AnalyticsManageApi.PayType.VIP_RECHARGE,
});

// 日期范围值
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs(oneMonthAgo),
  dayjs(endOfToday),
]);

// 当前选择的时间范围
const currentDateRange = ref('month');

const chartData = ref<AnalyticsManageApi.PaymentDataPoint[]>([]);

const fetchChartData = async () => {
  try {
    loading.value = true;
    const response = await getPayChartApi(chartParams);
    chartData.value = response.dataPoints || [];
    renderChart();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const dateLabels = computed(() => {
  return chartData.value.map((item) => item.date || '');
});

const countData = computed(() => {
  return chartData.value.map((item) => item.count || 0);
});

const amountData = computed(() => {
  return chartData.value.map((item) => item.amount || 0);
});

const renderChart = () => {
  renderEcharts({
    grid: {
      bottom: 10,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: 80,
    },
    legend: {
      data: ['支付次数', '支付金额'],
      right: 10,
      top: 10,
    },
    series: [
      {
        name: '支付次数',
        data: countData.value,
        itemStyle: {
          color: '#895BFF',
        },
        smooth: true,
        type: 'line',
      },
      {
        name: '支付金额',
        data: amountData.value,
        itemStyle: {
          color: '#019680',
        },
        yAxisIndex: 1,
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#8554ED',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: dateLabels.value,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        name: '支付次数',
        axisTick: {
          show: false,
        },
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
      {
        name: '支付金额',
        axisTick: {
          show: false,
        },
        position: 'right',
        splitLine: {
          show: false,
        },
        type: 'value',
      },
    ],
  });
};

// 切换支付类型
const changePayType = (type: AnalyticsManageApi.PayType) => {
  chartParams.payType = type;
  fetchChartData();
};

// 日期范围变化时更新查询参数
const handleDateRangeChange = (
  value: [dayjs.Dayjs, dayjs.Dayjs] | [string, string],
  dateString: [string, string],
) => {
  if (Array.isArray(value)) {
    // 确保转换为 Dayjs 对象
    const dates: [dayjs.Dayjs, dayjs.Dayjs] = [
      typeof value[0] === 'string' ? dayjs(value[0]) : value[0],
      typeof value[1] === 'string' ? dayjs(value[1]) : value[1],
    ];

    chartParams.startDate = formatISODate(dates[0].toDate(), false);
    chartParams.endDate = formatISODate(dates[1].toDate(), true);
    fetchChartData();
  }
};

// 预设时间范围选择
const handlePresetRangeChange = (e: any) => {
  const value = e.target.value;
  currentDateRange.value = value;

  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  let startDate = new Date(now);

  switch (value) {
    case 'week':
      // 近一周
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // 近一个月
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'quarter':
      // 近三个月
      startDate.setMonth(now.getMonth() - 3);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'halfYear':
      // 近半年
      startDate.setMonth(now.getMonth() - 6);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      // 近一年
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setDate(now.getDate());
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      break;
  }

  chartParams.startDate = formatISODate(startDate, false);
  chartParams.endDate = formatISODate(endDate, true);
  dateRange.value = [dayjs(startDate), dayjs(endDate)];
  fetchChartData();
};

onMounted(() => {
  fetchChartData();
});
</script>

<template>
  <div class="analytics-trends">
    <div class="filter-container">
      <div class="date-filters">
        <Radio.Group
          v-model:value="currentDateRange"
          @change="handlePresetRangeChange"
          style="margin-right: 16px"
        >
          <Radio.Button value="week">近一周</Radio.Button>
          <Radio.Button value="month">近一个月</Radio.Button>
          <Radio.Button value="quarter">近三个月</Radio.Button>
          <Radio.Button value="halfYear">近半年</Radio.Button>
          <Radio.Button value="year">近一年</Radio.Button>
        </Radio.Group>

        <DatePicker.RangePicker
          v-model:value="dateRange"
          @change="handleDateRangeChange"
          :allowClear="false"
          format="YYYY-MM-DD"
        />
      </div>

      <div class="type-filters">
        <Radio.Group
          :value="chartParams.payType"
          @change="(e) => changePayType(e.target.value)"
        >
          <Radio.Button :value="AnalyticsManageApi.PayType.VIP_RECHARGE"
            >会员充值</Radio.Button
          >
          <Radio.Button :value="AnalyticsManageApi.PayType.PDF_PACKAGE"
            >页数充值</Radio.Button
          >
        </Radio.Group>
      </div>
    </div>

    <EchartsUI ref="chartRef" height="400px" />
  </div>
</template>

<style lang="less" scoped>
.analytics-trends {
  .filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .date-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    @media (max-width: 768px) {
      width: 100%;
      margin-bottom: 12px;
    }
  }

  .type-filters {
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
</style>
