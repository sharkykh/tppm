// Root getters

export const removingAnything = state => {
  return Object.keys(state.removing).length > 0;
};
