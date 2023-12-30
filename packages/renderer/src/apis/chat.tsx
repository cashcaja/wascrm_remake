import request from '/@/utils/request';
export const askAI = (params: {query: string; app_pkg: string; uid: string; wa_phone: string}) => {
  const data: {Action: string} = {
    Action: 'faq',
    ...params,
  };

  return request('/api/v1/assist/faq', 'POST', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
