import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'signin',
    component: () => import('@/views/SignIn.vue'),
  },
  {
    path: '/recognition',
    name: 'recognition',
    component: () => import('@/views/Recognition.vue'),
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('@/views/Equipment.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
