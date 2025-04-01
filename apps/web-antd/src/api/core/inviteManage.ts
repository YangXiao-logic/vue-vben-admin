import { requestClient } from '#/api/request';

export namespace InviteManageApi {
  export enum VipRechargeType {
    RegularVipFiveDay = 'regular_vip_five_day',
    RegularVipHalfYear = 'regular_vip_half_year',
    RegularVipMonth = 'regular_vip_month',
    RegularVipThreeDay = 'regular_vip_three_day',
    RegularVipTwoDay = 'regular_vip_two_day',
    RegularVipWeek = 'regular_vip_week',
  }
  /** 特殊邀请码接口 */
  export interface SpecialInviteCode {
    inviteCodeId?: string | null;
    inviteCode?: string | null;
    description?: string | null;
    userEmail?: string | null;
    vipRechargeType: VipRechargeType;
  }

  /** 邀请历史记录接口 */
  export interface InviteHistory {
    createTime?: string | null;
    toUserAccount?: string | null;
    vipRechargeType?: string | null;
    firstPayAmount?: number | null;
  }

  /** 添加特殊邀请码请求参数 */
  export interface AddSpecialInviteCodeParams {
    account?: string | null;
    description?: string | null;
    vipRechargeType: VipRechargeType;
  }

  /** 更新特殊邀请码描述请求参数 */
  export interface UpdateSpecialInviteCodeParams {
    description: string;
    vipRechargeType: VipRechargeType;
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
  data: InviteManageApi.UpdateSpecialInviteCodeParams,
) {
  return requestClient.post(
    '/invite-manage/update-special-invite-code-description',
    {
      inviteCodeId,
      ...data,
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
