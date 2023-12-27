import {defineComponent, onMounted, ref} from 'vue';
import lottie from 'lottie-web';
import homeAnimation from '/@/assets/login.json';

export default defineComponent({
  name: 'LoginAnimation',
  setup() {
    const animationContainer = ref<HTMLDivElement | null>(null);
    onMounted(() => {
      if (animationContainer.value) {
        lottie.loadAnimation({
          container: animationContainer.value,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: homeAnimation,
        });
      }
    });
    return () => (
      <div class="flex flex-row">
        <div class="flex flex-col items-center justify-center w-full h-full">
          <div
            class="w-[500px] h-[500px] relative"
            ref={animationContainer}
          ></div>
        </div>
      </div>
    );
  },
});
