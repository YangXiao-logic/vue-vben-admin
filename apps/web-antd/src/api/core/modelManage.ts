import { requestClient } from '#/api/request';

export namespace ModelManageApi {
  /** 模型失败率数据接口 */
  export interface ModelFailureRate {
    configName?: string | null;
    model?: string | null;
    totalRequests?: number | null;
    successCount?: number | null;
    failureCount?: number | null;
    failureRate?: number | null;
    environment?: string | null;
  }
}

/**
 * 获取模型失败率数据
 */
export async function getModelFailureRates(hours?: number) {
  return requestClient.get<ModelManageApi.ModelFailureRate[]>(
    '/model-manage/failure-rates',
    {
      params: {
        hours,
      },
    },
  );
}
