import {defineStore} from 'pinia';
import {ref} from 'vue';

interface UserInfo {
  sub: string;
  email: string;
  'https://ai-assist-test-us.wuli.cash/roles': string[];
  nickname: string;
  picture: string;
  token: string;
}

export const useAppStore = defineStore('app', () => {
  // user info
  const token = ref<string>('');
  const userInfo = ref<Partial<UserInfo>>({});
  const role = ref<string>('');
  // current waAccount
  const currentWaAccountPersistId = ref<string>('');
  const waAccountList = ref<WaClient[]>([]);

  const setUserInfo = (info: Partial<UserInfo>) => {
    userInfo.value = info;
    token.value = info.token || '';
    role.value = info['https://ai-assist-test-us.wuli.cash/roles']?.[0] || '';
  };

  const setCurrentWaAccountPersistId = (persistId: string) => {
    currentWaAccountPersistId.value = persistId;
  };

  const setWaAccountList = (list: WaClient[]) => {
    waAccountList.value = list;
  };

  return {
    token,
    userInfo,
    role,
    waAccountList,
    currentWaAccountPersistId,
    setUserInfo,
    setCurrentWaAccountPersistId,
    setWaAccountList,
  };
});
