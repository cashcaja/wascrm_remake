import {defineComponent, reactive} from 'vue';
import {useAppStore} from '/@/store';

export default defineComponent({
  name: 'AccountListView',
  setup() {
    // store
    const store = useAppStore();

    const choiceDelete = (persistId: string) => {
      state.waClient.forEach(item => {
        if (item?.persistId === persistId) {
          item.delete = true;
        }
      });
      state.showCancelButton = true;
    };

    const cancelDelete = () => {
      state.waClient.forEach(item => {
        item.delete = false;
      });
      state.showCancelButton = false;
    };

    //state
    const state = reactive<{
      waClient: WaClient[];
      showCancelButton: boolean;
    }>({
      waClient: [
        {
          isRobot: false,
          persistId: 'kasdjlasdajdl',
          delete: false,
          name: 'Rizky',
          img: 'https://i.pravatar.cc/150?img=3',
          appPkg: 'com.whatsapp',
          country: 'maxico',
          csid: '123123123',
          csemail: 'moca_tao7@foxmail.com',
          waAccount: '123123123',
        },
      ],
      showCancelButton: false,
    });
    return () => (
      <div class="relative mt-[20px] flex flex-col justify-center items-center gap-[10px]">
        {state?.waClient?.length > 0 &&
          state.waClient.map(item => (
            <div class="avatar indicator">
              {!item?.delete && (
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
                  store.setCurrentWaAccountPersistId(item.persistId);
                }}
              >
                {!item.delete ? (
                  <img
                    src={
                      item.img
                        ? item.img
                        : 'https://api.iconify.design/mdi:account.svg?color=%23888888'
                    }
                    alt=""
                  />
                ) : (
                  <span
                    v-else
                    class="i-[mdi--close] text-2xl w-[98%] h-[98%] hover:text-red-50"
                    onClick={e => {
                      e.stopPropagation();
                    }}
                  ></span>
                )}
              </div>
            </div>
          ))}

        {state.showCancelButton && (
          <button
            class="btn btn-primary btn-sm mt-[20px]"
            onClick={cancelDelete}
          >
            cancel
          </button>
        )}
      </div>
    );
  },
});
