// Root actions

import api from '../api';
import { TRAKT_AUTH, TRAKT_PROFILE } from '../const';
import { handleFetchError, wait } from '../utils';

import {
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
} from './mutation-types';

export const flash = ({ commit, state }, [header, content, type, persist = false]) => {
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

  while (state.messages.length > 5) {
    const [oldestMessage] = state.messages.slice(-1);
    commit(MESSAGE_REMOVE, oldestMessage);
  }
};

export const dismissFlash = ({ commit }, msg) => {
  commit(MESSAGE_REMOVE, msg);
};

export const fetchProfile = async ({ commit, dispatch }) => {
  try {
    const data = await api.users.profile({ username: 'me' });
    commit(SET_PROFILE, data);
    window.localStorage.setItem(TRAKT_PROFILE, JSON.stringify(data));
  } catch (error) {
    const status = error?.response?.code;
    if (status === 403) {
      // Invalid token
      dispatch('flash', ['Invalid token', 'Token is invalid, please reconnect the app to your account.', 'warning', false]);
      commit(SET_LOGGED_IN, false);
      commit(SET_PROFILE, {});
      window.localStorage.removeItem(TRAKT_AUTH);
      window.localStorage.removeItem(TRAKT_PROFILE);
      return;
    }

    const fetchError = handleFetchError(error);
    if (fetchError) {
      console.warn(error);
      dispatch('flash', ['[fetchProfile] Request Failed', fetchError, 'warning', true]);
    } else {
      console.error(error);
      dispatch('flash', ['Error in fetchProfile()', String(error), 'error', true]);
    }
  }
};

export const fetchCurrentlyPlaying = async ({ commit, dispatch }) => {
  try {
    const data = await api.users.watching({ username: 'me' });
    commit(SET_PLAYING, data || false);
  } catch (error) {
    const fetchError = handleFetchError(error);
    if (fetchError) {
      console.warn(error);
      dispatch('flash', ['[fetchCurrentlyPlaying] Request Failed', fetchError, 'warning', true]);
    } else {
      console.error(error);
      dispatch('flash', ['Error in fetchCurrentlyPlaying()', String(error), 'error', true]);
    }
  }
};

export const fetchPlaybackProgress = async ({ commit, dispatch, state }) => {
  try {
    const playback = await api.sync.playback.get();
    commit(SET_PLAYBACK, playback);
    if (!state.firstLoad) {
      commit(SET_FIRST_LOAD, true);
    }
  } catch (error) {
    const fetchError = handleFetchError(error);
    if (fetchError) {
      console.warn(error);
      dispatch(['flash', '[fetchPlaybackProgress] Request Failed', fetchError, 'warning', true]);
    } else {
      console.error(error);
      dispatch('flash', ['Error in fetchPlaybackProgress()', String(error), 'error', true]);
    }
  }
};

/**
 * @param {number} id playback id
 * @returns {Promise<null | string | Error>}
 */
const callRemovePlayback = async id => {
  try {
    await api.sync.playback.remove({ id });
  } catch (error) {
    const fetchError = handleFetchError(error);
    if (fetchError) {
      console.warn(error);
      return `Request failed: ${fetchError}`;
    }

    console.error(error);
    return error;
  }

  return null;
};

export const removePlayback = async ({ commit, dispatch }, id) => {
  commit(SET_REMOVING, id);
  const error = await callRemovePlayback(id);

  if (error === null) {
    commit(REMOVE_PLAYBACK, id);
    dispatch('flash', ['Playback item removed', '', 'success']);
  } else if (typeof error === 'string') {
    dispatch('flash', [`Failed to remove playback ${id}`, error, 'warning']);
  } else {
    dispatch('flash', [`Error removing playback ${id}`, String(error), 'error', true]);
  }

  commit(UNSET_REMOVING, id);
  return error === null;
};

export const removeAllPlaybacks = async ({ commit, dispatch, state }) => {
  let result = true;
  commit(SET_REMOVING, 'all');

  const ids = state.playback.map(item => item.id);
  while (ids.length > 0) {
    const id = ids.shift();

    /* eslint-disable no-await-in-loop */
    const error = await callRemovePlayback(id);
    if (error === null) {
      commit(REMOVE_PLAYBACK, id);
    }

    result &= error === null;
    await wait(1050);
    /* eslint-enable no-await-in-loop */
  }

  if (result) {
    dispatch('flash', ['All playback items removed', '', 'success']);
  } else {
    dispatch('flash', ['Some playback items failed to remove', '', 'warning']);
  }

  commit(UNSET_REMOVING, 'all');
};
