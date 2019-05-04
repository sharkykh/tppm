import Vue from 'vue';
import SuiVue from 'semantic-ui-vue';
import 'semantic-ui-css/semantic.min.css';

import App from './components/App';
import { isDevelopment } from './utils';

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
