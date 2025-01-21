import { requestClient } from '#/api/request';

export namespace SchoolApi {
  /** 学校信息接口 */
  export interface School {
    id?: string;
    schoolName: string;
  }

  /** 学校邮箱规则接口 */
  export interface SchoolEmailRule {
    id?: string;
    schoolId: string;
    emailRule: string;
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
