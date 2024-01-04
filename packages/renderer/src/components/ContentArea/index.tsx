import {computed, defineComponent, KeepAlive, onMounted, watch} from 'vue';
import {useAppStore} from '/@/store';
import TalkView from '/@/components/ContentArea/TalkView';
import TalkListView from '/@/components/ContentArea/TalkListView';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'ContentArea',
  setup() {
    // store
    const store = useAppStore();

    // computed
    const currentWaAccount = computed(() =>
      store.waAccountList.find(i => i.persistId === store.currentWaAccountPersistId),
    );

    // feat func
    const getTalkList = () => {
      console.log(store?.chatHistory?.[store?.currentWaAccountPersistId]);
      if (store?.chatHistory?.[store?.currentWaAccountPersistId] && currentWaAccount) {
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
              msg: i.lastMessage.body,
              timestamp: Number(i.lastMessage.timestamp) * 1000,
              from: i.lastMessage.from,
              to: i.lastMessage.to,
              customer: i.id._serialized,
              service: i.fromMe ? i.lastMessage.from : i.lastMessage.to,
              fromMe: i.fromMe,
            });
          }
          return {
            name: i.id._serialized, // talk index name
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
