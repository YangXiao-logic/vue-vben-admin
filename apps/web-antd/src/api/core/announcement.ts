import { requestClient } from '#/api/request';

export namespace AnnouncementApi {
  export interface Announcement {
    announcementId: string;
    title: string;
    content: string;
    status: boolean;
    priority: number;
    createTime: string;
    updateTime: string;
  }
}

export async function getAnnouncementListApi() {
  return requestClient.get<AnnouncementApi.Announcement[]>(
    '/announcement-manage/announcement-list',
  );
}

export async function addAnnouncement(data: AnnouncementApi.Announcement) {
  return requestClient.post('/announcement-manage/add-announcement', data);
}

export async function deleteAnnouncement(announcementId: string) {
  return requestClient.post('/announcement-manage/delete-announcement', null, {
    params: { announcementId },
  });
}

export async function updateAnnouncement(data: AnnouncementApi.Announcement) {
  return requestClient.post('/announcement-manage/update-announcement', data);
}
