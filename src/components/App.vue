<template>
  <div
    is="sui-container"
    id="app"
    text-align="center"
  >
    <app-header v-bind="{ ready, loggingIn }" />

    <sui-divider hidden />

    <flash-messages />

    <template v-if="playing && !busy">
      <currently-playing />
      <sui-divider hidden />
    </template>

    <playback-list />

    <sui-divider />

    <app-footer />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';

import {
  SET_LOGGED_IN,
} from '../store/mutation-types';
import api from '../api';
import { isDevelopment } from '../utils';

import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import CurrentlyPlaying from './CurrentlyPlaying';
import FlashMessages from './FlashMessages';
import PlaybackList from './PlaybackList';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    CurrentlyPlaying,
    FlashMessages,
    PlaybackList,
  },
  data() {
    return {
      ready: false,
      loggingIn: true,
    };
  },
  computed: {
    ...mapState([
      'busy',
      'playing',
    ]),
    params() {
      const { search } = window.location;
      return search.slice(1).split('&').reduce((obj, pair) => {
        if (!pair) {
          return obj;
        }

        const [key, value] = pair.split('=');
        obj[key] = value;
        return obj;
      }, {});
    },
  },
  async mounted() {
    try {
      let fetch = false;
      if (await this.loadAuth()) {
        console.log('Loaded from localStorage');
        fetch = true;
      } else if (this.params.code) {
        api._authentication.state = window.localStorage.getItem('traktAuthState') || undefined;
        await this.exchangeCode(this.params.code, this.params.state);
        window.history.replaceState({}, '', window.location.pathname);
        fetch = true;
      }

      if (fetch) {
        await this.fetchProfile();
      }
    } catch (error) {
      console.error(error);
      this.flash(['Error in mounted()', String(error), 'error', true]);
      if (isDevelopment) {
        debugger;
      }
    } finally {
      this.loggingIn = false;
      this.ready = true;
    }
  },
  methods: {
    ...mapMutations({
      setLoggedIn: SET_LOGGED_IN,
    }),
    ...mapActions([
      'flash',
      'fetchProfile',
    ]),
    async loadAuth() {
      // Load from localStorage
      const stored = window.localStorage.getItem('traktAuth');
      if (!stored) {
        return false;
      }

      try {
        const data = JSON.parse(stored);
        await api.import_token(data);
        this.setLoggedIn(true);
        return true;
      } catch (error) {
        console.error(error);
        this.flash(['Error in loadAuth()', String(error), 'error', true]);
        if (isDevelopment) {
          debugger;
        }
      }

      return false;
    },
    saveAuth() {
      // Save to localStorage
      const data = api.export_token();
      if (data.access_token && data.refresh_token && data.expires) {
        try {
          window.localStorage.setItem('traktAuth', JSON.stringify(data));
          return true;
        } catch (error) {
          console.error(error);
          this.flash(['Error in saveAuth()', String(error), 'error', true]);
          if (isDevelopment) {
            debugger;
          }
        }
      }

      return false;
    },
    async exchangeCode(code, state) {
      try {
        await api.exchange_code(code, state);
        this.setLoggedIn(true);
        window.localStorage.removeItem('traktAuthState');
        this.saveAuth();
      } catch (error) {
        console.error(error);
        this.flash(['Error in exchangeCode()', String(error), 'error', true]);
        if (isDevelopment) {
          debugger;
        }
      }
    },
  },
};
</script>

<style scoped>
  #app {
    padding-top: 25px;
  }
</style>
