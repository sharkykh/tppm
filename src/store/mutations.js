// Root mutations

import {
  SET_BUSY,
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  SET_PLAYING,
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
  [SET_PLAYING](state, payload) {
    state.playing = payload;
  },
};
