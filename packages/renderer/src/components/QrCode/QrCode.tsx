import {defineComponent, reactive, watch} from 'vue';
import type {RenderAs} from 'qrcode.vue';
import QrcodeVue, {type Level} from 'qrcode.vue';

export default defineComponent({
  name: 'QrCode',
  props: {
    qrCode: {
      type: String,
      default: '',
      required: true,
    },
  },
  setup(props) {
    const state = reactive<{value: string; level: Level; renderAs: RenderAs}>({
      value: props.qrCode,
      level: 'H',
      renderAs: 'svg',
    });

    watch(
      () => props.qrCode,
      () => {
        state.value = props.qrCode;
      },
    );

    return () => (
      <QrcodeVue
        value={state.value}
        level={state.level}
        renderAs={state.renderAs}
        size={400}
      />
    );
  },
});
