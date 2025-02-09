import { requestClient } from '#/api/request';
// import { FolderCollectionContentVo } from './types'; // 假设你有一个 types.ts 文件来定义返回类型

/**
 * 添加子集合
 */
export async function insertCollectionApi(
  collectionName: string,
  parentCollectionId: string,
): Promise<FolderCollectionContentVo> {
  return requestClient.post<FolderCollectionContentVo>(
    '/collection-manage/add',
    null,
    {
      params: { collectionName, parentCollectionId },
    },
  );
}

/**
 * 删除集合
 */
export async function deleteCollectionApi(collectionId: string): Promise<void> {
  return requestClient.post('/collection-manage/delete', null, {
    params: { collectionId },
  });
}

/**
 * 编辑集合
 */
export async function editCollectionApi(
  collectionName: string,
  collectionId: string,
): Promise<void> {
  return requestClient.post('/collection-manage/edit', null, {
    params: { collectionName, collectionId },
  });
}

/**
 * 计算集合的受欢迎程度
 */
export async function computePopularityApi(): Promise<void> {
  return requestClient.post('/collection-manage/computePopularity');
}
