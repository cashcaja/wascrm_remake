import {computed, defineComponent} from 'vue';
import {useAppStore} from '/@/store';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'TalkList',
  setup() {
    // store
    const store = useAppStore();
    const talkList = computed(() => store.talkList);

    return () => (
      <div class="flex flex-col justify-start items-start overflow-auto w-[280px] h-[calc(100vh-1px)] border-r-[1px] border-gray-700 menu">
        {talkList.value.map((i, k) => (
          <li
            key={k}
            class={'flex w-[100%] p-[5px] gap-[2px]'}
            onClick={() => {
              store.setCurrentTalk(i.talk);
            }}
          >
            <a>
              <img
                class="h-12 w-12 flex-none rounded-full bg-gray-50"
                src="https://api.iconify.design/mdi:account.svg?color=%23888888"
                alt=""
              />
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 ">{i.name}</p>
                <p class="mt-1 truncate text-xs leading-5 ">
                  {dayjs(Number(i.timestamp) * 1000).format('YYYY-MM-DD HH:mm')}
                </p>
              </div>
            </a>
          </li>
        ))}
      </div>
    );
  },
});
