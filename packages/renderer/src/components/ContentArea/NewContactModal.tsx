import {defineComponent, ref} from 'vue';
import {useAppStore} from '/@/store';
import {newContactMsgToClient} from '#preload';

export default defineComponent({
  name: 'NewContactModal',
  props: {
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
    // store
    const store = useAppStore();
    // state
    const contact = ref<string>('');
    const msg = ref<string>('');

    const submit = async () => {
      if (!contact.value || !msg.value) {
        store.setShowMessage({msg: 'Please enter contact and message', type: 'error'});
        return;
      }
      const res = await newContactMsgToClient({
        persistId: store.currentWaAccountPersistId,
        contact: contact.value,
        msg: msg.value,
      });

      // push msg to talk list
      store.talkList.forEach(i => {
        if (i.name === contact.value) {
          i.talk.unshift({
            type: 'send',
            msg: msg.value,
            timestamp: Date.now(),
            to: contact.value,
            me: store.currentWaAccountPersistId,
            failed: res.status === 'error',
          });
        }
      });

      // reset form
      contact.value = '';
      msg.value = '';
      props.closeModal();

      store.setShowMessage({msg: res.msg, type: res.status});
    };

    return () => (
      <dialog
        id="qr_code"
        open={props.showModal}
        class="modal"
      >
        <div class="modal-box">
          <div class="flex flex-col justify-center items-center relative">
            <h3 class="font-bold text-lg">Send Message To New Contact</h3>
          </div>

          <div class="modal-body flex flex-col gap-[15px]">
            <div>
              <label class="label">
                <span class="label-text">Contact</span>
              </label>
              <input
                class="input input-bordered w-full input-sm max-w-xs"
                type="text"
                id="msg"
                placeholder="Enter Contact Phone"
                value={contact.value}
                onInput={(e: any) => {
                  contact.value = e.target.value;
                }}
              />
            </div>

            <div>
              <label class="label">
                <span class="label-text">Message</span>
              </label>
              <input
                class="input input-bordered w-full input-sm max-w-xs"
                type="text"
                id="msg"
                placeholder="Enter Message"
                value={msg.value}
                onInput={(e: any) => {
                  msg.value = e.target.value;
                }}
              />
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn btn-sm mr-[10px]"
              onClick={() => {
                props.closeModal();
              }}
            >
              Close
            </button>
            <button
              class="btn btn-primary btn-sm"
              onClick={submit}
            >
              Send
            </button>
          </div>
        </div>
      </dialog>
    );
  },
});
