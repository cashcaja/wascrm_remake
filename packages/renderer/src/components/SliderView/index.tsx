import {defineComponent, reactive} from 'vue';
import AccountListView from '/@/components/SliderView/AccountListView';
import ChangeThemeModal from '/@/components/SliderView/ChangeThemeModal';
import LogoutModal from '/@/components/SliderView/LogoutModal';

export default defineComponent({
  name: 'SliderView',
  setup() {
    const state = reactive<{
      showChangeThemeModal: boolean;
      showSetting: boolean;
      showLogoutModal: boolean;
    }>({
      showChangeThemeModal: false,
      showSetting: false,
      showLogoutModal: false,
    });

    return () => (
      <div class="w-[90px] h-100vh relative border-r-[1px] border-gray-700">
        <AccountListView />
        <ChangeThemeModal
          visible={state.showChangeThemeModal}
          closeModal={() => {
            state.showChangeThemeModal = false;
          }}
        />
        <LogoutModal
          visible={state.showLogoutModal}
          closeModal={() => {
            state.showLogoutModal = false;
          }}
        />

        <button
          class="absolute bottom-[20px] left-[28px] btn btn-circle btn-outline p-[0px] m-[0px] btn-sm"
          onClick={() => {
            state.showSetting = true;
          }}
        >
          <span class="i-[mdi--settings-outline]"></span>
        </button>

        {state.showSetting && (
          <ul
            class="menu bg-base-200 w-56 rounded-box absolute bottom-[55px] left-[28px]"
            onMouseleave={() => (state.showSetting = false)}
          >
            <li
              onClick={() => {
                state.showChangeThemeModal = true;
              }}
            >
              <a>
                <span class="i-[mdi--format-color-highlight] text-[22px]"></span>
                Change Theme
              </a>
            </li>
            <li
              onClick={() => {
                state.showLogoutModal = true;
              }}
            >
              <a>
                <span class="i-[mdi--logout-variant] text-[22px]"></span>
                Logout
              </a>
            </li>
          </ul>
        )}
      </div>
    );
  },
});
