import { requestClient } from '#/api/request';

export namespace CollectionApi {
  export interface BaseCollectionContentVo {
    collectionId: string;
    title: string;
    createTime: string;
    type: 'collection' | 'pdf';
  }

  export interface PdfContent extends BaseCollectionContentVo {
    type: 'pdf';
    pdfId: string;
    signedUrl: string;
    moveable: boolean;
    ocred: boolean;
    pageIndexed: boolean;
    moduleSummarized: boolean;
    moduleSummaryIndexed: boolean;
  }

  export interface CollectionContent extends BaseCollectionContentVo {
    type: 'collection';
    parentCollectionId: string;
    edited: boolean;
    favourite: boolean;
    collectionId: string;
    collectionFlag?: string;
    popularity?: number;
    signedUrl?: string;
  }

  export type CollectionContentVo = CollectionContent | PdfContent;

  export type CollectionRankRule =
    | 'BY_CREATE_TIME_ASC'
    | 'BY_CREATE_TIME_DESC'
    | 'BY_NAME_ASC'
    | 'BY_NAME_DESC'
    | 'BY_POPULARITY_DESC';

  export enum CollectionFlag {
    PublicCourse = 'PUBLIC_COURSE',
    PublicSchool = 'PUBLIC_SCHOOL',
    PublicSemester = 'PUBLIC_SEMESTER',
  }
  export interface Instant {
    nanos?: null | number;
    seconds?: null | number;
    [property: string]: any;
  }
  export interface FolderCollectionContentVo {
    collectionFlag?: CollectionFlag;
    collectionId?: null | string;
    createTime?: Instant;
    edited?: boolean | null;
    favourite?: boolean | null;
    popularity?: null | number;
    signedUrl?: null | string;
  }
}
export function getCollectionContent(
  collectionId: string,
  collectionRankRule: CollectionApi.CollectionRankRule,
) {
  return requestClient.get<CollectionApi.CollectionContentVo[]>(
    '/collection/content',
    { params: { collectionId, collectionRankRule } },
  );
}

/**
 * 添加子集合
 */
export async function insertCollectionApi(
  collectionName: string,
  parentCollectionId: string,
): Promise<CollectionApi.FolderCollectionContentVo> {
  return requestClient.post<CollectionApi.FolderCollectionContentVo>(
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
