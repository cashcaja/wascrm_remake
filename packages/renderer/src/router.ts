import HomePage from '/@/pages/HomePage';
import LoginPage from '/@/pages/LoginPage';
import * as VueRouter from 'vue-router';

const routes = [
  {
    path: '/',
    component: LoginPage,
  },
  {
    path: '/home',
    component: HomePage,
  },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

export default router;
