import { requestClient } from '#/api/request';

export namespace InviteManageApi {
  /** 特殊邀请码接口 */
  export interface SpecialInviteCode {
    inviteCodeId?: string | null;
    inviteCode?: string | null;
    description?: string | null;
    userEmail?: string | null;
  }

  /** 邀请历史记录接口 */
  export interface InviteHistory {
    createTime?: string | null;
    toUserAccount?: string | null;
    vipRechargeType?: string | null;
  }

  /** 添加特殊邀请码请求参数 */
  export interface AddSpecialInviteCodeParams {
    account?: string | null;
    description?: string | null;
  }
}

/**
 * 获取邀请码列表
 */
export async function getInviteCodeListApi() {
  return requestClient.get<InviteManageApi.SpecialInviteCode[]>(
    '/invite-manage/invite-code-list',
  );
}

/**
 * 添加特殊邀请码
 */
export async function addSpecialInviteCodeApi(
  data: InviteManageApi.AddSpecialInviteCodeParams,
) {
  return requestClient.post<InviteManageApi.SpecialInviteCode>(
    '/invite-manage/add-special-invite-code',
    data,
  );
}

/**
 * 更新特殊邀请码描述
 */
export async function updateSpecialInviteCodeDescriptionApi(
  inviteCodeId: string,
  description: string,
) {
  return requestClient.post(
    '/invite-manage/update-special-invite-code-description',
    null,
    {
      params: { inviteCodeId, description },
    },
  );
}

/**
 * 获取邀请历史记录
 */
export async function getInviteHistoryApi(inviteCode: string) {
  return requestClient.get<InviteManageApi.InviteHistory[]>(
    '/invite-manage/invite-history',
    {
      params: { inviteCode },
    },
  );
}
