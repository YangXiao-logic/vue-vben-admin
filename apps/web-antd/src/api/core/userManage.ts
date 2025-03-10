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
    activeDays: number;
    device: string | null;
    firstPurchaseTime: string;
    lastPurchaseTime: string;
    school: string[] | null;
    uploadPrivateFileCount: number;
    uploadPublicFileCount: number;
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
    activeDays?: number;
    activeStartTime?: string;
    activeEndTime?: string;
    channelEnum?: ChannelEnum;
    device?: string | null;
    isPartnerSchool?: boolean | null;
    purchaseStartTime?: string;
    purchaseEndTime?: string;
    school?: string | null;
    uploadFileTypeEnum?: UploadFileTypeEnum;
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

  /** 渠道类型枚举 */
  export enum ChannelEnum {
    Campus = 'CAMPUS',
    Friend = 'FRIEND',
    Other = 'OTHER',
  }

  /** 上传文件类型枚举 */
  export enum UploadFileTypeEnum {
    NoFileUpload = 'NO_FILE_UPLOAD',
    UploadPrivateFile = 'UPLOAD_PRIVATE_FILE',
    UploadPublicFile = 'UPLOAD_PUBLIC_FILE',
  }

  /** API响应接口 */
  export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    timestamp: number;
  }

  export interface PayRecordVo {
    outTradeNo?: string;
    createTime: number;
    payAmount?: number;
    payType: PayTypeEnum;

    paySourceDescription: string;
    payTypeDescription: string;
    gifted: boolean;
  }

  export enum PayTypeEnum {
    PDF_PACKAGE = 'pdf_package',
    VIP_RECHARGE = 'vip_recharge',
  }

  export interface InviteHistoryVo {
    createTime: string;
    toUserAccount: null | string;
    vipRechargeType: string;
  }
}

/**
 * 获取用户列表
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

/**
 * 获取用户支付情况
 */
export async function getPaySituation(userId: string) {
  return requestClient.get<
    UserManageApi.ApiResponse<UserManageApi.PayRecordVo[]>
  >('/user-manage/get-pay-situation', {
    params: { userId },
  });
}

/**
 * 获取用户历史邀请支付情况
 */
export async function getHistoryPaySituation(userId: string) {
  return requestClient.get<
    UserManageApi.ApiResponse<UserManageApi.InviteHistoryVo[]>
  >('/user-manage/get-invite-history', {
    params: { userId },
  });
}
