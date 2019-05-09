// Root getters

export const filteredPlayback = state => {
  return state.playback.filter(item => {
    const titles = ['episode', 'show', 'movie'].map(type => item[type]?.title).filter(Boolean);
    return titles.some(title => {
      return title.toLowerCase().includes(state.query);
    });
  });
};

export const removingAnything = state => {
  return Object.keys(state.removing).length > 0;
};
