import {defineStore} from 'pinia';
import {ref} from 'vue';
import {userInfoFromBackend} from '/@/apis/account';
import {askAI} from '/@/apis/chat';
import dayjs from 'dayjs';

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
    const talkList = ref<{name: string; timestamp: number; talk: Talk[]}[]>([]);
    const currentTalk = ref<Talk[]>();

    // req data
    const appList = ref<AppInfo[]>([]);

    // utils
    const showMessage = ref<{msg: string; type: 'error' | 'success'; action?: string}>();
    const loading = ref<boolean>(false);
    const aiLoading = ref<boolean>(false);

    // plugin
    const currentTab = ref<string>('Chat');
    const aiChatHistory = ref<
      {
        type: 'user' | 'robot';
        content: string;
        timestamp?: number;
        failed?: boolean;
        lastAsk?: string;
      }[]
    >([]);

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
      delete chatHistory.value[persistId];
      aiChatHistory.value = [];
      if (Object.keys(chatHistory.value).length > 0) {
        chatHistory.value = {...chatHistory.value};
      } else {
        talkList.value = [];
      }
    };

    const setChatsHistory = (params: {history: string; persistId: string}) => {
      const tempHistory = JSON.parse(params.history);
      tempHistory.forEach((i: any) => {
        if (i.timestamp < 9000000000000) {
          i.timestamp = Number(i.timestamp) * 1000;
        }
      });
      chatHistory.value = {
        ...chatHistory.value,
        [params.persistId]: tempHistory,
      };
    };

    const setTalkList = (list: {timestamp: number; name: string; talk: Talk[]}[]) => {
      talkList.value = list;
    };

    const setCurrentTalk = (talk: Talk[]) => {
      currentTalk.value = talk;
    };

    const logout = () => {
      userInfo.value = undefined;
      token.value = '';
      role.value = '';
      currentWaAccountPersistId.value = '';
      waAccountList.value = [];
      chatHistory.value = {};
      talkList.value = [];
      currentTalk.value = [];
      appList.value = [];
      showMessage.value = undefined;
      loading.value = false;
      aiChatHistory.value = [];
      aiLoading.value = false;
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

    const getAIResponse = async (params: {
      query: string;
      app_pkg: string;
      uid: string;
      wa_phone: string;
      timestamp: number;
    }) => {
      try {
        aiLoading.value = true;
        const aiRes: any = await askAI(params);
        aiChatHistory.value.push({
          type: 'user',
          content: params.query,
          timestamp: params.timestamp,
        });
        if (aiRes.code === 0) {
          showMessage.value = {msg: aiRes.msg, type: 'success'};
          aiChatHistory.value.push({
            type: 'robot',
            content: aiRes.data.reply,
            timestamp: dayjs().valueOf(),
            lastAsk: params.query,
          });
        } else {
          showMessage.value = {msg: aiRes.msg, type: 'error'};
          aiChatHistory.value.push({
            type: 'robot',
            content: aiRes.msg,
            timestamp: dayjs().valueOf(),
            lastAsk: params.query,
          });
        }
      } catch (e: any) {
        aiChatHistory.value.push({
          type: 'robot',
          content: e.toString(),
          timestamp: dayjs().valueOf(),
          lastAsk: params.query,
        });
        aiChatHistory.value.push({
          type: 'user',
          content: params.query,
          failed: true,
          timestamp: params.timestamp,
        });
        console.log(e);
      } finally {
        aiLoading.value = false;
        setTimeout(() => {
          const element = document.getElementById('chat_plugin');
          element?.scrollTo({top: element.scrollHeight, behavior: 'smooth'});
        }, 500);
      }
    };

    // utils
    const setShowMessage = (params: {msg: string; type: 'error' | 'success'; action?: string}) => {
      showMessage.value = params;
    };

    // plugin
    const setCurrentTab = (tab: string) => {
      currentTab.value = tab;
    };

    const setAiChatHistory = (history: {type: 'user' | 'robot'; content: string}[]) => {
      aiChatHistory.value = history;
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
      currentTalk,
      currentTab,
      aiChatHistory,
      aiLoading,
      setAiChatHistory,
      setCurrentTab,
      setCurrentTalk,
      setTalkList,
      setLoading,
      setUserInfo,
      setCurrentWaAccountPersistId,
      setWaAccountList,
      setShowMessage,
      setChatsHistory,
      deleteAccount,
      getAppList,
      getAIResponse,
      logout,
    };
  },
  {
    persist: true,
  },
);
