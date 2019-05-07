// Root actions

import {
  MESSAGE_ADD,
  MESSAGE_REMOVE,
} from './mutation-types';

export const flash = ({ commit }, [header, content, type, persist = false]) => {
  const msg = {
    header,
    content,
    type,
    persist,
  };
  commit(MESSAGE_ADD, msg);
  if (!persist) {
    setTimeout(commit, 3000, MESSAGE_REMOVE, msg);
  }
};

export const dismissFlash = ({ commit }, msg) => {
  commit(MESSAGE_REMOVE, msg);
};
