<template>
  <div
    class="
      container
      d-flex
      justify-content-center
      align-items-center
      vw-100
      vh-100
    "
  >
    <button
      class="btn btn-primary font-weight-bold p-0 d-flex align-items-center"
      @click.prevent="signIn"
    >
      <div
        class="bg-white d-flex justify-content-center align-items-center"
        style="margin: 1px"
      >
        <span class="icon m-2"></span>
      </div>
      <span class="mx-3">Sign in with Google</span>
    </button>
  </div>
</template>

<script>
import qs from 'qs';
import jwtDecode from 'jwt-decode';

export default {
  created() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const { exp } = jwtDecode(token);

    if (exp * 1000 >= Date.now()) {
      this.$router.push({ path: '/equipment' });
    }
  },
  methods: {
    signIn() {
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?';
      const query = qs.stringify({
        scope: 'email profile',
        client_id: import.meta.env.VITE_APP_OAUTH_ID,
        response_type: 'token',
        redirect_uri: `${window.location.origin}/recognition`,
      });
      window.location.href = url + query;
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  width: 24px;
  height: 24px;
  background-image: url('@/assets/img/google.svg');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
