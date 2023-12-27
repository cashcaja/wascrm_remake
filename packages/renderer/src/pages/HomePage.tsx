import {defineComponent} from 'vue';
import {useAppStore} from '/@/store';
import SliderView from '/@/components/SliderView';

export default defineComponent({
  setup() {
    // store
    const store = useAppStore();

    return () => (
      <div class="flex flex-row m-0 p-0">
        <SliderView />
        <div class="w-[calc(100%-560px)] flex flex-col bg-[red]"></div>
        <div class="w-[470px] h-[100vh] bg-[green]"></div>
      </div>
    );
  },
});
