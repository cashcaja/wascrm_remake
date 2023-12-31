import {computed, defineComponent, onMounted, watch} from 'vue';
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
      console.log('all chats', store?.chatHistory?.[store?.currentWaAccountPersistId]);
      console.log('chat history', store?.talkList?.[store?.currentWaAccountPersistId]);
      if (store?.chatHistory?.[store?.currentWaAccountPersistId] && currentWaAccount) {
        const talkList: {
          [key: string]: {timestamp: number; persistId: string; name: string; talk: Talk[]}[];
        } = {};

        const tempTalkList = store.chatHistory[store.currentWaAccountPersistId].map(i => {
          const tempTalk: Talk[] = [];
          // exclude have history talk
          if (store.talkList?.[store.currentWaAccountPersistId]) {
            for (const j of store.talkList[store.currentWaAccountPersistId]) {
              if (j.name === i.id?._serialized && j.persistId === store.currentWaAccountPersistId) {
                return j;
              }
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
              service: i.lastMessage.fromMe ? i.lastMessage.from : i.lastMessage.to,
              fromMe: i.lastMessage.fromMe,
            });
          }
          return {
            name: i.id._serialized, // talk index name
            timestamp: i?.timestamp ? i?.timestamp : dayjs().valueOf(),
            persistId: store.currentWaAccountPersistId,
            talk: tempTalk,
          };
        });
        talkList[store.currentWaAccountPersistId] = tempTalkList;

        if (talkList && store.currentWaAccountPersistId) {
          store.setTalkList({
            ...store.talkList,
            ...talkList,
          });
        }
      }
    };

    onMounted(() => {
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
        <TalkListView />
        <TalkView />
      </div>
    );
  },
});
