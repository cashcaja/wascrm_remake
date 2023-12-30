import {computed, defineComponent, ref} from 'vue';
import {useAppStore} from '/@/store';
import dayjs from 'dayjs';
import NewContactModal from '/@/components/ContentArea/NewContactModal';

export default defineComponent({
  name: 'TalkList',
  setup() {
    // store
    const store = useAppStore();
    const talkList = computed(() => store.talkList);

    const showNewContactModal = ref<boolean>(false);

    return () => (
      <div class="border-r-[1px] border-gray-700">
        <div class="h-[30px] p-0 m-0 flex flex-row-reverse w-[95%] ">
          <div
            class="tooltip tooltip-bottom"
            data-tip="add new contact"
          >
            <button
              class="btn btn-sm rounded-box"
              onClick={() => (showNewContactModal.value = true)}
            >
              <span class="i-[mdi--account-plus-outline]" />
            </button>
          </div>
        </div>
        <div class="flex flex-col justify-start items-start overflow-auto w-[280px] h-[calc(100%-30px)]   menu">
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
                  <p class="text-sm font-semibold leading-6 ">{i?.name}</p>
                  <p class="mt-1 truncate text-xs leading-5 ">
                    {dayjs(Number(i.timestamp) * 1000).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
              </a>
            </li>
          ))}
          <NewContactModal
            showModal={showNewContactModal.value}
            closeModal={() => {
              showNewContactModal.value = false;
            }}
          />
        </div>
      </div>
    );
  },
});
