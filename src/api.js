import Trakt from 'trakt.tv';

import { isDevelopment } from './utils.js';

const api = new Trakt({
  client_id: '907c2fe5ff19a529456c0058d2c96f6913f62b55fc6e9a86605f05a0c4e2fec7',
  client_secret: '0b70b2072730e0e2ab845f8f89fbfa4a808f47e10678365cb746f4b81fbb56a3',
  redirect_uri: isDevelopment ? 'http://localhost:8080/' : 'https://sharkykh.github.io/tppm/',
  useragent: `tppm/${__VERSION__}`,
  pagination: false, // defaults to false, global pagination
  debug: isDevelopment,
});

if (isDevelopment) {
  window.api = api;
}

export default api;
