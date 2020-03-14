import App from './components/App';
import store from './store';
import { isDevelopment } from './utils';

import Vue from 'vue';

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
