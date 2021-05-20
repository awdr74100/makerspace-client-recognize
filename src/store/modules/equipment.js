import axios from 'axios';
import router from '@/router';

export default {
  namespaced: true,
  state: {
    equipment: [],
  },
  actions: {
    async getEquipment({ commit }, { memberId }) {
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL
      }/api/equipment?member=${memberId}`;

      try {
        const { data } = await axios.get(url);

        if (!data.success) {
          throw new Error(data.message);
        }

        commit('SET_EQUIPMENT', { equipment: data.equipment });
      } catch (error) {
        this._vm.$toast.error(error.message);
      }
    },
    async addEquipmentLog(context, { id, memberId, soundId, startAt, endAt }) {
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL
      }/api/equipment/${id}/logs`;
      const payload = { memberId, soundId, startAt, endAt };

      try {
        const { data } = await axios.post(url, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!data.success) {
          throw new Error(data.message);
        }

        this._vm.$toast.success('目標已解鎖');
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this._vm.$toast.error(error.response.data.message);
          router.push({ path: '/' });
          return;
        }

        this._vm.$toast.error(error.message);
      }
    },
    async updateEquipmentLog(context, { id, logId, endAt }) {
      const url = `${
        import.meta.env.VITE_APP_BACKEND_URL
      }/api/equipment/${id}/logs/${logId}`;
      const payload = { endAt };

      try {
        const { data } = await axios.patch(url, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!data.success) {
          throw new Error(data.message);
        }

        this._vm.$toast.success('時限已更新');
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this._vm.$toast.error(error.response.data.message);
          router.push({ path: '/' });
          return;
        }

        this._vm.$toast.error(error.message);
      }
    },
  },
  mutations: {
    SET_EQUIPMENT(state, { equipment }) {
      state.equipment = equipment;
    },
  },
};
