<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Table,
} from 'ant-design-vue';

import {
  CollectionApi,
  deleteCollectionApi,
  editCollectionApi,
  getCollectionContent,
  insertCollectionApi,
} from '#/api/core/collectionMange';

const collections = ref<CollectionApi.CollectionContentVo[]>([]);
const isEditModalVisible = ref(false);
const newCollectionName = ref('');
const parentCollectionId = ref('');
const editCollectionName = ref('');
const currentEditId = ref(null);
const collectionId = ref('1818486244678901762');
const collectionRankRule = ref<CollectionApi.CollectionRankRule>(
  'BY_CREATE_TIME_DESC',
);

const columns = [
  { title: '文件夹ID', dataIndex: 'collectionId' },
  { title: '文件夹名称', dataIndex: 'title' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '类型', dataIndex: 'type' },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];
const fetchCollections = async () => {
  if (!collectionId.value || !collectionRankRule.value) {
    if (collectionId.value) {
      message.error('collectionRankRule is null');
    } else {
      message.error('collectionId is null');
    }
    return;
  }
  try {
    const data = await getCollectionContent(
      collectionId.value,
      collectionRankRule.value,
    );
    collections.value = data;
  } catch (error) {
    message.error(`${error?.message}`);
  }
};

const insertCollection = async () => {
  await insertCollectionApi(newCollectionName.value, parentCollectionId.value);
  newCollectionName.value = '';
  parentCollectionId.value = '';
  fetchCollections();
};

const showEditModal = (record) => {
  currentEditId.value = record.collectionId;
  editCollectionName.value = record.title;
  isEditModalVisible.value = true;
};

const closeEditModal = () => {
  isEditModalVisible.value = false;
  editCollectionName.value = '';
};

const editCollection = async () => {
  await editCollectionApi(editCollectionName.value, currentEditId.value);
  closeEditModal();
  fetchCollections();
};

const deleteCollection = async (id) => {
  await deleteCollectionApi(id);
  fetchCollections();
};

onMounted(() => {
  fetchCollections();
});
</script>

<template>
  <div>
    <h1>新增文件夹</h1>
    <div style="margin-bottom: 16px">
      <Input
        :value="newCollectionName"
        @input="(e) => (newCollectionName = e.target.value)"
        placeholder="输入新文件夹名称"
        style="width: 220px; margin-right: 8px"
      />
      <Input
        :value="parentCollectionId"
        @input="(e) => (parentCollectionId = e.target.value)"
        placeholder="输入父文件夹ID"
        style="width: 220px; margin-right: 8px"
      />
      <Button type="primary" @click="insertCollection">添加文件夹</Button>
    </div>
    <h1>查询文件夹</h1>

    <div style="margin-bottom: 16px">
      <Input
        :value="collectionId"
        @input="(e) => (collectionId = e.target.value)"
        placeholder="输入文件夹ID"
        style="width: 220px; margin-right: 8px"
      />
      <Select
        :value="collectionRankRule"
        @change="(value) => (collectionRankRule = value)"
        placeholder="选择排序规则"
        style="width: 220px; margin-right: 8px"
      >
        <Select.Option value="BY_CREATE_TIME_DESC">创建时间降序</Select.Option>
        <Select.Option value="BY_CREATE_TIME_ASC">创建时间升序</Select.Option>
        <Select.Option value="BY_NAME_DESC">名称降序</Select.Option>
        <Select.Option value="BY_NAME_ASC">名称升序</Select.Option>
        <Select.Option value="BY_POPULARITY_DESC">受欢迎程度降序</Select.Option>
      </Select>
      <Button type="primary" @click="fetchCollections">
        查询文件夹内容（点击才能查哦）
      </Button>
    </div>
    <Table :data-source="collections" :columns="columns" row-key="collectionId">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Button @click="showEditModal(record)">编辑</Button>
          <Button danger @click="() => deleteCollection(record.collectionId)">
            删除
          </Button>
        </template>
      </template>
    </Table>

    <Modal
      v-model:visible="isEditModalVisible"
      title="编辑文件夹"
      @ok="editCollection"
      @cancel="closeEditModal"
    >
      <Form>
        <FormItem
          label="文件夹名称"
          :rules="[{ required: true, message: '请输入文件夹名称' }]"
        >
          <Input v-model="editCollectionName" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
/* 在这里添加样式 */
</style>
