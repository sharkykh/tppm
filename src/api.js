import Trakt from 'trakt.tv-browser';

import { isDevelopment } from './utils';

// eslint-disable-next-line no-undef
const isLocal = Boolean(__LOCAL__);

/* eslint-disable camelcase */
const api = new Trakt({
  client_id: '907c2fe5ff19a529456c0058d2c96f6913f62b55fc6e9a86605f05a0c4e2fec7',
  client_secret: '0b70b2072730e0e2ab845f8f89fbfa4a808f47e10678365cb746f4b81fbb56a3',
  redirect_uri: (isLocal || isDevelopment) ? 'http://localhost:8080/' : 'https://sharkykh.github.io/tppm/',
  timeout: 30000,
  useragent: `tppm/${__VERSION__}`,
  pagination: false, // Defaults to false, global pagination
  debug: isDevelopment,
});
/* eslint-enable camelcase */

if (isDevelopment) {
  window.api = api;
}

export default api;
