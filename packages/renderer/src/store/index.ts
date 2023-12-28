import {defineStore} from 'pinia';
import {ref} from 'vue';
import {userInfoFromBackend} from '/@/apis/account';

interface UserInfo {
  sub: string;
  email: string;
  'https://ai-assist-test-us.wuli.cash/roles': string[];
  nickname: string;
  picture: string;
  token: string;
}

export const useAppStore = defineStore(
  'app',
  () => {
    // user info
    const token = ref<string>('');
    const userInfo = ref<UserInfo>();
    const role = ref<string>('');
    // current waAccount
    const currentWaAccountPersistId = ref<string>('');
    const waAccountList = ref<WaClient[]>([]);

    // talk history
    const chatHistory = ref<{[key: string]: any[]}>({});
    const talkList = ref<{name: string; timestamp: string}[]>([]);

    // req data
    const appList = ref<AppInfo[]>([]);

    // utils
    const showMessage = ref<{msg: string; type: 'error' | 'success'; action?: string}>();
    const loading = ref<boolean>(false);

    const setUserInfo = (info: UserInfo) => {
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

    const setLoading = (status: boolean) => {
      loading.value = status;
    };

    const deleteAccount = (persistId: string) => {
      waAccountList.value = waAccountList.value.filter(i => i.persistId !== persistId);
    };

    const setChatsHistory = (params: {history: string; persistId: string}) => {
      chatHistory.value = {[params.persistId]: JSON.parse(params.history)};
    };

    const setTalkList = (list: {timestamp: string; name: string}[]) => {
      talkList.value = list;
    };

    // async function
    const getAppList = async () => {
      try {
        const userInfoRes: any = await userInfoFromBackend({
          user_id: userInfo?.value?.sub ? userInfo.value.sub : '0',
        });

        if (userInfoRes.code === 0) {
          const tempList: AppInfo[] = [];
          userInfoRes.data?.app_list?.forEach((i: any) => {
            tempList.push({
              ...i,
              label: `${i.botWa}-bot-wa`,
              value: i.botWa as string,
              robot: true,
            });
            tempList.push({
              ...i,
              label: `${i.onlineServiceWa}-wa`,
              value: i.onlineServiceWa,
              robot: false,
            });
          });
          appList.value = tempList;
        }
      } catch (e: any) {
        console.log(e);
        showMessage.value = {
          msg: 'If you encounter a problem logging in, please log in again.',
          type: 'error',
          action: 'logout',
        };
      }
    };

    const setShowMessage = (params: {msg: string; type: 'error' | 'success'; action?: string}) => {
      showMessage.value = params;
    };

    return {
      token,
      userInfo,
      role,
      waAccountList,
      currentWaAccountPersistId,
      appList,
      showMessage,
      loading,
      chatHistory,
      talkList,
      setTalkList,
      setLoading,
      setUserInfo,
      setCurrentWaAccountPersistId,
      setWaAccountList,
      setShowMessage,
      setChatsHistory,
      deleteAccount,
      getAppList,
    };
  },
  {
    persist: true,
  },
);
