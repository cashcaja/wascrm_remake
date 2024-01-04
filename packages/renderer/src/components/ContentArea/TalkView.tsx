import {computed, defineComponent, ref} from 'vue';
import {useAppStore} from '/@/store';
import {sendMsgToClient} from '#preload';
import dayjs from 'dayjs';
import sensors from '/@/utils/sensors';
import MaskView from './MaskView';
import {removeSuffix} from '/@/utils';

export default defineComponent({
  name: 'TalkView',
  setup() {
    // store
    const store = useAppStore();

    // state
    const msg = ref<string>('');

    // computed
    const currentAccount = computed(() =>
      store.waAccountList.find(i => i.persistId === store.currentWaAccountPersistId),
    );

    const sendMsg = async (msg: string, to: string, from: string) => {
      if (store?.currentWaAccountPersistId) {
        const res = await sendMsgToClient({
          persistId: store.currentWaAccountPersistId,
          msg,
          to,
        });

        store.talkList.forEach(i => {
          if (i.name === to) {
            i.talk.unshift({
              msg: msg,
              timestamp: dayjs().valueOf(),
              to: i.name,
              from: from,
              fromMe: true,
              customer: to,
              service: from,
              failed: res.status === 'error',
            });
          }
        });

        // sensors record send msg
        if (currentAccount.value && currentAccount.value.waAccount) {
          sensors.track('send', {
            csid: store.userInfo?.sub,
            cs_email: store.userInfo?.email,
            country: currentAccount.value.country,
            customer: removeSuffix(to),
            online_service: removeSuffix(currentAccount.value.waAccount),
            online_service_msg: msg,
            app_pkg: currentAccount.value.appPkg,
            isBot: false,
          });

          sensors.track('wa_session', {
            csid: store.userInfo?.sub,
            cs_email: store.userInfo?.email,
            country: currentAccount.value.country,
            online_service: removeSuffix(currentAccount.value.waAccount),
            customer_session_list: store.setCurrentTalk.toString(),
          });
        }
      }
    };

    const sendToAi = async (msg: string) => {
      const currentWaAccount = store.waAccountList.find(
        i => i.persistId === store.currentWaAccountPersistId,
      );
      if (!currentWaAccount || !currentWaAccount?.waAccount) return;
      await store.getAIResponse({
        query: msg,
        app_pkg: currentWaAccount.appPkg,
        uid: currentWaAccount.csid,
        wa_phone: currentWaAccount.waAccount,
        timestamp: dayjs().valueOf(),
      });
    };

    return () => (
      <div class="relative w-[calc(100%-230px)] h-[100vh]">
        <div class="flex flex-col-reverse h-[92%] overflow-y-scroll">
          {currentAccount.value && currentAccount.value.isRobot == true && <MaskView />}
          {store?.currentTalk &&
            store?.currentTalk?.length > 0 &&
            store.currentTalk.map(i => (
              <div class={`chat ${i.fromMe ? 'chat-end' : 'chat-start'} `}>
                <div class="chat-header">{i.fromMe ? 'You' : removeSuffix(i.from)}</div>
                <div
                  class={`chat-bubble ${
                    i.fromMe ? 'chat-bubble-primary' : 'chat-bubble-success'
                  } flex flex-row items-center justify-center mr-[15px]`}
                >
                  {i.msg}
                  {i.fromMe && i.failed && (
                    <div
                      class="tooltip flex flex-row items-center mr-[15px]"
                      data-tip="click to resend"
                    >
                      <span
                        class="i-[mdi--alert-circle] text-[14px] ml-[10px] hover:bg-secondary"
                        onClick={() => {
                          sendMsg(msg.value, i.customer, i.service);
                        }}
                      />
                    </div>
                  )}
                  {!i.fromMe && (
                    <div
                      class="tooltip flex flex-row items-center absolute right-[-50px]"
                      data-tip="ai reply"
                    >
                      <button
                        class="btn btn-secondary btn-sm"
                        disabled={store.aiLoading}
                        onClick={() => sendToAi(i.msg)}
                      >
                        <span class="i-[mdi--star-four-points-outline]" />
                      </button>
                    </div>
                  )}
                </div>
                <div class="chat-footer">
                  <time class="text-xs opacity-60">
                    {dayjs(i.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </time>
                </div>

                <div class="absolute bottom-[2px] pl-[2px] pr-[2px]  flex flex-row items-center w-full gap-[10px]">
                  <input
                    type="text"
                    placeholder="Type here"
                    v-model={msg.value}
                    class="input input-bordered w-[100%]"
                    onKeyup={e => {
                      if (e.key === 'Enter') {
                        sendMsg(msg.value, i.customer, i.service);
                        msg.value = '';
                      }
                    }}
                  />
                  <button
                    class="btn btn-accent w-[100px]"
                    onClick={() => {
                      sendMsg(msg.value, i.customer, i.service);
                      msg.value = '';
                    }}
                  >
                    Send
                    <span class="i-[mdi--send] text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  },
});
