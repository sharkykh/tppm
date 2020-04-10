import Vue from 'vue';

import App from './components/App';
import store from './store';
import { isDevelopment } from './utils';

if (isDevelopment) {
  Vue.config.productionTip = false;
  Vue.config.devtools = true;
}

const app = new App({
  el: '#app',
  store,
});

if (isDevelopment) {
  window.app = app;
}
