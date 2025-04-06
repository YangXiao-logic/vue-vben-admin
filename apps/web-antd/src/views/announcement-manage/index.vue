<script lang="ts" setup>
import {
  getAnnouncementListApi,
  addAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '../../api/core/announcement';
import type { AnnouncementApi } from '../../api/core/announcement';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import {
  Form,
  Table,
  Card,
  Button,
  Space,
  Modal,
  Input,
  Switch,
  InputNumber,
  Typography,
  message,
} from 'ant-design-vue';
import { onMounted, ref, reactive, h } from 'vue';
import { downloadFileFromBlobPart, formatDateTime } from '@vben/utils';

const { Text, Title } = Typography;
const { confirm } = Modal;
const columns = [
  {
    title: '公告标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '公告内容',
    dataIndex: 'content',
    key: 'content',
    ellipsis: true,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: boolean }) => {
      return text
        ? h(Text, { type: 'success' }, '启用')
        : h(Text, { type: 'danger' }, '禁用');
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    customRender: ({ text }: { text: string }) => {
      return formatDateTime(text);
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    customRender: ({ text }: { text: string }) => {
      return formatDateTime(text);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    customRender: ({ record }: { record: AnnouncementApi.Announcement }) => {
      return h(Space, {}, [
        h(
          Button,
          {
            type: 'primary',
            onClick: () => handleEdit(record),
          },
          '编辑',
        ),
        h(
          Button,
          {
            danger: true,
            onClick: () => handleDelete(record),
          },
          '删除',
        ),
      ]);
    },
  },
];

const announcementList = ref<AnnouncementApi.Announcement[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref('添加公告');
const isEdit = ref(false);
const formRef = ref();
const formState = reactive<Partial<AnnouncementApi.Announcement>>({
  title: '',
  content: '',
  status: true,
  priority: 0,
});

// 获取公告列表
const getAnnouncementList = async () => {
  loading.value = true;
  try {
    const res = await getAnnouncementListApi();
    announcementList.value = res;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

// 删除公告
const handleDelete = (record: AnnouncementApi.Announcement) => {
  confirm({
    title: '确认删除',
    icon: () => h(ExclamationCircleOutlined),
    content: `确定要删除 "${record.title}" 吗？`,
    centered: true,
    async onOk() {
      try {
        await deleteAnnouncement(record.announcementId);
        message.success('删除成功');
        getAnnouncementList();
      } catch (error) {
        console.log(error);
      }
    },
  });
};

// 编辑公告
const handleEdit = (record: AnnouncementApi.Announcement) => {
  isEdit.value = true;
  modalTitle.value = '编辑公告';
  modalVisible.value = true;

  // 需要使用 nextTick 或者 setTimeout 确保表单已渲染
  setTimeout(() => {
    formState.title = record.title;
    formState.content = record.content;
    formState.status = record.status;
    formState.priority = record.priority;
    formState.announcementId = record.announcementId;
  }, 0);
};

// 添加新公告
const handleAdd = () => {
  isEdit.value = false;
  modalTitle.value = '添加公告';
  modalVisible.value = true;

  // 重置表单
  setTimeout(() => {
    formState.title = '';
    formState.content = '';
    formState.status = true;
    formState.priority = 0;
    formState.announcementId = '';
  }, 0);
};

// 提交表单
const handleSubmit = async () => {
  try {
    if (formRef.value) {
      await formRef.value.validate();

      if (isEdit.value) {
        await updateAnnouncement(formState as AnnouncementApi.Announcement);
        message.success('更新成功');
      } else {
        await addAnnouncement(formState as AnnouncementApi.Announcement);
        message.success('添加成功');
      }

      modalVisible.value = false;
      getAnnouncementList();
    }
  } catch (error) {
    console.log(error);
  }
};

// 取消操作
const handleCancel = () => {
  modalVisible.value = false;
};

// 页面加载时获取数据
onMounted(() => {
  getAnnouncementList();
});
</script>

<template>
  <div class="announcement-manage">
    <Card :bordered="false" class="announcement-card">
      <template #title>
        <Title :level="4">公告管理</Title>
      </template>
      <template #extra>
        <Button type="primary" @click="handleAdd">
          <PlusOutlined />添加公告
        </Button>
      </template>

      <Table
        :loading="loading"
        :columns="columns"
        :dataSource="announcementList"
        rowKey="announcementId"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
        }"
      />
    </Card>

    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      centered
      :maskClosable="false"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :styles="{
        body: {
          maxHeight: '60vh',
          overflow: 'auto',
          paddingRight: '8px',
        },
      }"
    >
      <Form
        ref="formRef"
        :model="formState"
        layout="vertical"
        :rules="{
          title: [{ required: true, message: '请输入公告标题' }],
          content: [{ required: true, message: '请输入公告内容' }],
        }"
      >
        <Form.Item name="title" label="标题">
          <Input v-model:value="formState.title" placeholder="请输入公告标题" />
        </Form.Item>
        <Form.Item name="content" label="内容">
          <Input.TextArea
            v-model:value="formState.content"
            placeholder="请输入公告内容"
            :rows="4"
          />
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <InputNumber
            v-model:value="formState.priority"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Switch v-model:checked="formState.status" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style lang="less" scoped>
.announcement-manage {
  padding: 16px;

  @media (max-width: 768px) {
    padding: 8px;

    :deep(.ant-table) {
      width: 100%;
      overflow-x: auto;
    }
  }
}
</style>
