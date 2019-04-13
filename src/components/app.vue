<template>
  <div>
    <h1>Trakt Playback Progress Manager</h1>

    <button @click="requestAuth()" :disabled="loggedIn">Auth</button>
    <br>
    <button @click="fetchSettings()" :disabled="!loggedIn">Fetch Settings</button>
    <br>
    <button @click="fetchPlaybackProgress()" :disabled="!loggedIn">Fetch Playback Progress</button>
    <br>

    <p v-if="fullName">Logged in as: {{ fullName }}</p>
    <br>

    <select size="15" multiple>
      <option v-for="(item, $index) in playback" :key="item.id">
        {{ ($index + 1) | zeroPad(3) }}.
        <template v-if="item.type === 'episode'">
          {{ item.show.title }}:
          S{{ item.episode.season | zeroPad(2) }}E{{ item.episode.number | zeroPad(2) }}
          ({{ item.episode.title }})
        </template>
        <template v-else-if="item.type === 'movie'">
          {{ item.movie.title }} ({{ item.movie.year }})
        </template>
        [{{ item.progress.toFixed(0) }}%]
      </option>
    </select>
  </div>
</template>

<script>
import Trakt from 'trakt.tv';

import { isDevelopment } from '../utils.js';

const options = {
  client_id: '907c2fe5ff19a529456c0058d2c96f6913f62b55fc6e9a86605f05a0c4e2fec7',
  client_secret: '0b70b2072730e0e2ab845f8f89fbfa4a808f47e10678365cb746f4b81fbb56a3',
  redirect_uri: isDevelopment ? 'http://localhost:8080/' : 'https://sharkykh.github.io/tppm/',
  useragent: `tppm/${__VERSION__}`,
  pagination: false, // defaults to false, global pagination
  debug: isDevelopment,
};

export default {
  name: 'App',
  data() {
    return {
      api: null,
      loggedIn: false,
      settings: {},
      playback: {},
      auth: {}
    };
  },
  mounted() {
    this.api = new Trakt(options);
    if (this.params.code) {
      this.api._authentication.state = window.localStorage.getItem('traktAuthState') || undefined;
      this.exchangeCode(this.params.code, this.params.state);
      window.history.replaceState({}, '', window.location.pathname);
    }
  },
  computed: {
    params() {
      const { search } = window.location;
      return search.slice(1).split('&').reduce((obj, pair) => {
        if (!pair) return obj;
        const [key, value] = pair.split('=');
        obj[key] = value;
        return obj;
      }, {});
    },
    fullName() {
      const { user } = this.settings;
      if (!user) return undefined;
      const { username, name } = user;
      return ['', username].includes(name) ? username : `${username} (${name})`;
    },
  },
  filters: {
    zeroPad(number, length) {
      return number.toString().padStart(length, '0');
    }
  },
  methods: {
    requestAuth() {
      window.location.replace(this.api.get_url());
      window.localStorage.setItem('traktAuthState', this.api._authentication.state);
    },
    loadAuth() {
      // Load from localStorage
      // TODO: Do
    },
    saveAuth() {
      // Save to localStorage
      // TODO: Do
    },
    async exchangeCode(code, state) {
      try {
        this.auth = await this.api.exchange_code(code, state);
        this.loggedIn = true;
        window.localStorage.removeItem('traktAuthState');
      } catch (error) {
        console.error(error);
        if (isDevelopment) debugger;
      }
    },
    async fetchSettings() {
      try {
        this.settings = await this.api.users.settings();
      } catch (error) {
        console.error(error);
        if (isDevelopment) debugger;
      }
    },
    async fetchPlaybackProgress() {
      try {
        this.playback = await this.api.sync.playback.get();
      } catch (error) {
        console.error(error);
        if (isDevelopment) debugger;
      }
    }
  }
};
</script>

<style scoped>
  div {
    text-align: center;
  }

  select {
    width: 500px;
  }
</style>