import {defineComponent} from 'vue';
import {useAppStore} from '/@/store';
import dayjs from 'dayjs';
import {copyContent} from '/@/utils';

export default defineComponent({
  name: 'ChatFC',
  setup() {
    const store = useAppStore();

    const reSendChat = async (msg: string) => {
      const currentWaAccount = store.waAccountList.find(
        i => i.persistId === store.currentWaAccountPersistId,
      );
      if (!currentWaAccount || !currentWaAccount?.waAccount) return;
      await store.getAIResponse({
        query: msg,
        app_pkg: currentWaAccount.appPkg,
        uid: currentWaAccount.csid,
        wa_phone: currentWaAccount.waAccount,
        timestamp: dayjs().unix(),
      });
    };

    return () => (
      <div
        class="flex flex-col h-[100vh]  overflow-y-scroll pt-[20px] pb-[20px]"
        id="chat_plugin"
      >
        {store.aiChatHistory.map((i, index) => {
          return (
            <div>
              <div class="h-[100%] ml-[10px]">
                <div class={`chat ${i.type === 'user' ? 'chat-end' : 'chat-start'} `}>
                  <div
                    class={`chat-bubble ${
                      i.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-success'
                    } flex flex-row items-center justify-center `}
                  >
                    {i.content}
                    {i.type === 'user' && i.failed && (
                      <div
                        class="tooltip flex flex-row items-center"
                        data-tip="click to resend"
                      >
                        <span
                          class="i-[mdi--alert-circle] text-[14px] ml-[10px] hover:bg-secondary"
                          onClick={async () => {
                            if (i?.lastAsk) {
                              await reSendChat(i.lastAsk);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div class="chat-footer">
                    <time class="text-xs opacity-60">
                      {dayjs(Number(i.timestamp) * 1000).format('YYYY-MM-DD HH:mm:ss')}
                    </time>
                  </div>

                  {i.type === 'robot' &&
                    (index === store.aiChatHistory.length - 1 ||
                      index === store.aiChatHistory.length - 1) && (
                      <div class="chat-footer w-[220px] flex flex-row justify-between mt-[10px]">
                        <button
                          class="btn btn-sm mt-[10px] btn-secondary"
                          onClick={() => {
                            copyContent(i.content);
                          }}
                        >
                          <div class="flex flex-row justify-center items-center">
                            <div class="i-[mdi--content-copy] mr-[10px]"></div>
                            Copy
                          </div>
                        </button>

                        <button
                          class="btn btn-sm mt-[10px] btn-secondary"
                          onClick={async () => {
                            if (i?.lastAsk) {
                              await reSendChat(i.lastAsk);
                            }
                          }}
                        >
                          <div class="flex flex-row justify-center items-center">
                            <div class="i-[mdi--refresh] mr-[10px]"></div>
                            ReGenerate
                          </div>
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
});
