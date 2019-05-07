// Root actions

import api from '../api';

import {
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  SET_PLAYING,
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

export const fetchCurrentlyPlaying = async ({ commit, dispatch }) => {
  try {
    const data = await api.users.watching({ username: 'me' });
    commit(SET_PLAYING, data || false);
  } catch (error) {
    console.error(error);
    dispatch('flash', ['Error in fetchCurrentlyPlaying()', String(error), 'error', true]);
  }
};
