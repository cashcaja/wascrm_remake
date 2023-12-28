import {createApp} from 'vue';
import App from '/@/App.vue';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import {createPinia} from 'pinia';
import router from '/@/router';
import '/@/index.css';
import 'daisyui/dist/themes.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
