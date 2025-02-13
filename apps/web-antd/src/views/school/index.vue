<script lang="ts" setup>
import type { SelectValue } from 'ant-design-vue/es/select';

import type { SchoolApi } from '#/api/core/school';

import { onMounted, ref, watch } from 'vue';

import {
  Button,
  Card,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Spin,
  Switch,
} from 'ant-design-vue';

import {
  addSchoolApi,
  bindCourseNameRuleApi,
  bindEmailRuleApi,
  deleteEmailRuleApi,
  editEmailRuleApi,
  editSchoolNameApi,
  getCourseNameRuleApi,
  getEmailRuleListApi,
  getSchoolListApi,
  updateCourseNameRuleApi,
} from '#/api/core/school';

// 表格加载状态
const loading = ref(false);
// 学校列表数据
const schoolList = ref<SchoolApi.School[]>([]);
// 选中的学校ID
const selectedSchoolId = ref<SelectValue>(null);
// 学校邮箱规则列表数据
const emailRuleList = ref<SchoolApi.SchoolEmailRule[]>([]);
// 新学校名称
const newSchoolName = ref<string>('');
// 编辑学校名称
const editSchoolName = ref<string>('');
// 新邮箱规则
const newEmailRule = ref<string>('');
// 编辑邮箱规则
const editEmailRule = ref<string>('');
// 选中的邮箱规则ID
const selectedEmailRuleId = ref<SelectValue>(null);

// 课程名称规则相关的状态
const courseNameRule = ref<null | SchoolApi.DynamicCourseForm>(null);
const fields = ref<
  {
    isEditing: boolean;
    label: string;
    name: string;
    placeholder: string;
    ruleList: SchoolApi.Rule[];
  }[]
>([]);

// 获取学校列表
const fetchSchoolList = async () => {
  try {
    loading.value = true;
    const data = await getSchoolListApi();
    schoolList.value = data;
    selectedSchoolId.value = data[0]?.schoolId || null;
  } finally {
    loading.value = false;
  }
};

// 根据选中的学校ID获取邮箱规则列表
async function getEmailRuleList() {
  if (selectedSchoolId.value) {
    loading.value = true;
    const data = await getEmailRuleListApi(selectedSchoolId.value);
    emailRuleList.value = data;
    selectedEmailRuleId.value = data[0]?.schoolEmailRuleId || null;
    loading.value = false;
  }
}

// 获取课程名称规则
const fetchCourseNameRule = async () => {
  if (selectedSchoolId.value) {
    const data = await getCourseNameRuleApi(selectedSchoolId.value);
    courseNameRule.value = data;
    fields.value =
      data?.fields?.map((item) => ({ ...item, isEditing: false })) || [];
  }
};

// 更新课程名称规则
const handleUpsertCourseNameRule = async () => {
  const dynamicCourseForm: SchoolApi.DynamicCourseForm = {
    fields: fields.value.map((field) => ({
      ...field,
      ruleList: field.ruleList || [],
    })),
    schoolId: selectedSchoolId.value as string,
  };

  try {
    await (courseNameRule.value?.dynamicCourseFormId
      ? updateCourseNameRuleApi({
          ...dynamicCourseForm,
          dynamicCourseFormId: courseNameRule.value.dynamicCourseFormId,
        })
      : bindCourseNameRuleApi(dynamicCourseForm));
    message.success('保存成功');
    fetchCourseNameRule();
  } catch (error) {
    console.error(error);
  }
};

// 删除课程名称规则字段
const handleDeleteCourseNameRule = async (index: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后不能恢复，确定要删除吗？',
    centered: true,
    async onOk() {
      try {
        fields.value.splice(index, 1);
        const dynamicCourseForm: SchoolApi.DynamicCourseForm = {
          fields: fields.value,
          schoolId: selectedSchoolId.value as string,
        };
        await updateCourseNameRuleApi(dynamicCourseForm);
        message.success('删除成功');
        fetchCourseNameRule();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

watch(selectedSchoolId, () => {
  getEmailRuleList();
  fetchCourseNameRule(); // 监听学校ID变化，获取课程名称规则
});

onMounted(() => {
  fetchSchoolList();
  getEmailRuleList();
  fetchCourseNameRule(); // 初始获取课程名称规则
});

const handleSchoolChange = (value: SelectValue) => {
  selectedSchoolId.value = value as string;
};

const handleNewSchoolNameInput = (event: Event) => {
  newSchoolName.value = (event.target as HTMLInputElement).value;
};

const handleEditSchoolNameInput = (event: Event) => {
  editSchoolName.value = (event.target as HTMLInputElement).value;
};

const handleNewEmailRuleInput = (event: Event) => {
  newEmailRule.value = (event.target as HTMLInputElement).value;
};

const handleEditEmailRuleInput = (event: Event) => {
  editEmailRule.value = (event.target as HTMLInputElement).value;
};

const handleEmailRuleSelect = (value: SelectValue) => {
  selectedEmailRuleId.value = value as string;
};

// 添加学校
const handleAddSchool = async () => {
  if (!newSchoolName.value) {
    message.error('请输入学校名称');
    return;
  }

  Modal.confirm({
    title: '确认添加',
    content: '确定要添加此学校吗？',
    centered: true,
    async onOk() {
      try {
        await addSchoolApi(newSchoolName.value);
        message.success('添加成功');
        fetchSchoolList();
        newSchoolName.value = '';
      } catch (error) {
        console.error(error);
      }
    },
  });
};

// 编辑学校名称
const handleEditSchoolName = async (schoolId: string, newName: string) => {
  await editSchoolNameApi({ schoolId, name: newName });
  fetchSchoolList(); // 重新获取学校列表
  editSchoolName.value = ''; // 清空输入框
};

// 绑定邮箱规则
const handleBindEmailRule = async () => {
  if (!newEmailRule.value) {
    message.error('请输入邮箱规则');
    return;
  }
  await bindEmailRuleApi({
    schoolEmailRuleId: selectedEmailRuleId.value as string,
    schoolId: selectedSchoolId.value as string,
    emailRule: newEmailRule.value,
  });
  getEmailRuleList(); // 重新获取邮箱规则列表
  newEmailRule.value = ''; // 清空输入框
};

// 编辑邮箱规则
const handleEditEmailRule = async () => {
  if (!selectedEmailRuleId.value || !editEmailRule.value) {
    message.error('请选择邮箱规则并输入新规则');
    return;
  }
  await editEmailRuleApi({
    schoolEmailRuleId: selectedEmailRuleId.value as string,
    schoolId: selectedSchoolId.value as string,
    emailRule: editEmailRule.value,
  });
  getEmailRuleList(); // 重新获取邮箱规则列表
  editEmailRule.value = ''; // 清空输入框
};

// 删除邮箱规则
const handleDeleteEmailRule = async () => {
  if (!selectedEmailRuleId.value) {
    message.error('请选择要删除的邮箱规则');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '删除后不能恢复，确定要删除吗？',
    centered: true,
    async onOk() {
      try {
        await deleteEmailRuleApi(selectedEmailRuleId.value);
        message.success('删除成功');
        getEmailRuleList();
        selectedEmailRuleId.value = null;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

// 添加字段
const addField = () => {
  if (fields.value?.[fields.value.length - 1]?.name === '') {
    message.error('最新一条字段的 name 还为空，请完成当前编辑的字段再新建哦');
    return;
  }
  fields.value.push({
    name: '',
    label: '',
    placeholder: '',
    ruleList: [
      {
        errorMessage: '',
        required: false,
        pattern: undefined,
        maxLength: undefined,
        minLength: undefined,
      },
    ],
    isEditing: true,
  });
};

// 编辑字段
const editField = (index: number) => {
  if (fields.value[index]) {
    fields.value[index].isEditing = !fields.value[index].isEditing; // 切换编辑状态
  } else {
    console.error(`Field at index ${index} is undefined.`);
  }
};

// 修改添加规则的函数，添加编辑状态检查
const addRule = (fieldIndex: number) => {
  if (!fields.value[fieldIndex].isEditing) {
    message.warning('请先点击编辑按钮');
    return;
  }

  if (!fields.value[fieldIndex].ruleList) {
    fields.value[fieldIndex].ruleList = [];
  }

  fields.value[fieldIndex].ruleList.push({
    errorMessage: '',
    required: false,
    pattern: undefined,
    maxLength: undefined,
    minLength: undefined,
  });
};

// 修改删除规则的函数，添加编辑状态检查
const deleteRule = (fieldIndex: number, ruleIndex: number) => {
  if (!fields.value[fieldIndex].isEditing) {
    message.warning('请先点击编辑按钮');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '删除后不能恢复，确定要删除吗？',
    centered: true,
    onOk() {
      fields.value[fieldIndex].ruleList.splice(ruleIndex, 1);
    },
  });
};
</script>

<template>
  <div>
    <Card title="学校管理" class="mb-5">
      <div style="display: flex; gap: 15px; align-items: center">
        <Select
          :value="selectedSchoolId"
          placeholder="选择学校"
          style="width: 220px"
          @change="handleSchoolChange"
        >
          <Select.Option
            v-for="school in schoolList"
            :key="school.schoolId"
            :value="school.schoolId"
          >
            {{ school.name }}
          </Select.Option>
        </Select>
      </div>
      <div style="display: flex; gap: 15px; align-items: center" class="mt-4">
        <Input
          :value="newSchoolName"
          placeholder="输入新学校名称"
          style="width: 220px"
          @input="handleNewSchoolNameInput"
        />
        <Button type="primary" @click="handleAddSchool()">添加学校</Button>

        <Input
          :value="editSchoolName"
          placeholder="编辑学校名称"
          style="width: 220px"
          @input="handleEditSchoolNameInput"
        />
        <Button
          type="primary"
          @click="
            handleEditSchoolName(selectedSchoolId as string, editSchoolName)
          "
        >
          确定编辑
        </Button>
      </div>
    </Card>

    <Card title="邮箱规则管理" class="mb-5">
      <div class="flex flex-col gap-5">
        <div style="display: flex; gap: 15px; align-items: center">
          <Input
            :value="newEmailRule"
            placeholder="输入新邮箱规则"
            style="width: 100%"
            @input="handleNewEmailRuleInput"
          />
          <Button type="primary" @click="handleBindEmailRule()">
            新增邮箱规则
          </Button>
        </div>

        <div style="display: flex; gap: 15px; align-items: center">
          <Select
            :value="selectedEmailRuleId"
            placeholder="选择邮箱规则"
            style="width: 220px"
            @change="handleEmailRuleSelect"
          >
            <Select.Option
              v-for="rule in emailRuleList"
              :key="rule.schoolEmailRuleId"
              :value="rule.schoolEmailRuleId"
            >
              {{ rule.emailRule }}
            </Select.Option>
          </Select>

          <Input
            :value="editEmailRule"
            placeholder="编辑此规则"
            style="width: 220px"
            @input="handleEditEmailRuleInput"
          />
          <Button type="primary" @click="handleEditEmailRule()">
            确定编辑
          </Button>
          <Button danger @click="handleDeleteEmailRule()">删除此规则</Button>
        </div>
        <div>
          当前邮箱规则：
          <Spin v-if="loading" />
          <List v-else>
            <List.Item
              v-for="rule in emailRuleList"
              :key="rule.schoolEmailRuleId"
            >
              {{ rule.emailRule }}
            </List.Item>
          </List>
        </div>
      </div>
    </Card>

    <Card title="课程创建规则管理" class="mb-5">
      <div class="flex flex-col gap-4">
        <div class="mt-4">
          <div class="mb-2 flex justify-between">
            <div class="mb-2 font-medium">当前课程创建字段：</div>
            <Button type="primary" @click="addField">点击添加字段</Button>
          </div>
          <Spin v-if="loading" />
          <List v-if="fields.length > 0" bordered>
            <List.Item v-for="(field, index) in fields" :key="index">
              <div class="flex flex-col gap-2">
                <div class="flex flex-wrap gap-2">
                  <div class="flex-1">
                    <strong>显示标签:</strong>
                    <Input
                      :value="field.label"
                      placeholder="label"
                      style="width: 100%"
                      :disabled="!field.isEditing"
                      @update:value="(val) => (field.label = val)"
                    />
                  </div>
                  <div class="flex-1">
                    <strong>字段名称:</strong>
                    <Input
                      :value="field.name"
                      placeholder="name"
                      style="width: 100%"
                      :disabled="!field.isEditing"
                      @update:value="(val) => (field.name = val)"
                    />
                  </div>

                  <div class="flex-1">
                    <strong>占位提示:</strong>
                    <Input
                      :value="field.placeholder"
                      placeholder="placeholder"
                      style="width: 100%"
                      :disabled="!field.isEditing"
                      @update:value="(val) => (field.placeholder = val)"
                    />
                  </div>
                </div>
                <div v-if="field.ruleList?.length">
                  <div class="flex items-center justify-between">
                    <strong>验证规则:</strong>
                    <Button
                      type="primary"
                      size="small"
                      :disabled="!field.isEditing"
                      @click="() => addRule(index)"
                    >
                      添加规则
                    </Button>
                  </div>
                  <div class="ml-4 list-inside list-disc">
                    <div
                      v-for="(rule, ruleIndex) in field.ruleList"
                      :key="ruleIndex"
                      class="border-b py-2 last:border-b-0"
                    >
                      <div class="mb-2 flex items-center justify-between">
                        <span class="text-gray-500"
                          >规则 {{ ruleIndex + 1 }}</span
                        >
                        <Button
                          danger
                          size="small"
                          :disabled="!field.isEditing"
                          @click="() => deleteRule(index, ruleIndex)"
                        >
                          删除本条规则
                        </Button>
                      </div>
                      <div
                        class="flex flex-wrap items-center justify-center gap-2"
                      >
                        <div class="flex flex-1 items-center justify-center">
                          <strong class="w-[120px]">错误提示信息:</strong>
                          <Input
                            :value="rule.errorMessage"
                            placeholder="输入错误提示信息"
                            :disabled="!field.isEditing"
                            @update:value="
                              (val) =>
                                (field.ruleList[ruleIndex].errorMessage = val)
                            "
                          />
                        </div>
                        <div class="w-[80px]">
                          <strong>必填:</strong>
                          <Switch
                            v-model:checked="rule.required"
                            :disabled="!field.isEditing"
                          />
                        </div>
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <div
                          class="flex w-[310px] items-center justify-between"
                        >
                          <strong>最小长度:</strong>
                          <InputNumber
                            :value="rule.minLength"
                            :min="0"
                            :max="rule.maxLength"
                            :disabled="!field.isEditing"
                            @update:value="
                              (val: number) =>
                                (field.ruleList[ruleIndex].minLength = val)
                            "
                          />
                          <strong>最大长度:</strong>
                          <InputNumber
                            :value="rule.maxLength"
                            :min="rule.minLength"
                            :disabled="!field.isEditing"
                            @update:value="
                              (val: number) =>
                                (field.ruleList[ruleIndex].maxLength = val)
                            "
                          />
                        </div>
                        <div class="flex-1">
                          <strong>正则表达式:</strong>
                          <Input
                            :value="rule.pattern"
                            placeholder="输入正则表达式"
                            style="width: 100%"
                            :disabled="!field.isEditing"
                            @update:value="
                              (val) => (field.ruleList[ruleIndex].pattern = val)
                            "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex justify-center">
                  <Button
                    type="primary"
                    :disabled="!field.isEditing"
                    @click="() => addRule(index)"
                  >
                    添加验证规则
                  </Button>
                </div>
                <div class="flex items-center gap-4">
                  <Button
                    v-if="field.isEditing"
                    @click="() => handleUpsertCourseNameRule()"
                  >
                    确定
                  </Button>
                  <Button
                    v-if="!field.isEditing"
                    @click="() => editField(index)"
                  >
                    编辑
                  </Button>
                  <Button
                    danger
                    @click="() => handleDeleteCourseNameRule(index)"
                  >
                    删除
                  </Button>
                </div>
              </div>
            </List.Item>
          </List>
          <div v-else class="my-8 flex flex-col items-center gap-4">
            <div>暂无字段</div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.flex-wrap {
  flex-wrap: wrap;
}
</style>
