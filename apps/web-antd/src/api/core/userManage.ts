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
    inviteCode: string;
    otherEmails: string[];
  }

  /** VIP充值类型枚举 */
  export enum VipRechargeTypeEnum {
    REGULAR_VIP_TWO_DAY = 'REGULAR_VIP_TWO_DAY',
    REGULAR_VIP_THREE_DAY  = 'REGULAR_VIP_THREE_DAY',
    REGULAR_VIP_FIVE_DAY  = 'REGULAR_VIP_FIVE_DAY',
    REGULAR_VIP_WEEK  = 'REGULAR_VIP_WEEK',
    REGULAR_VIP_MONTH  = 'REGULAR_VIP_MONTH',
    REGULAR_VIP_HALF_YEAR = 'REGULAR_VIP_HALF_YEAR'
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
 */
export async function getUserListApi(params: UserManageApi.UserQueryParams) {
  return requestClient.get<UserManageApi.ApiResponse<UserManageApi.UserInfo[]>>('/user-manage/user-list', {
    params,
  });
}

/**
 * 添加用户
 */
export async function addUserApi(data: UserManageApi.AddUserParams) {
  return requestClient.post<UserManageApi.ApiResponse<null>>('/user-manage/add-user', data);
}

/**
 * 赠送VIP
 */
export async function giftVipApi(email: string, vipRechargeTypeEnum: UserManageApi.VipRechargeTypeEnum) {
  return requestClient.post<UserManageApi.ApiResponse<null>>('/user-manage/gift-vip', null, {
    params: { 
      email,
      vipRechargeTypeEnum 
    },
  });
}
