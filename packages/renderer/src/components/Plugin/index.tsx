import type {Component, VNode} from 'vue';
import {defineComponent, h, ref, watch} from 'vue';
import {useAppStore} from '/@/store';
import ChatFC from '/@/components/Plugin/ChatFC';

interface PluginTab {
  [key: string]: {
    component: Component;
    icon: () => VNode;
    tooltip: string;
  };
}

export default defineComponent({
  name: 'Plugin',
  setup() {
    // store
    const store = useAppStore();
    // state
    const currentTab = ref<string>('Chat');

    const tabs: PluginTab = {
      Chat: {
        component: ChatFC,
        icon: () => h('div', {class: 'i-[mdi--android] text-[30px]'}),
        tooltip: 'ai chat',
      },
    };

    watch(
      () => store.currentTab,
      () => {
        currentTab.value = store.currentTab;
      },
    );

    return () => (
      <div class=" w-[100%] h-[100vh]">
        <div class="flex flex-row">
          <div class="w-[410px]">{h(tabs[currentTab.value].component)}</div>
          <div class="w-[60px] h-[100vh] flex flex-col items-center border-l-[1px] border-gray-700">
            {Object.keys(tabs).map(i => {
              return (
                <div
                  class="tooltip tooltip-left"
                  data-tip={tabs[i].tooltip}
                >
                  <div
                    key={i}
                    class="w-[50px] h-[50px] rounded mt-[5px] cursor-pointer hover:bg-gray-700 flex flex-col justify-center items-center text-center"
                    onClick={() => (currentTab.value = i)}
                  >
                    {tabs[i].icon()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
});
