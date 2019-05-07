// Root mutations

import {
  SET_BUSY,
} from './mutation-types';

export default {
  [SET_BUSY](state, payload) {
    state.busy = payload;
  },
};
