// Root getters

import Fuse from 'fuse.js';

export const filteredPlayback = state => {
  if (!state.query) {
    return state.playback;
  }

  const options = {
    keys: ['episode', 'show', 'movie'].map(type => `${type}.title`),
    minMatchCharLength: 1,
    shouldSort: true,
  };
  const fuse = new Fuse(state.playback, options);
  return fuse.search(state.query);
};

export const removingAnything = state => {
  return Object.keys(state.removing).length > 0;
};
