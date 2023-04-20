import { HTTPError, TimeoutError } from 'ky';
import { getReasonPhrase } from 'http-status-codes';

export const isDevelopment = process.env.NODE_ENV === 'development';

// eslint-disable-next-line no-promise-executor-return
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export const generateTraktUrl = dataObj => {
  const { type } = dataObj;
  if (!type) {
    return null;
  }

  const baseUrl = 'https://trakt.tv';

  if (type === 'episode') {
    const showSlug = dataObj.show.ids.slug;
    const { season, number } = dataObj.episode;
    if (showSlug && season && number) {
      return `${baseUrl}/shows/${showSlug}/seasons/${season}/episodes/${number}`;
    }
  } else if (['show', 'movie'].includes(type)) {
    const { slug } = dataObj[type].ids;
    if (slug) {
      return `${baseUrl}/${type}s/${slug}`;
    }
  }

  // Fallback
  const id = dataObj[type].ids.trakt;
  return `https://trakt.tv/search/trakt/${id}?id_type=${type}`;
};

export const handleFetchError = error => {
  if (error instanceof HTTPError) {
    try {
      return getReasonPhrase(error.response.status);
    } catch (error) {
      return `Response: ${error.response.status} ${error.response.statusText}`;
    }
  }

  if (error instanceof TimeoutError) {
    return 'Response timed-out';
  }

  return undefined;
};
