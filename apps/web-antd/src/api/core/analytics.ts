import { requestClient } from '#/api/request';

export namespace AnalyticsManageApi {
  /** 支付类型枚举 */
  export enum PayType {
    PDF_PACKAGE = 'pdf_package',
    VIP_RECHARGE = 'vip_recharge',
  }

  /** 每日关键数据接口 */
  export interface AnalyticsData {
    todayRegisterCount?: number | null;
    todayPayAmount?: number | null;
    todayPublicUploadFileCount?: number | null;
    todayPrivateUploadFileCount?: number | null;
    todayChatCount?: number | null;
  }

  /** 支付图表请求参数 */
  export interface PayChartParams {
    startDate?: string | Date;
    endDate?: string | Date;
    payType?: PayType | null;
  }

  /** 支付数据点接口 */
  export interface PaymentDataPoint {
    date?: string | null;
    count?: number | null;
    amount?: number | null;
  }

  /** 支付图表响应接口 */
  export interface PayChartResponse {
    dataPoints?: PaymentDataPoint[] | null;
  }

  /** 用户增长请求参数 */
  export interface UserGrowthParams {
    startDate?: string | Date;
    endDate?: string | Date;
  }

  /** 用户增长响应 */
  export type UserGrowthResponse = UserGrowth[];
  export interface UserGrowth {
    date: string;
    newUsers: number;
    totalUsers: number;
  }
}

/**
 * 获取每日关键数据
 */
export async function getAnalyticsApi() {
  return requestClient.get<AnalyticsManageApi.AnalyticsData>(
    '/analytics-manage/important-data',
  );
}

/**
 * 获取支付图表数据
 */
export async function getPayChartApi(
  params: AnalyticsManageApi.PayChartParams,
) {
  return requestClient.post<AnalyticsManageApi.PayChartResponse>(
    '/analytics-manage/pay-chart',
    params,
  );
}

export async function getUserGrowth(
  params: AnalyticsManageApi.UserGrowthParams,
) {
  return requestClient.post<AnalyticsManageApi.UserGrowthResponse>(
    '/analytics-manage/user-growth',
    params,
  );
}
