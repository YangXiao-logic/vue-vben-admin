<script lang="ts" setup>
import type { SchoolApi } from '#/api/core/school';

import { ref } from 'vue';

import { getSchoolListApi } from '#/api/core/school';

// 表格加载状态
const loading = ref(false);
// 学校列表数据
const schoolList = ref<SchoolApi.School[]>([]);

// 获取学校列表
async function getSchoolList() {
  try {
    loading.value = true;
    const data = await getSchoolListApi();
    schoolList.value = data;
  } finally {
    loading.value = false;
  }
}

// 初始化获取列表
getSchoolList();
</script>

<template>
  <div>
    {{ schoolList }}
  </div>
</template>
