import Vue from 'vue';

import { App } from './components';
import store from './store';
import { isDevelopment } from './utils';

if (isDevelopment) {
  Vue.config.productionTip = false;
  Vue.config.devtools = true;
}

const app = new Vue({
  el: '#app',
  store,
  render: h => h(App),
});

if (isDevelopment) {
  window.app = app;
}
