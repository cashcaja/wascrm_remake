import {computed, defineComponent, reactive} from 'vue';
import {useAppStore} from '/@/store';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'TalkList',
  setup() {
    // store
    const store = useAppStore();
    // state
    const state = reactive<{currenTalk: string}>({
      currenTalk: '',
    });
    const talkList = computed(() => store.talkList);

    console.log(talkList.value);

    return () => (
      <div class="flex flex-col justify-start items-start gap-[1px] overflow-auto w-[280px] h-[calc(100vh-10px)] border-r-[1px] border-gray-700">
        {talkList.value.map(i => (
          <div
            class={`flex w-[100%] p-[5px] gap-[2px] border-b-[1px] border-gray-700 ${
              i.name === state.currenTalk ? 'bg-primary' : 'bg-secondary'
            }`}
            onClick={() => {
              state.currenTalk = i.name;
            }}
          >
            <img
              class="h-12 w-12 flex-none rounded-full bg-gray-50"
              src="https://api.iconify.design/mdi:account.svg?color=%23888888"
              alt=""
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm font-semibold leading-6 text-primary-content">{i.name}</p>
              <p class="mt-1 truncate text-xs leading-5 text-secondary-content">
                {dayjs(Number(i.timestamp) * 1000).format('YYYY-MM-DD HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  },
});
