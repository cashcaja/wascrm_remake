import {computed, defineComponent, reactive} from 'vue';
import {useAppStore} from '/@/store';
import AddAccountModal from '/@/components/AddAccount';
import {closeInstance, switchAccountWithClient} from '#preload';
import sensors from '/@/utils/sensors';
import {removeSuffix} from '/@/utils';

export default defineComponent({
  name: 'AccountListView',
  setup() {
    // store
    const store = useAppStore();

    //state
    const state = reactive<{
      showCancelButton: boolean;
      showAddAccountModal: boolean;
    }>({
      showCancelButton: false,
      showAddAccountModal: false,
    });

    const waAccountList = computed(() => store.waAccountList);

    const choiceDelete = (persistId: string) => {
      waAccountList.value.forEach(item => {
        if (item?.persistId === persistId) {
          item.delete = true;
        }
      });
      state.showCancelButton = true;
    };

    const cancelDelete = () => {
      waAccountList.value.forEach(item => {
        item.delete = false;
      });
      state.showCancelButton = false;
    };

    const deleteAccount = (item: WaClient) => {
      try {
        // sensors delete account
        sensors.track('wa_list_exit', {
          csid: store.userInfo?.sub,
          cs_email: store.userInfo?.email,
          country: item.country,
          exit_online_service: item.waAccount
            ? removeSuffix(item.waAccount as string)
            : item.waAccount,
        });
      } catch (e) {
        console.log('exit error', e);
      } finally {
        store.deleteAccount(item.persistId);
        closeInstance(item.persistId);
        state.showCancelButton = false;
      }
    };

    const switchAccount = () => {
      store.waAccountList.forEach(item => {
        if (item.persistId === store.currentWaAccountPersistId) {
          item.isRobot = !item.isRobot;
          item.delete = false;
        }
      });
      switchAccountWithClient(store.currentWaAccountPersistId);
      state.showCancelButton = false;
    };

    return () => (
      <div class="relative mt-[20px] flex flex-col justify-center items-center gap-[10px] ">
        {waAccountList.value?.length > 0 &&
          waAccountList.value?.map(item => (
            <div class="avatar indicator">
              {!item?.delete &&
                !state.showCancelButton &&
                item.persistId === store.currentWaAccountPersistId && (
                  <span
                    class="indicator-item w-[15px] h-[15px] hover:i-[mdi--microsoft-xbox-controller-menu] hover:bg-fuchsia-600 ml-[20px]"
                    onClick={e => {
                      e.stopPropagation();
                      choiceDelete(item?.persistId);
                    }}
                  ></span>
                )}
              <div
                class={`w-12 rounded-full hover:ring hover:ring-primary ${
                  item.persistId === store.currentWaAccountPersistId
                    ? 'ring ring-primary ring-offset-base-100 ring-offset-2'
                    : ''
                }`}
                onClick={e => {
                  e.stopPropagation();
                  console.log('change account', item.persistId);
                  store.setCurrentWaAccountPersistId(item.persistId);
                }}
              >
                {!item.delete ? (
                  <div class="relative">
                    {!!item?.isRobot && (
                      <div class="text-[25px] font-bold absolute right-[10px] top-[5px]">AI</div>
                    )}
                    <img
                      src={
                        item.img
                          ? item.img
                          : 'https://api.iconify.design/mdi:account.svg?color=%23888888'
                      }
                      alt=""
                    />
                  </div>
                ) : (
                  <span
                    v-else
                    class="i-[mdi--close] text-2xl w-[98%] h-[98%] hover:text-red-50"
                    onClick={e => {
                      e.stopPropagation();
                      deleteAccount(item);
                    }}
                  ></span>
                )}
              </div>
            </div>
          ))}

        {state.showCancelButton && (
          <>
            <button
              class="btn btn-primary btn-sm mt-[20px]"
              onClick={cancelDelete}
            >
              cancel
            </button>
            <button
              class="btn btn-primary btn-sm mt-[20px]"
              onClick={switchAccount}
            >
              switch
            </button>
          </>
        )}

        {waAccountList.value?.length < 10 && (
          <div
            class="tooltip tooltip-bottom tooltip-info"
            data-tip="add account"
            onClick={() => {
              state.showAddAccountModal = true;
              store.getAppList();
            }}
          >
            <span class="i-[mdi--add-circle-outline] text-[40px] text-gray-600 mt-[10px] hover:text-gray-400"></span>
          </div>
        )}
        <AddAccountModal
          showModal={state.showAddAccountModal}
          closeModel={() => {
            state.showAddAccountModal = false;
          }}
        />
      </div>
    );
  },
});
