import {defineComponent, onMounted, reactive, watch} from 'vue';
import {useAppStore} from '/@/store';
import SliderView from '/@/components/SliderView';
import {
  cleanCacheWithClient,
  getAccountList,
  getQrCode,
  listenGetChats,
  listenReceiveMsg,
  loginSuccess,
  openExternal,
  sendMsgToClient,
  sendNotification,
  setLoading,
  startup,
} from '#preload';
import QrCodeModal from '/@/components/QrCode';
import ContentArea from '/@/components/ContentArea';
import Plugin from '/@/components/Plugin';
import dayjs from 'dayjs';
import {askAI} from '/@/apis/chat';
import {useRouter} from 'vue-router';
import sensors from '/@/utils/sensors';
import {removeSuffix} from '/@/utils';

export default defineComponent({
  setup() {
    const router = useRouter();
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

    const listenRobotMsg = async (msg: any) => {
      // if robot account will auto reply
      const currentWaAccount = store.waAccountList.find(
        i => i.persistId === store?.currentWaAccountPersistId,
      );
      if (
        msg.fromMe &&
        msg.from !== msg.to &&
        currentWaAccount?.waAccount &&
        currentWaAccount?.isRobot
      ) {
        try {
          const aiRes: any = await askAI({
            query: msg.msg,
            app_pkg: currentWaAccount.appPkg,
            uid: currentWaAccount.csid,
            wa_phone: currentWaAccount.waAccount,
          });

          if (aiRes.code === 0 && aiRes?.data?.reply) {
            const res = await sendMsgToClient({
              persistId: store.currentWaAccountPersistId,
              msg: aiRes.data.reply,
              to: msg.to,
            });
            store.talkList.forEach(i => {
              if (i.name === msg.from) {
                i.talk.unshift({
                  msg: aiRes.data.reply,
                  timestamp: dayjs().valueOf(),
                  to: msg.to,
                  from: msg.from,
                  fromMe: true,
                  customer: msg.to,
                  service: msg.from,
                  failed: res.status === 'error',
                });
              }
            });
            if (currentWaAccount && currentWaAccount.waAccount) {
              sensors.track('send', {
                csid: store.userInfo?.sub,
                cs_email: store.userInfo?.email,
                country: currentWaAccount.country,
                customer: removeSuffix(msg.to),
                online_service: removeSuffix(currentWaAccount.waAccount),
                online_service_msg: aiRes.data.reply,
                app_pkg: currentWaAccount.appPkg,
                isBot: true,
              });
            }
          } else {
            store.talkList.forEach(i => {
              if (i.name === msg.from) {
                i.talk.unshift({
                  msg: 'ai response error',
                  timestamp: dayjs().valueOf(),
                  to: msg.to,
                  fromMe: true,
                  from: msg.from,
                  customer: msg.to,
                  service: msg.from,
                  failed: true,
                });
              }
            });
          }
        } catch (e) {
          console.log('error', e);
          store.talkList.forEach(i => {
            if (i.name === msg.from) {
              i.talk.unshift({
                msg: 'unknown error',
                timestamp: dayjs().valueOf(),
                to: msg.to,
                from: msg.from,
                fromMe: true,
                customer: msg.to,
                service: msg.from,
                failed: true,
              });
            }
          });
        }
      }
    };

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

        // record wa account list
        const account_list: string[] = [];
        store.waAccountList.forEach(i => {
          if (i.waAccount) {
            account_list.push(removeSuffix(i.waAccount));
          }
        });
        if (account_list.length > 0) {
          sensors.track('wa_list_account', {
            csid: store.userInfo?.sub,
            cs_email: store.userInfo?.email,
            account_list: account_list.toString(),
          });
        }
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

      // receive message
      listenReceiveMsg(msg => {
        console.log('receive msg---->', msg);
        const currentWaAccount = store.waAccountList.find(
          i => i.persistId === store?.currentWaAccountPersistId,
        );

        if (currentWaAccount?.waAccount !== msg.from) {
          sendNotification({title: 'New Message', body: msg.msg});
        }

        store.talkList.forEach(i => {
          if (i.name === msg.from) {
            i.talk.unshift({
              msg: msg.msg,
              timestamp: msg.timestamp,
              to: msg.to,
              from: msg.from,
              fromMe: msg.fromMe,
              customer: msg.fromMe ? msg.to : msg.from,
              service: msg.fromMe ? msg.from : msg.to,
            });
          }
        });

        if (currentWaAccount && msg.from !== currentWaAccount?.waAccount) {
          // sensors record receive
          sensors.track('receive', {
            csid: currentWaAccount.csid,
            cs_email: currentWaAccount.csemail,
            customer: msg.from,
            customer_msg: msg.msg,
            online_service: removeSuffix(currentWaAccount?.waAccount as string),
            app_pkg: currentWaAccount.appPkg,
            country: currentWaAccount.country,
            isBot: false,
          });
        }

        // if on account is robot
        listenRobotMsg(msg);
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
              cleanCacheWithClient();
              localStorage.removeItem('app');
              openExternal('https://mobene.us.auth0.com/v2/logout');
              router.push('/');
            }
          }
          state.showToast = false;
        }, 3000);
      },
    );

    return () => (
      <div class="flex flex-row m-0 p-0">
        {state.showToast && store.showMessage && (
          <div class="toast toast-right toast-top z-[99]">
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
          <div class="relative w-full h-[100vh]">
            <span class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] m-[auto] loading loading-bars loading-lg w-[150px]" />
          </div>
        ) : (
          <>
            <SliderView />
            <div class="w-[calc(100%-560px)] flex flex-col h-[100vh] ">
              <ContentArea />
            </div>
            <div class="w-[470px] h-[100vh] border-l-[1px] border-gray-700">
              <Plugin />
            </div>
          </>
        )}

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
