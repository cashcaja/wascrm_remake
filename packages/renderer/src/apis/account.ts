import request from '/@/utils/request';

export const menuList = (params: {user_id: string}) => {
  const data: {Action: string} = {
    Action: 'List',
    ...params,
  };

  return request('/api/v1/menu/list', 'POST', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 从后端获取的用户信息需要和id_token也就是electron发过来的userInfo合并
export const userInfoFromBackend = (params: {user_id: string}) => {
  const data: {Action: string} = {
    Action: 'Info',
    ...params,
  };

  return request('/api/v1/user/info', 'POST', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const proxyList = () => {
  const data: {Action: string} = {
    Action: 'sock',
  };

  return request('/api/v1/assist/sock', 'POST', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
