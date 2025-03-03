import { requestClient } from '#/api/request';

export namespace UserManageApi {
  /** 用户信息接口 */
  export interface UserInfo {
    userId: string;
    phone: string | null;
    email: string;
    isVip: boolean;
    registerTime: string;
    vipExpirationTime: string;
  }

  /** 用户查询参数接口 */
  export interface UserQueryParams {
    userId?: string;
    phone?: string | null;
    email?: string;
    isVip?: boolean;
    registerStartTime?: string;
    registerEndTime?: string;
    vipExpirationStartTime?: string;
    vipExpirationEndTime?: string;
  }

  /** 添加用户参数接口 */
  export interface AddUserParams {
    primaryEmail: string;
    password: string;
    inviteCode: string | undefined;
    otherEmails: string[];
  }

  /** VIP充值类型枚举 */
  export enum VipRechargeTypeEnum {
    REGULAR_VIP_TWO_DAY = 'regular_vip_two_day',
    REGULAR_VIP_THREE_DAY = 'regular_vip_three_day',
    REGULAR_VIP_FIVE_DAY = 'regular_vip_five_day',
    REGULAR_VIP_WEEK = 'regular_vip_week',
    REGULAR_VIP_MONTH = 'regular_vip_month',
    REGULAR_VIP_HALF_YEAR = 'regular_vip_half_year',
  }

  /** API响应接口 */
  export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    timestamp: number;
  }
}

/**
 * 获取用户列表
 * 注意：后端使用GET请求但需要请求体，前端使用POST请求来兼容
 */
export async function getUserListApi(data: UserManageApi.UserQueryParams) {
  return requestClient.post<
    UserManageApi.ApiResponse<UserManageApi.UserInfo[]>
  >('/user-manage/user-list', data);
}

/**
 * 添加用户
 */
export async function addUserApi(data: UserManageApi.AddUserParams) {
  return requestClient.post<UserManageApi.ApiResponse<null>>(
    '/user-manage/add-user',
    data,
  );
}

/**
 * 赠送VIP
 */
export async function giftVipApi(
  userId: string,
  vipRechargeTypeEnum: UserManageApi.VipRechargeTypeEnum,
) {
  return requestClient.post<UserManageApi.ApiResponse<null>>(
    '/user-manage/gift-vip',
    null,
    {
      params: { userId, vipRechargeTypeEnum },
    },
  );
}
