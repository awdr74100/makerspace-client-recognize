import axios from 'axios';

export default {
  namespaced: true,
  state: {
    member: {
      sound: '',
      features: [],
      id: '',
      email: '',
      name: '',
    },
  },
  actions: {
    async getMember({ commit }, { id }) {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/members/${id}`;

      try {
        const { data } = await axios.get(url);

        if (!data.success) {
          throw new Error(data.message);
        }

        commit('SET_MEMBER', {
          id: data.member._id,
          sound: data.member.sound,
          features: data.member.features.map((feature) =>
            Float32Array.from(Object.values(JSON.parse(feature))),
          ),
          email: data.member.email,
          name: data.member.accounts[0].name,
        });
      } catch (error) {
        this._vm.$toast.error(error.message);
      }
    },
    async getToken(context, { memberId, oauthId, soundId }) {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/members/token`;
      const payload = { memberId, oauthId, soundId };

      try {
        const { data } = await axios.post(url, payload);

        if (!data.success) {
          throw new Error(data.message);
        }

        localStorage.setItem('token', data.accessToken);
      } catch (error) {
        this._vm.$toast.error(error.message);
      }
    },
  },
  mutations: {
    SET_MEMBER(state, { id, sound, features, email, name }) {
      state.member.sound = sound;
      state.member.features = features;
      state.member.id = id;
      state.member.email = email;
      state.member.name = name;
    },
  },
};
