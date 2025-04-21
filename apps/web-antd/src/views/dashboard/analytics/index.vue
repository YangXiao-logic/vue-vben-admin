<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';
import { ref, onMounted, computed } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';
import { getAnalyticsApi } from '#/api/core/analytics';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsUserGrowth from './analytics-user-growth.vue';

const analyticsData = ref({
  todayRegisterCount: 0,
  todayPayAmount: 0,
  todayPublicUploadFileCount: 0,
  todayPrivateUploadFileCount: 0,
  todayChatCount: 0,
});

const loading = ref(true);

const fetchAnalyticsData = async () => {
  try {
    loading.value = true;
    const response = await getAnalyticsApi();
    analyticsData.value = {
      todayRegisterCount: response.todayRegisterCount || 0,
      todayPayAmount: response.todayPayAmount || 0,
      todayPublicUploadFileCount: response.todayPublicUploadFileCount || 0,
      todayPrivateUploadFileCount: response.todayPrivateUploadFileCount || 0,
      todayChatCount: response.todayChatCount || 0,
    };
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnalyticsData();
});

const overviewItems = computed(() => [
  {
    icon: SvgCardIcon,
    title: '支付额',
    value: analyticsData.value.todayPayAmount,
  },
  {
    icon: SvgCakeIcon,
    title: '注册量',
    value: analyticsData.value.todayRegisterCount,
  },
  {
    icon: SvgDownloadIcon,
    title: '公共库上传',
    value: analyticsData.value.todayPublicUploadFileCount,
  },
  {
    icon: SvgDownloadIcon,
    title: '私有库上传',
    value: analyticsData.value.todayPrivateUploadFileCount,
  },
  {
    icon: SvgBellIcon,
    title: '对话量',
    value: analyticsData.value.todayChatCount,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '支付数据趋势',
    value: 'trends',
  },
  {
    label: '用户增长趋势',
    value: 'userGrowth',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #userGrowth>
        <AnalyticsUserGrowth />
      </template>
    </AnalysisChartsTabs>
  </div>
</template>
