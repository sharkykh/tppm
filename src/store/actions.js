// Root actions

import api from '../api';

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
  } catch (error) {
    if (error.response.code === 403) {
      // Invalid token
      dispatch('flash', ['Invalid token', 'Token is invalid, please reconnect the app to your account.', 'warning', false]);
      commit(SET_LOGGED_IN, false);
      commit(SET_PROFILE, {});
      window.localStorage.removeItem('traktAuth');
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
    console.error(error);
    dispatch('flash', ['Error in fetchCurrentlyPlaying()', String(error), 'error', true]);
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
    console.error(error);
    dispatch('flash', ['Error in fetchPlaybackProgress()', String(error), 'error', true]);
  }
};

export const removePlayback = async ({ commit, dispatch }, { id, notify = true }) => {
  commit(SET_REMOVING, id);
  try {
    await api.sync.playback.remove({ id });
    commit(REMOVE_PLAYBACK, id);
    if (notify) {
      dispatch('flash', ['Playback item removed', '', 'success']);
    }
  } catch (error) {
    console.error(error);
    dispatch('flash', ['Error in removePlayback()', String(error), 'error', true]);

    return false;
  } finally {
    commit(UNSET_REMOVING, id);
  }

  return true;
};

export const removeAllPlaybacks = async ({ commit, dispatch, state }) => {
  let result = true;
  commit(SET_REMOVING, 'all');

  const ids = state.playback.map(item => item.id);
  while (ids.length > 0) {
    const chunk = ids.splice(0, 3);

    // eslint-disable-next-line no-await-in-loop
    const chunkResults = await Promise.all(
      chunk.map(id => dispatch('removePlayback', { id, notify: false }))
    );
    result &= chunkResults.every(Boolean);
  }

  if (result) {
    dispatch('flash', ['All playback items removed', '', 'success']);
  } else {
    dispatch('flash', ['Some playback items failed to remove', '', 'warning']);
  }

  commit(UNSET_REMOVING, 'all');
};
