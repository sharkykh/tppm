export const isDevelopment = process.env.NODE_ENV === 'development';

export const generateTraktUrl = dataObj => {
  const { type } = dataObj;
  if (!type) {
    return null;
  }

  let baseUrl = 'https://trakt.tv';

  if (type === 'episode') {
    const showSlug = dataObj.show.ids.slug;
    const { season, number } = dataObj.episode;
    if (showSlug && season && number) {
      return `${baseUrl}/shows/${showSlug}/seasons/${season}/episodes/${number}`;
    }
  } else if (['show', 'movie'].includes(type)) {
    const slug = dataObj[type].ids.slug;
    if (slug) {
      return `${baseUrl}/${type}s/${slug}`;
    }
  }

  // Fallback
  const id = dataObj[type].ids.trakt;
  return `https://trakt.tv/search/trakt/${id}?id_type=${type}`;
};
