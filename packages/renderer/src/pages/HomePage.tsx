import {defineComponent, onMounted, reactive, watch} from 'vue';
import {useAppStore} from '/@/store';
import SliderView from '/@/components/SliderView';
import {
  getAccountList,
  getQrCode,
  setLoading,
  openExternal,
  startup,
  loginSuccess,
  listenGetChats,
  listenReceiveMsg,
} from '#preload';
import QrCodeModal from '/@/components/QrCode';
import ContentArea from '/@/components/ContentArea';

export default defineComponent({
  setup() {
    // store
    const store = useAppStore();

    // state
    const state = reactive<{
      showQrCodeModal: boolean;
      qrCodeValue: string;
      message: string;
      showToast: boolean;
    }>({
      showQrCodeModal: false,
      qrCodeValue: '',
      message: '',
      showToast: false,
    });

    onMounted(() => {
      if (store?.waAccountList?.length > 0) {
        store.setLoading(true);
      }
      // restore account list
      startup();

      // all account list with backend & electron
      getAccountList(accountList => {
        console.log('get account list', accountList);
        store.setWaAccountList(accountList);
        // set current account
        store.setCurrentWaAccountPersistId(accountList[accountList.length - 1].persistId);
      });

      // loading status control with backend
      setLoading(status => {
        store.setLoading(status);
      });

      // get qrcode with login
      getQrCode(qrCode => {
        state.qrCodeValue = qrCode;
        state.showQrCodeModal = true;
        store.setLoading(false);
      });

      // login success
      loginSuccess(() => {
        state.showQrCodeModal = false;
      });

      // get current account chats
      listenGetChats(chats => {
        store.setChatsHistory(chats);
        store.setLoading(false);
      });

      watch(
        () => store.loading,
        () => {
          console.log('loading', store.loading);
        },
      );

      // receive message
      listenReceiveMsg(msg => {
        console.log('receive msg---->', msg);
        store.talkList.forEach(i => {
          if (i.name === msg.from) {
            i.talk.unshift({
              type: msg.from !== msg.me ? 'receive' : 'send',
              msg: msg.msg,
              timestamp: msg.timestamp,
              to: msg.to,
              me: msg.from,
            });
          }
        });
      });
    });

    // catch error or success message
    watch(
      () => store.showMessage,
      () => {
        state.showToast = true;
        if (store.showMessage?.msg) {
          state.message = store.showMessage.msg;
        }

        setTimeout(() => {
          if (store.showMessage?.action) {
            if (store.showMessage.action === 'logout') {
              openExternal('https://mobene.us.auth0.com/v2/logout');
            }
          }
          state.showToast = false;
        }, 3000);
      },
    );

    return () => (
      <div class="flex flex-row m-0 p-0">
        {state.showToast && store.showMessage && (
          <div class="toast toast-top toast-center">
            {store.showMessage.type === 'error' && (
              <div class="alert alert-error">
                <span>{store.showMessage.msg}</span>
              </div>
            )}
            {store.showMessage.type === 'success' && (
              <div class="alert alert-success">
                <span>{store.showMessage.msg}</span>
              </div>
            )}
          </div>
        )}

        {store.loading ? (
          <div class="relative w-[calc(100%-560px+90px)] ">
            <span class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] m-[auto] loading loading-bars loading-lg w-[150px]" />
          </div>
        ) : (
          <>
            <SliderView />
            <div class="w-[calc(100%-560px)] flex flex-col ">
              <ContentArea />
            </div>
          </>
        )}
        <div class="w-[470px] h-[100vh] border-l-[1px] border-gray-700"></div>

        <QrCodeModal
          showModal={state.showQrCodeModal}
          qrCode={state.qrCodeValue}
          closeModal={() => {
            state.showQrCodeModal = false;
          }}
        />
      </div>
    );
  },
});
