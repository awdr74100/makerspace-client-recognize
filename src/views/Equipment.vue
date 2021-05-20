<template>
  <div class="container-fluid px-0">
    <div class="d-flex align-items-center px-3 mt-4 mb-3">
      <h2 class="mb-0">設備列表</h2>
      <span class="ms-auto text-teal" @click.prevent="reloadEquipment">
        <font-awesome-icon
          :icon="['fas', 'sync-alt']"
          size="2x"
          :spin="reload"
        />
      </span>
    </div>
    <ul class="list-unstyled d-flex flex-column mb-4 px-3">
      <li
        v-for="(item, index) in equipment"
        :key="index"
        class="
          border
          shadow-sm
          mt-2
          d-flex
          align-items-stretch
          flex-wrap
          rounded
        "
        @click.prevent="toggleCollapse(item._id)"
      >
        <div class="bg-teal text-white px-3 py-4">
          <font-awesome-icon :icon="['fas', 'project-diagram']" size="2x" />
        </div>
        <div class="flex-grow-1 px-3">
          <div class="d-flex align-items-center pt-2 pb-2">
            <span class="text-teal">
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </span>
            <p class="mb-0 ms-2 fs-5 text-teal">{{ item.name }}</p>
            <small
              v-if="
                item.timing &&
                item.logs.length > 0 &&
                new Date(item.logs[item.logs.length - 1].endAt).getTime() >=
                  Date.now()
              "
              class="ms-auto align-self-end text-secondary"
            >
              <font-awesome-icon :icon="['far', 'clock']" />
              <span class="ms-1">
                <vue-countdown
                  v-slot="{ hours, minutes, seconds }"
                  :transform="transformSlotProps"
                  :emit-events="false"
                  :time="
                    new Date(item.logs[item.logs.length - 1].endAt).getTime() -
                    Date.now()
                  "
                >
                  {{ hours }}:{{ minutes }}:{{ seconds }}
                </vue-countdown>
              </span>
            </small>
          </div>
          <div
            class="w-100"
            style="height: 1px; background-color: #e7e7e7"
          ></div>
          <div class="d-flex pt-1">
            <div class="d-flex align-items-center">
              <span class="text-secondary">聲聯網</span>
              <span
                class="ms-2"
                :class="{ 'text-teal': item.net, 'text-danger': !item.net }"
              >
                <font-awesome-icon v-if="item.net" :icon="['fas', 'check']" />
                <font-awesome-icon v-else :icon="['fas', 'times']" />
              </span>
            </div>
            <div class="d-flex align-items-center ms-3">
              <span class="text-secondary">時間限制</span>
              <span
                class="ms-2"
                :class="{
                  'text-teal': item.timing,
                  'text-danger': !item.timing,
                }"
              >
                <font-awesome-icon
                  v-if="item.timing"
                  :icon="['fas', 'check']"
                />
                <font-awesome-icon v-else :icon="['fas', 'times']" />
              </span>
            </div>
          </div>
        </div>
        <div
          class="bg-light w-100 px-3 text-end border-top group-transition"
          :class="{ 'open-collapse': collapse.includes(item._id) }"
        >
          <button
            v-if="
              item.timing &&
              item.logs.length > 0 &&
              new Date(item.logs[item.logs.length - 1].endAt).getTime() >=
                Date.now()
            "
            class="btn btn-info text-white btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 1000 * 60 * 30, 'extend')"
          >
            延長 30 分鐘
          </button>
          <button
            v-if="
              item.timing &&
              item.logs.length > 0 &&
              new Date(item.logs[item.logs.length - 1].endAt).getTime() >=
                Date.now()
            "
            class="btn btn-info text-white btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 1000 * 60 * 60, 'extend')"
          >
            延長 60 分鐘
          </button>
          <button
            v-if="
              item.timing &&
              (item.logs.length === 0 ||
                new Date(item.logs[item.logs.length - 1].endAt).getTime() <
                  Date.now())
            "
            class="btn btn-teal text-white btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 1000 * 60 * 30, 'unlock')"
          >
            解鎖 30 分鐘
          </button>
          <button
            v-if="
              item.timing &&
              (item.logs.length === 0 ||
                new Date(item.logs[item.logs.length - 1].endAt).getTime() <
                  Date.now())
            "
            class="btn btn-teal text-white btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 1000 * 60 * 60, 'unlock')"
          >
            解鎖 60 分鐘
          </button>
          <button
            v-if="!item.timing"
            class="btn btn-teal text-white btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 0, 'unlock')"
          >
            解鎖
          </button>
          <button
            v-if="
              item.timing &&
              item.logs.length > 0 &&
              new Date(item.logs[item.logs.length - 1].endAt).getTime() >=
                Date.now()
            "
            class="btn btn-danger btn-sm my-2 ms-2"
            @click.prevent.stop="callAction(item, 0, 'stop')"
          >
            停止
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode';
import { mapState } from 'vuex';

export default {
  data: () => ({
    collapse: [],
    reload: false,
  }),
  computed: {
    ...mapState('equipment', ['equipment']),
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      const { exp, memberId } = jwtDecode(token);

      if (exp * 1000 <= Date.now()) {
        this.$toast.error('令牌已過期');
        this.$router.push({ path: '/' });
        return;
      }

      this.$store.commit('SET_LOADING', { status: '設備搜尋中', active: true });

      await this.$store.dispatch('equipment/getEquipment', {
        memberId,
      });

      this.$store.commit('SET_LOADING', { status: '', active: false });
    } catch (error) {
      this.$router.push({ path: '/' });
      this.$toast.error(error.message);
    }
  },
  methods: {
    toggleCollapse(id) {
      const index = this.collapse.findIndex((item) => item === id);

      if (index > -1) {
        this.collapse.splice(index, 1);
      } else {
        this.collapse.push(id);
      }
    },
    async reloadEquipment() {
      this.reload = true;

      const token = localStorage.getItem('token');
      const { memberId } = jwtDecode(token);

      await this.$store.dispatch('equipment/getEquipment', { memberId });

      this.reload = false;
    },
    transformSlotProps(props) {
      const formattedProps = {};

      Object.entries(props).forEach(([key, value]) => {
        formattedProps[key] = value < 10 ? `0${value}` : `${value}`;
      });

      return formattedProps;
    },
    async callAction(item, seconds, action) {
      const token = localStorage.getItem('token');
      const { exp, memberId, soundId } = jwtDecode(token);

      if (exp * 1000 <= Date.now()) {
        this.$toast.error('令牌已過期');
        this.$router.push({ path: '/' });
        return;
      }

      const startAt = Date.now();

      if (action === 'extend') {
        const log = item.logs[item.logs.length - 1];
        const endAt = new Date(log.endAt).getTime() + seconds;

        this.$store.commit('SET_LOADING', {
          status: '日誌更新中',
          active: true,
        });

        await this.$store.dispatch('equipment/updateEquipmentLog', {
          id: item._id,
          logId: log._id,
          endAt,
        });
      }

      if (action === 'stop') {
        const log = item.logs[item.logs.length - 1];
        const endAt = startAt + seconds;

        this.$store.commit('SET_LOADING', {
          status: '日誌更新中',
          active: true,
        });

        await this.$store.dispatch('equipment/updateEquipmentLog', {
          id: item._id,
          logId: log._id,
          endAt,
        });
      }

      if (action === 'unlock') {
        const endAt = startAt + seconds;

        this.$store.commit('SET_LOADING', {
          status: '日誌添加中',
          active: true,
        });

        await this.$store.dispatch('equipment/addEquipmentLog', {
          id: item._id,
          memberId,
          soundId,
          startAt,
          endAt,
        });
      }

      this.$store.commit('SET_LOADING', { status: '設備搜尋中', active: true });

      await this.$store.dispatch('equipment/getEquipment', { memberId });

      this.$store.commit('SET_LOADING', { status: '', active: false });
    },
  },
};
</script>

<style lang="scss" scoped>
.group-transition {
  transition: all 0.3s;
  overflow: hidden;
  max-height: 0px;
}

.open-collapse {
  max-height: 140px;
}
</style>
