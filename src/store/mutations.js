// Root mutations

import { del, set } from 'vue';

import {
  SET_BUSY,
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  SET_LOGGED_IN,
  SET_PROFILE,
  SET_PLAYING,
  SET_FIRST_LOAD,
  SET_PLAYBACK,
  REMOVE_PLAYBACK,
  SET_REMOVING,
  UNSET_REMOVING,
  RESET,
} from './mutation-types';

export default {
  [SET_BUSY](state, payload) {
    state.busy = payload;
  },
  [MESSAGE_ADD](state, msg) {
    state.messages.unshift(msg);
  },
  [MESSAGE_REMOVE](state, msg) {
    const index = state.messages.findIndex(item => item === msg);
    state.messages.splice(index, 1);
  },
  [SET_LOGGED_IN](state, payload) {
    state.loggedIn = payload;
  },
  [SET_PROFILE](state, payload) {
    Object.entries(payload).forEach(entry => {
      const [key, value] = entry;
      set(state.profile, key, value);
    });
  },
  [SET_PLAYING](state, payload) {
    state.playing = payload;
  },
  [SET_FIRST_LOAD](state, payload) {
    state.firstLoad = payload;
  },
  [SET_PLAYBACK](state, payload) {
    state.playback = payload;
  },
  [REMOVE_PLAYBACK](state, id) {
    const index = state.playback.findIndex(item => item.id === id);
    del(state.playback, index);
  },
  [SET_REMOVING](state, payload) {
    set(state.removing, payload, null);
  },
  [UNSET_REMOVING](state, payload) {
    del(state.removing, payload);
  },
  [RESET](state) {
    state.loggedIn = false;
    state.profile = {};
    state.playing = false;
    state.firstLoad = false;
    state.playback = [];
    state.removing = {};
  },
};
