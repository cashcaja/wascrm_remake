import {defineComponent, reactive} from 'vue';

export default defineComponent({
  setup() {
    // store
    const choiceDelete = (persistId: string) => {
      console.log(persistId);
      state.waClient.forEach(item => {
        if (item?.persistId === persistId) {
          item.delete = true;
        }
      });
    };

    //state
    const state = reactive<{
      waClient: WaClient[];
    }>({
      waClient: [
        {
          robot: false,
          persistid: 'kasdjlasdajdl',
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
    });

    return () => (
      <div class="w-[90px] h-100vh relative border-r-[1px] border-gray-700 bg-[purple]">
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
                    item.persistId === state.currentBrowserPersistId
                      ? 'ring ring-primary ring-offset-base-100 ring-offset-2'
                      : ''
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                >
                  <img
                    v-if="!item.delete"
                    src={
                      item.img
                        ? item.img
                        : 'https://api.iconify.design/mdi:account.svg?color=%23888888'
                    }
                    alt=""
                  />

                  <span
                    v-else
                    class="i-[mdi--close] text-2xl w-[98%] h-[98%] hover:text-red-50"
                    onClick={e => {
                      e.stopPropagation();
                    }}
                  ></span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  },
});
