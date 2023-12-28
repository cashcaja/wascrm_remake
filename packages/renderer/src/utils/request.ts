import axios, {type Method} from 'axios';
import {isNil, isString} from 'lodash';
import * as Sign from '/@/utils/sig';
import {stringify} from 'qs';
import {useAppStore} from '/@/store';

const MD5_SIGN_API_KEY = '8bc1b0909688';

const instance = axios.create({
  baseURL: 'https://ai-assist-test-us.wuli.cash',
});

instance.interceptors.response.use(res => {
  if (res.status === 200) {
    return res.data;
  }
});

instance.interceptors.request.use(
  config => {
    const store = useAppStore();
    config.headers['authorization'] = `Bearer ${store.token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default (url: string, method: Method, data: any, opts: any) => {
  let params: any = data || {};
  // 重新排序保证签名数据和发送数据一致
  for (const key of Object.keys(data)) {
    let value = data[key];
    if (isString(value)) {
      value = value.trim();
    }
    if (isNil(value)) {
      value = '';
    }
    params[key] = value;
  }

  params = {
    ...params,
    Timestamp: Sign.getTimestamp(),
    Nonce: Sign.getNonce(),
  };
  params['Sign'] = Sign.getMd5Sign(params, MD5_SIGN_API_KEY);

  return instance({
    url,
    method,
    data: stringify(params),
    ...opts,
  });
};
