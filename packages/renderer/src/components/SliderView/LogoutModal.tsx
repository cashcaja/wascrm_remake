import {defineComponent} from 'vue';
import {cleanCacheWithClient, openExternal} from '#preload';
import {useRouter} from 'vue-router';
import {useAppStore} from '/@/store';

export default defineComponent({
  name: 'CleanCacheModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
      required: true,
    },
    closeModal: {
      type: Function,
      default: () => {},
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const store = useAppStore();

    const logOut = () => {
      cleanCacheWithClient();
      store.logout();
      openExternal('https://mobene.us.auth0.com/v2/logout');
      props.closeModal();
      router.push('/');
    };

    return () => (
      <dialog
        id="clean_cache"
        open={props.visible}
        class="modal"
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg">Logout</h3>
          <p class="py-4">will clean all cache and account info !</p>
          <div class="modal-action">
            <button
              class="btn btn-sm mr-[10px]"
              onClick={() => props.closeModal()}
            >
              Cancel
            </button>
            <button
              class="btn btn-sm btn-primary"
              onClick={logOut}
            >
              Accept
            </button>
          </div>
        </div>
      </dialog>
    );
  },
});
