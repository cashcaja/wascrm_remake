import {useRouter} from 'vue-router';
import {useAppStore} from '/@/store';
import {defineComponent, onMounted, reactive, watch} from 'vue';
import {getUserInfoWithBackend, openExternal} from '#preload';
import LoginAnimation from '/@/components/LoginAnimation';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    // store state
    const store = useAppStore();
    const {setUserInfo} = store;
    // router
    const router = useRouter();
    // state
    const state = reactive({
      showLoginError: false,
    });

    // const valrible with auth0
    const auth0Domain = 'mobene.us.auth0.com';
    const clientId = '24TpzzMRXuKTsVgrB5TQd8gbV9u2Epz0';
    const redirectUri = 'dcs://open';

    onMounted(() => {
      getUserInfoWithBackend(info => {
        setUserInfo(info);
      });
    });

    watch(
      () => [store?.token, store?.userInfo],
      () => {
        if (store?.token && store?.userInfo) {
          if (store?.role && ['manager', 'customer-service'].includes(store.role)) {
            router.push('/home');
          } else {
            state.showLoginError = true;
            setTimeout(() => {
              state.showLoginError = false;
              // auth failed, logout
              openExternal('https://mobene.us.auth0.com/v2/logout');
            }, 3000);
          }
        }
      },
    );

    // login with browser link
    const loginAuth = async () => {
      openExternal(
        'https://' +
          auth0Domain +
          '/authorize?' +
          'scope=openid profile email offline_access&' +
          'audience=https://ai-assist-test-us.wuli.cash/&' +
          'response_type=code&' +
          'client_id=' +
          clientId +
          '&' +
          'redirect_uri=' +
          redirectUri,
      );
    };
    return () => (
      <>
        <div
          v-show={state.showLoginError}
          role="alert"
          class="alert alert-error absolute w-[500px] top-[10px] left-[50%] transform translate-x-[-50%]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Only customer service accounts are allowed to log in.</span>
        </div>
        <div class="flex flex-row">
          <div class="bg-[#641ae6] w-[50%] h-[100vh] flex flex-col justify-center items-center font-[800] text-4xl">
            <LoginAnimation />
            <span class="text-white mt-[40px]">DCS AI Client</span>
            <span class="text-white/20 text-[20px]">Jingle Byte</span>
          </div>
          <div class="w-[50%] h-[100vh] flex flex-col relative justify-center items-center">
            <div class="absolute top-[30px] right-[30px] font-bold">DCS AI Client</div>

            <div class="text-[50px] font-bold absolute top-[140px]">Login</div>

            <button
              class="btn btn-primary w-[300px] mt-[25px] bg-white"
              onClick={loginAuth}
            >
              <span class="text-black">Login</span>
            </button>
          </div>
        </div>
      </>
    );
  },
});
