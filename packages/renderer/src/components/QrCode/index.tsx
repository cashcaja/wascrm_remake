import {defineComponent} from 'vue';
import QrCode from './QrCode.js';
import {closeInstance} from '#preload';
import {useAppStore} from '/@/store';

export default defineComponent({
  name: 'QrCodeModal',
  props: {
    qrCode: {
      type: String,
      default: '',
      required: true,
    },
    showModal: {
      type: Boolean,
      default: false,
      required: true,
    },
    closeModal: {
      type: Function,
      default: () => {},
    },
  },
  setup(props) {
    const store = useAppStore();

    return () => (
      <dialog
        id="qr_code"
        open={props.showModal}
        class="modal"
      >
        <div class="modal-box">
          <div class="flex flex-col justify-center items-center relative">
            <h3 class="font-bold text-lg">Scan QR</h3>
            <div
              class="i-[mdi--close] absolute right-[10px] top-[10px] hover:text-white"
              onClick={() => {
                closeInstance(store.currentWaAccountPersistId);
                store.deleteAccount(store.currentWaAccountPersistId);
                props.closeModal();
              }}
            ></div>

            <QrCode
              qrCode={props.qrCode}
              class="mt-[20-x]"
            />
          </div>
        </div>
      </dialog>
    );
  },
});
