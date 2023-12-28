import {defineComponent, watch, onMounted} from 'vue';
import {useAppStore} from '/@/store';
import TalkList from '/@/components/ContentArea/TalkList';

export default defineComponent({
  name: 'ContentArea',
  setup() {
    // store
    const store = useAppStore();
    // state
    onMounted(() => {
      console.log('all chats', store.chatHistory);
      if (store?.chatHistory?.[store?.currentWaAccountPersistId]) {
        const talkList = store.chatHistory[store.currentWaAccountPersistId].map(i => {
          return {
            name: i.name,
            timestamp: i.timestamp,
          };
        });

        if (talkList) {
          store.setTalkList(talkList);
        }
      }
    });

    watch(
      () => [store.chatHistory, store.currentWaAccountPersistId],
      () => {
        const talkList = store.chatHistory[store.currentWaAccountPersistId].map(i => {
          return {
            name: i.name,
            timestamp: i.timestamp,
          };
        });

        if (talkList) {
          store.setTalkList(talkList);
        }
      },
    );

    return () => (
      <div class="flex flex-row m-0 p-0">
        <TalkList />
      </div>
    );
  },
});
