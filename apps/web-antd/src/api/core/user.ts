/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  // fork data
  return {
    roles: ['admin'],
    realName: 'admin',
  };

  // return requestClient.get<UserInfo>('/user/info');
}
