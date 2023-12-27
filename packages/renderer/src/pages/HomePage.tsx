import {defineComponent, onMounted} from 'vue';
import {useAppStore} from '/@/store';
import SliderView from '/@/components/SliderView';
import {getAccountList} from '#preload';

export default defineComponent({
  setup() {
    // store
    const store = useAppStore();

    onMounted(() => {
      getAccountList(accountList => {
        store.setWaAccountList(accountList);
      });
    });

    return () => (
      <div class="flex flex-row m-0 p-0">
        <SliderView />
        <div class="w-[calc(100%-560px)] flex flex-col bg-[red]"></div>
        <div class="w-[470px] h-[100vh] bg-[green]"></div>
      </div>
    );
  },
});
