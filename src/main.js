import Vue from 'vue';
import SuiVue from 'semantic-ui-vue';
import 'semantic-ui-css/semantic.min.css';

import './main.css';
import App from './components/app.vue';
import { isDevelopment } from './utils.js';

if (isDevelopment) {
  Vue.config.productionTip = false;
  Vue.config.devtools = true;
}

Vue.use(SuiVue);

const app = new Vue({
  el: '#app',
  render: h => h(App),
});

if (isDevelopment) {
  window.app = app;
}
