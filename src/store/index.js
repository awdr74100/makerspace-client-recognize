import Vue from 'vue';
import Vuex from 'vuex';
import oauthModule from './modules/oauth';
import memberModule from './modules/member';
import equipmentModule from './modules/equipment';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: import.meta.env.DEV,
  state: {
    loading: {
      status: '',
      active: false,
    },
  },
  actions: {},
  mutations: {
    SET_LOADING(state, { status, active }) {
      state.loading.status = status;
      state.loading.active = active;
    },
  },
  modules: {
    oauth: oauthModule,
    member: memberModule,
    equipment: equipmentModule,
  },
});
