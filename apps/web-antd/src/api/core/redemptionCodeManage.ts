import { requestClient } from '#/api/request';

export namespace RedemptionCodeApi {

  export enum VipRechargeType {
    RegularVipHalfYear = 'regular_vip_half_year',
    RegularVipMonth = 'regular_vip_month',
    RegularVipWeek = 'regular_vip_week',
  }

  export interface RedemptionCode {
    redemptionCodeId?: string;
    userId?: string;
    isUsed: boolean;
    account?: string;
    redemptionCode: string;
    vipRechargeType: VipRechargeType;
    createTime?: string;
    updateTime?: string;
  }

  export interface CreateRedemptionCodeParam {
    count: number;
    vipRechargeType: VipRechargeType;
  }
}

/**
 * 获取兑换码列表
 */
export function getRedemptionCodeList() {
  return requestClient.get<RedemptionCodeApi.RedemptionCode[]>('/redemption-code-manage/redemptionCode-list');
}

/**
 * 导出兑换码
 */
export function exportRedemptionCode(param: RedemptionCodeApi.CreateRedemptionCodeParam) {
  return requestClient.post<RedemptionCodeApi.RedemptionCode[]>('/redemption-code-manage/export-redemptionCode', param);
}
