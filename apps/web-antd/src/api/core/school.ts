import { requestClient } from '#/api/request';

export namespace SchoolApi {
  /** 学校信息接口 */
  export interface School {
    schoolId: string;
    name: string;
  }

  /** 学校邮箱规则接口 */
  export interface SchoolEmailRule {
    schoolEmailRuleId: string;
    schoolId: string;
    emailRule: string;
  }

  /** 字段规则接口 */
  export interface Rule {
    errorMessage: string;
    required: boolean;
    pattern?: string;
    maxLength?: number;
    minLength?: number;
  }

  /** 表单字段接口 */
  export interface FormField {
    name: string;
    label: string;
    ruleList: Rule[];
    placeholder: string;
  }

  /** 动态课程表单接口 */
  export interface DynamicCourseForm {
    dynamicCourseFormId?: string;
    fields: FormField[];
    schoolId: string;
  }
}

/**
 * 添加学校
 */
export async function addSchoolApi(schoolName: string) {
  return requestClient.post('/school/add-school', null, {
    params: { schoolName },
  });
}

/**
 * 编辑学校名称
 */
export async function editSchoolNameApi(data: SchoolApi.School) {
  return requestClient.post('/school/edit-school-name', data);
}

/**
 * 获取学校列表
 */
export async function getSchoolListApi() {
  return requestClient.get<SchoolApi.School[]>('/school/get-school-list');
}

/**
 * 绑定邮箱规则
 */
export async function bindEmailRuleApi(data: SchoolApi.SchoolEmailRule) {
  return requestClient.post('/school/bind-email-rule', data);
}

/**
 * 编辑邮箱规则
 */
export async function editEmailRuleApi(data: SchoolApi.SchoolEmailRule) {
  return requestClient.post('/school/edit-email-rule', data);
}

/**
 * 删除邮箱规则
 */
export async function deleteEmailRuleApi(schoolEmailRuleId: string) {
  return requestClient.post('/school/delete-email-rule', null, {
    params: { schoolEmailRuleId },
  });
}

/**
 * 获取邮箱规则列表
 */
export async function getEmailRuleListApi(schoolId: string) {
  return requestClient.get<SchoolApi.SchoolEmailRule[]>(
    '/school/get-email-rule-list',
    {
      params: { schoolId },
    },
  );
}

/**
 * 绑定课程名称规则
 */
export async function bindCourseNameRuleApi(data: SchoolApi.DynamicCourseForm) {
  return requestClient.post('/school/bind-course-name-rule', data);
}

/**
 * 更新课程名称规则
 */
export async function updateCourseNameRuleApi(
  data: SchoolApi.DynamicCourseForm,
) {
  return requestClient.post('/school/update-course-name-rule', data);
}

/**
 * 获取课程名称规则
 */
export async function getCourseNameRuleApi(schoolId: string) {
  return requestClient.get<SchoolApi.DynamicCourseForm>(
    '/school/get-course-name-rule',
    {
      params: { schoolId },
    },
  );
}

/**
 * 获取学校根集合ID
 */
export async function getSchoolRootCollectionIdApi(schoolId: string) {
  return requestClient.get<string>('/school/get-school-root-collection-id', {
    params: { schoolId },
  });
}
