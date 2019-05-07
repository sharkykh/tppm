import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);

const state = {
  busy: false,
  messages: [],
  playing: false,
  firstLoad: false,
  playback: [],
  removing: {},
};

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
    './getters',
    './mutations',
  ], () => {
    store.hotUpdate({
      actions: require('./actions'),
      getters: require('./getters'),
      mutations: require('./mutations'),
    });
  });
}

export default store;
