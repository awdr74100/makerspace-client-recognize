import Vue from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faProjectDiagram,
  faAssistiveListeningSystems,
  faAngleDoubleRight,
  faCheck,
  faTimes,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';

library.add([
  faProjectDiagram,
  faAssistiveListeningSystems,
  faAngleDoubleRight,
  faCheck,
  faTimes,
  faSyncAlt,
]);

library.add([faClock]);

Vue.component('FontAwesomeIcon', FontAwesomeIcon);
