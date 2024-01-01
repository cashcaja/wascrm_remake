import {defineComponent, onMounted, reactive} from 'vue';
import {useAppStore} from '/@/store';
import {proxyList as getProxyList} from '/@/apis/account';
import {addAccount} from '#preload';
import sensors from '/@/utils/sensors';

export default defineComponent({
  name: 'AddAccount',
  props: {
    showModal: {
      type: Boolean,
      default: false,
      required: true,
    },
    closeModel: {
      type: Function,
      required: true,
      default: () => {},
    },
  },
  setup(props) {
    const store = useAppStore();

    const state = reactive<{
      proxyList: {
        ip: string;
        port: number;
        name: string;
      }[];
      proxyHost: string;
      proxyPort: number | null | undefined;
      haveAuth: boolean;
      username: string;
      password: string;
      currentProxy: {host: string; port: number | null | undefined};
      app: string | null;
    }>({
      proxyList: [],
      currentProxy: {host: '', port: undefined},
      haveAuth: false,
      proxyHost: '',
      proxyPort: 0,
      username: '',
      password: '',
      app: '',
    });

    const addAccountBrowserView = () => {
      if (!state.app) {
        store.setShowMessage({msg: 'please select account', type: 'error'});
        return;
      }

      const tempApp = store.appList.find(i => i.label === state.app) as any;
      if (store.userInfo) {
        addAccount({
          host: state.proxyHost,
          port: state.proxyPort === 0 ? null : state.proxyPort,
          isRobot: tempApp.label.includes('bot'),
          username: state.username,
          password: state.password,
          appPkg: tempApp.appPkg,
          country: tempApp.country,
          csid: store.userInfo.sub,
          csemail: store.userInfo.email,
        });

        // sensors add account
        const currentAccount = store.waAccountList.find(
          i => i.persistId === store.currentWaAccountPersistId,
        );
        if (currentAccount && currentAccount.waAccount) {
          // record proxy
          const proxy: Partial<Proxy> = {};
          if (currentAccount.host && currentAccount.port) {
            proxy.host = currentAccount.host;
            proxy.port = currentAccount.port;
            if (currentAccount.username && currentAccount.password) {
              proxy.username = currentAccount.username;
              proxy.password = currentAccount.password;
            }
          }

          sensors.track('wa_list_add', {
            csid: store.userInfo?.sub,
            cs_email: store.userInfo?.email,
            country: currentAccount.country,
            select_agent: proxy,
            select_app: currentAccount.appPkg,
            // TODO add_whatsapp
          });
        }

        store.setLoading(true);
        resetFormItem();
        props.closeModel();
      }
    };

    const resetFormItem = () => {
      state.currentProxy = {host: '', port: null};
      state.proxyHost = '';
      state.proxyPort = undefined;
      state.haveAuth = false;
      state.username = '';
      state.password = '';
      state.app = '';
    };

    onMounted(async () => {
      try {
        const proxys = await getProxyList();
        state.proxyList = proxys?.data?.proxys;
      } catch (e) {
        console.log(e);
      }
    });

    return () => (
      <>
        <dialog
          id="add_account"
          open={props.showModal}
          class="modal"
        >
          <div class="modal-box">
            <label class="label">
              <span class="label-text">bot wa && service wa</span>
            </label>
            <div class="flex flex-row justify-center items-center">
              <select
                v-model={state.app}
                class="select select-bordered w-full max-w-xs select-sm"
              >
                {store.appList.map((v, i) => (
                  <option
                    key={i}
                    value={v?.label}
                  >
                    {v?.label}
                  </option>
                ))}
              </select>
            </div>

            <div class="collapse bg-base-200 mt-[20px]">
              <input type="checkbox" />
              <div class="collapse-title font-normal">advanced options</div>
              <div class="collapse-content">
                <label class="label">
                  <span class="label-text">select proxy</span>
                </label>
                <select
                  v-model={state.currentProxy}
                  class="select select-bordered w-full max-w-xs select-sm"
                  onChange={() => {
                    state.proxyHost = state.currentProxy.host;
                    state.proxyPort = Number(state.currentProxy.port);
                  }}
                >
                  {state.proxyList.map((v, i) => (
                    <option
                      key={i}
                      value={{host: v.ip, port: v.port}}
                    >
                      {v.name}
                    </option>
                  ))}
                </select>

                <label class="label">
                  <span class="label-text">host</span>
                </label>
                <input
                  v-model={state.proxyHost}
                  type="text"
                  placeholder="enter your proxy ip"
                  class="input input-bordered w-full input-sm max-w-xs"
                />

                <label class="label">
                  <span class="label-text">port</span>
                </label>
                <input
                  v-model={state.proxyPort}
                  type="text"
                  placeholder="enter your proxy port"
                  class="input input-bordered w-full max-w-xs input-sm"
                />

                <label class="label cursor-pointer mt-[20px]">
                  <span class="label-text">Is There Verification</span>
                  <input
                    v-model={state.haveAuth}
                    type="checkbox"
                    class="toggle toggle-primary"
                  />
                </label>

                {state.haveAuth && (
                  <div>
                    <label class="label">
                      <span class="label-text">username</span>
                    </label>
                    <input
                      v-model={state.username}
                      type="text"
                      placeholder="enter your username"
                      class="input input-bordered w-full max-w-xs input-sm"
                    />
                    <label class="label">
                      <span class="label-text">password</span>
                    </label>
                    <input
                      v-model={state.password}
                      type="password"
                      placeholder="enter your password"
                      class="input input-bordered w-full max-w-xs input-sm"
                    />
                  </div>
                )}

                <div class="alert alert-info mt-[20px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>If you do not fill in the host and port, the proxy will not be used.</span>
                </div>
              </div>
            </div>

            <div class="modal-action">
              <button
                class="btn btn-sm mr-[10px]"
                onClick={() => {
                  resetFormItem();
                  props.closeModel();
                }}
              >
                Close
              </button>
              <button
                class="btn btn-primary btn-sm"
                onClick={addAccountBrowserView}
              >
                Add
              </button>
            </div>
          </div>
        </dialog>
      </>
    );
  },
});
