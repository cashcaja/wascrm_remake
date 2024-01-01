import {defineComponent, watch, onMounted, KeepAlive} from 'vue';
import {useAppStore} from '/@/store';
import TalkView from '/@/components/ContentArea/TalkView';
import TalkListView from '/@/components/ContentArea/TalkListView';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'ContentArea',
  setup() {
    // store
    const store = useAppStore();

    // feat func
    const getTalkList = () => {
      if (store?.chatHistory?.[store?.currentWaAccountPersistId]) {
        const talkList = store.chatHistory[store.currentWaAccountPersistId].map(i => {
          const tempTalk: Talk[] = [];

          // exclude have history talk
          for (const j of store.talkList) {
            if (j.name === i.id?._serialized) {
              return j;
            }
          }

          // get last message
          if (i?.lastMessage?.id && i?.lastMessage?.body) {
            tempTalk.push({
              type: i.lastMessage.id.fromMe ? 'send' : 'receive',
              msg: i.lastMessage.body,
              timestamp: i.lastMessage.timestamp,
              to: i.id._serialized, // current service wa account id
              me: i.lastMessage.fromMe ? i.lastMessage.from : i.lastMessage.to,
            });
          }
          return {
            name: i.id._serialized,
            timestamp: i?.timestamp ? i?.timestamp : dayjs().valueOf(),
            talk: tempTalk,
          };
        });

        console.log('talk list', talkList);
        if (talkList) {
          store.setTalkList(talkList);
        }
      }
    };

    onMounted(() => {
      console.log('all chats', store.chatHistory);
      getTalkList();
    });

    watch(
      () => [store.chatHistory, store.currentWaAccountPersistId],
      () => {
        getTalkList();
      },
    );

    return () => (
      <div class="flex flex-row m-0 p-0">
        <KeepAlive>
          <TalkListView />
          <TalkView />
        </KeepAlive>
      </div>
    );
  },
});
