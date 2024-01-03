import {defineComponent} from 'vue';

export default defineComponent({
  name: 'MaskView',
  setup() {
    return () => (
      <div class="absolute h-full w-[100%] z-index-[99] flex flex-row justify-center items-center bg-gray-300">
        <div class="text-[80px]">AI Daemon</div>
      </div>
    );
  },
});
