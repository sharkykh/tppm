import Vue from 'vue';

import './main.css'
import App from './components/app.vue';

if (process.env.NODE_ENV !== 'production') {
  Vue.config.productionTip = false;
  Vue.config.devtools = true;
}

new Vue({
  el: '#app',
  render: h => h(App)
});
