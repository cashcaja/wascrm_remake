import request from '/@/utils/request';

// 获取菜单列表
export const getAIResponse = (params: {
  query: string;
  app_pkg: string;
  uid?: string;
  phone?: string;
  wa_phone?: string;
}) => {
  const data: {Action: string} = {
    Action: 'bot-repay',
    ...params,
  };

  return request('/api/v1/assist/bot-reply', 'POST', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
