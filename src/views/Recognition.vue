<template>
  <div class="container-fluid px-0">
    <div class="d-flex flex-column align-items-center justify-content-center">
      <div class="p-3 w-100">
        <select v-model="deviceId" class="form-select">
          <option value="" disabled>-- Select Camera --</option>
          <option
            v-for="camera in cameras"
            :key="camera.deviceId"
            :value="camera.deviceId"
          >
            {{ camera.label }}
          </option>
        </select>
      </div>
      <div v-if="errorMessage" class="p-3 text-danger">{{ errorMessage }}</div>
      <div
        class="
          overlay
          position-relative
          mx-3
          d-flex
          align-items-center
          justify-content-center
        "
      >
        <vue-web-cam
          ref="webcam"
          class="webcam position-relative"
          width="100%"
          height="100%"
          :device-id="deviceId"
          @cameras="onCameras"
          @camera-change="onCameraChange"
          @error="onError"
          @notsupported="onError"
          @video-live="onVideoLive"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from '@vladmandic/face-api';
import { mapState } from 'vuex';

export default {
  beforeRouteEnter(to, from, next) {
    const { path, hash } = to;
    if (hash && hash[0] === '#') return next(`${path}?${hash.substring(1)}`);
    return next();
  },
  data: () => ({
    deviceId: '',
    cameras: [],
    errorMessage: '',
    loadedModels: false,
    checkValue: 0,
  }),
  computed: {
    ...mapState('oauth', ['user']),
    ...mapState('member', ['member']),
  },
  watch: {
    async checkValue(val) {
      if (val < 2) return;
      await this.$store.dispatch('member/getToken', {
        memberId: this.member.id,
        oauthId: this.user.id,
        soundId: this.member.sound,
      });
      this.$router.push({ path: '/equipment' });
    },
  },
  methods: {
    onCameras(cameras) {
      this.cameras = cameras;
      this.deviceId = cameras[0].deviceId;
    },
    onCameraChange() {
      this.$store.commit('SET_LOADING', { status: '相機啟動中', active: true });
    },
    onError(error) {
      this.errorMessage = error;
      this.$store.commit('SET_LOADING', { status: '', active: false });
    },
    async onVideoLive() {
      if (!this.user.id) {
        this.$store.commit('SET_LOADING', {
          status: '身分確認中',
          active: true,
        });

        const { access_token: accessToken } = this.$route.query;

        await this.$store.dispatch('oauth/getUserInfo', { accessToken });

        await this.$store.dispatch('member/getMember', { id: this.user.id });
      }

      if (!this.loadedModels) await this.loadModels();

      const webcam = document.querySelector('.webcam');
      const canvas = document.querySelector('.canvas');
      const overlay = document.querySelector('.overlay');

      const createCanvas = faceapi.createCanvasFromMedia(webcam);

      createCanvas.classList.add('canvas', 'position-absolute');
      const createCanvasSize = {
        width: webcam.clientWidth,
        height: webcam.clientHeight,
      };

      faceapi.matchDimensions(createCanvas, createCanvasSize);

      if (canvas) overlay.removeChild(canvas);
      overlay.appendChild(createCanvas);

      this.$store.commit('SET_LOADING', { status: '', active: false });

      const label = new faceapi.LabeledFaceDescriptors(
        this.member.name,
        this.member.features,
      );
      const labels = [label];

      if (!this.member.features.length) return;

      this.faceRecognition(webcam, createCanvas, createCanvasSize, labels, 500);
    },
    async loadModels() {
      this.$store.commit('SET_LOADING', { status: '模型載入中', active: true });

      await Promise.all([
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);

      this.loadedModels = true;
    },
    faceRecognition(webcam, createCanvas, createCanvasSize, labels, ms) {
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(webcam, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        const resizeDetections = faceapi.resizeResults(
          detections,
          createCanvasSize,
        );

        createCanvas
          .getContext('2d')
          .clearRect(0, 0, createCanvasSize.width, createCanvasSize.height);

        const distanceArray = [];
        const distanceThreshold = 0.32;

        const faceMatcher = new faceapi.FaceMatcher(labels, distanceThreshold);

        const results = resizeDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor),
        );

        results.forEach((result, index) => {
          const { box } = resizeDetections[index].detection;
          const { label, distance } = result;

          if (label === this.member.name && this.checkValue < 2) {
            this.checkValue += 1;
          }

          distanceArray[index] = distance;

          new faceapi.draw.DrawTextField(
            [`${label} (${parseInt(distance * 100, 10)})`],
            box.bottomRight,
            {
              backgroundColor:
                distance < distanceThreshold ? '#20c997' : '#6c757d',
            },
          ).draw(createCanvas);
        });

        resizeDetections.forEach((detection, index) => {
          new faceapi.draw.DrawBox(
            {
              x: detection.detection.box.x,
              y: detection.detection.box.y,
              width: detection.detection.box.width,
              height: detection.detection.box.height,
            },
            {
              boxColor:
                (distanceArray[index] || 1) < distanceThreshold
                  ? '#20c997'
                  : '#6c757d',
            },
          ).draw(createCanvas);
        });
      }, ms);
    },
  },
};
</script>
