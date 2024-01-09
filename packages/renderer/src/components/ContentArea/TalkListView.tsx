import {computed, defineComponent, ref, watch} from 'vue';
import {useAppStore} from '/@/store';
import dayjs from 'dayjs';
import NewContactModal from '/@/components/ContentArea/NewContactModal';
import {removeSuffix} from '/@/utils';

export default defineComponent({
  name: 'TalkList',
  setup() {
    // store
    const store = useAppStore();
    const talkList = computed(() => store.talkList);

    const showNewContactModal = ref<boolean>(false);

    watch(
      () => store.talkList,
      () => {
        if (
          store.talkList?.[store.currentWaAccountPersistId] &&
          store.talkList[store.currentWaAccountPersistId].length > 0
        ) {
          store.setCurrentTalk(store.talkList[store.currentWaAccountPersistId][0]?.talk);
        }
      },
    );

    return () => (
      <div class="border-r-[1px] border-gray-700 h-[100vh]">
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

        <div class="flex flex-col justify-start items-start w-[280px] h-[calc(100%-30px)] overflow-y-scroll gap-[2px]">
          {talkList.value?.[store.currentWaAccountPersistId] &&
            talkList.value[store.currentWaAccountPersistId]?.map((i, k) => (
              <div
                key={k}
                class={'w-[100%] p-[5px] cursor-pointer hover:bg-secondary'}
                onClick={() => {
                  if (i?.talk) {
                    store.setCurrentTalk(i.talk);
                    store.talkList[store.currentWaAccountPersistId].forEach(j => {
                      if (i.name === j.name) {
                        j.new = false;
                      }
                    });
                  }
                }}
              >
                <div class="flex flex-row gap-[10px]">
                  <img
                    class="h-12 w-12 flex-none rounded-full bg-gray-50"
                    src="https://api.iconify.design/mdi:account.svg?color=%23888888"
                    alt=""
                  />
                  <div class="min-w-0 ">
                    <p class="text-sm font-semibold leading-6 text-secondary-content/200">
                      {removeSuffix(i?.name)}
                    </p>
                    <p class="mt-1 truncate text-xs leading-5 ">
                      {dayjs(i.timestamp).format('YYYY-MM-DD HH:mm')}
                    </p>
                  </div>

                  {i?.new && <div class="badge badge-info">New</div>}
                </div>
              </div>
            ))}
        </div>
        <NewContactModal
          showModal={showNewContactModal.value}
          closeModal={() => {
            showNewContactModal.value = false;
          }}
        />
      </div>
    );
  },
});
