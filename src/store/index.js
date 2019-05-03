import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import * as actions from './actions';
import * as mutations from './mutations';

Vue.use(Vuex);

const state = {
  busy: false,
};

const getters = {};

const store = new Store({
  strict: true,
  state,
  mutations,
  actions,
  getters,
});

if (module.hot) {
  module.hot.accept([
    './actions',
    './mutations',
  ], () => {
    store.hotUpdate({
      actions: require('./actions'),
      mutations: require('./mutations'),
    });
  });
}

export default store;
