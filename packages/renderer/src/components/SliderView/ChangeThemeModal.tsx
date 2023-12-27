import {defineComponent} from 'vue';
import {onMounted} from 'vue';
import {themeChange} from 'theme-change';
import {vi} from 'vitest';
import {isBoolean} from 'lodash';

const themes: string[] = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
];

export default defineComponent({
  name: 'ChangeThemeModal',
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
    onMounted(() => {
      themeChange(false);
    });

    return () => (
      <dialog
        id="my_modal_10"
        class="modal"
        open={props.visible}
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg">Change Theme</h3>
          <select
            data-choose-theme
            class="mt-[20px] select select-bordered select-sm w-full max-w-xs ml-[80px]"
          >
            {themes.map((value, index) => {
              return (
                <option
                  key={index}
                  value={value}
                >
                  {value}
                </option>
              );
            })}
          </select>
          <div class="modal-action">
            <form method="dialog">
              <button
                class="btn btn-sm btn-primary"
                onClick={() => props.closeModal()}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    );
  },
});
