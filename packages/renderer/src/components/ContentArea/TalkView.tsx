import {defineComponent, ref} from 'vue';
import {useAppStore} from '/@/store';
import {sendMsgToClient} from '#preload';
import dayjs from 'dayjs';
import sensors from '/@/utils/sensors';
import MaskView from './MaskView';

export default defineComponent({
  name: 'TalkView',
  setup() {
    // store
    const store = useAppStore();

    // state
    const msg = ref<string>('');

    const sendMsg = async (msg: string, to: string) => {
      if (store?.currentWaAccountPersistId) {
        const res = await sendMsgToClient({
          persistId: store.currentWaAccountPersistId,
          msg,
          to,
        });

        store.talkList.forEach(i => {
          if (i.name === to) {
            i.talk.unshift({
              type: 'send',
              msg: msg,
              timestamp: dayjs().valueOf(),
              to: to,
              me: store.currentWaAccountPersistId,
              failed: res.status === 'error',
            });
          }
        });

        // sensors record send msg
        const currentAccount = store.waAccountList.find(
          i => i.persistId === store.currentWaAccountPersistId,
        );
        if (currentAccount && currentAccount.waAccount) {
          sensors.track('send', {
            csid: store.userInfo?.sub,
            cs_email: store.userInfo?.email,
            country: currentAccount.country,
            customer: to,
            online_service: currentAccount.waAccount,
            online_service_msg: msg,
            app_pkg: currentAccount.appPkg,
            isBot: false,
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
          <MaskView />
          {store?.currentTalk &&
            store?.currentTalk?.length > 0 &&
            store.currentTalk.map(i => (
              <div class={`chat ${i.type === 'send' ? 'chat-end' : 'chat-start'} `}>
                <div class="chat-header">{i.type === 'send' ? 'You' : i.me}</div>
                <div
                  class={`chat-bubble ${
                    i.type === 'send' ? 'chat-bubble-primary' : 'chat-bubble-success'
                  } flex flex-row items-center justify-center mr-[15px]`}
                >
                  {i.msg}
                  {i.type === 'send' && i.failed && (
                    <div
                      class="tooltip flex flex-row items-center"
                      data-tip="click to resend"
                    >
                      <span
                        class="i-[mdi--alert-circle] text-[14px] ml-[10px] hover:bg-secondary"
                        onClick={() => {
                          sendMsg(i.msg, i.to);
                        }}
                      />
                    </div>
                  )}
                  {i.type === 'receive' && (
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
                        sendMsg(msg.value, i.to);
                        msg.value = '';
                      }
                    }}
                  />
                  <button
                    class="btn btn-accent w-[100px]"
                    onClick={() => {
                      sendMsg(msg.value, i.to);
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
