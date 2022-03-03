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
import Vue from 'vue';
import { mapState, mapMutations, mapActions } from 'vuex';

import {
  SET_LOGGED_IN,
  SET_PROFILE,
} from '../store/mutation-types';
import api from '../api';
import { TRAKT_AUTH, TRAKT_AUTH_STATE, TRAKT_PROFILE } from '../const';
import { handleFetchError, isDevelopment } from '../utils';

import AppFooter from './AppFooter';
import AppHeader from './AppHeader';
import CurrentlyPlaying from './CurrentlyPlaying';
import FlashMessages from './FlashMessages';
import PlaybackList from './PlaybackList';
import {
  SuiContainer,
  SuiDivider,
} from './sui-vue';

export default Vue.extend({
  name: 'App',
  components: {
    AppFooter,
    AppHeader,
    CurrentlyPlaying,
    FlashMessages,
    PlaybackList,
    SuiContainer,
    SuiDivider,
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
  },
  async mounted() {
    const params = new URLSearchParams(window.location.search);

    try {
      let fetch = false;
      if (await this.loadAuth()) {
        console.log('Loaded from localStorage');
        fetch = true;
      } else if (params.get('code')) {
        api._authentication.state = window.localStorage.getItem(TRAKT_AUTH_STATE) || undefined;
        fetch = await this.exchangeCode(params.get('code'), params.get('state'));
        window.history.replaceState({}, '', window.location.pathname);
      }

      let storedProfile = {};
      try {
        storedProfile = JSON.parse(window.localStorage.getItem(TRAKT_PROFILE));
      } catch (_) {}

      if (storedProfile.username) {
        this.setProfile(storedProfile);
      }

      if (fetch && !storedProfile) {
        await this.fetchProfile();
      }
    } catch (error) {
      const fetchError = handleFetchError(error);
      if (fetchError) {
        console.warn(error);
        this.flash(['[mounted] Request Failed', fetchError, 'warning', true]);
      } else {
        console.error(error);
        this.flash(['Error in mounted()', String(error), 'error', true]);
        if (isDevelopment) {
          debugger;
        }
      }
    } finally {
      this.loggingIn = false;
      this.ready = true;
    }
  },
  methods: {
    ...mapMutations({
      setLoggedIn: SET_LOGGED_IN,
      setProfile: SET_PROFILE,
    }),
    ...mapActions([
      'flash',
      'fetchProfile',
    ]),
    async loadAuth() {
      // Load from localStorage
      const stored = window.localStorage.getItem(TRAKT_AUTH);
      if (!stored) {
        return false;
      }

      try {
        const data = JSON.parse(stored);
        const authData = await api.import_token(data);
        this.setLoggedIn(true);
        if (authData.access_token !== data.access_token) {
          this.saveAuth(authData);
          this.setProfile({}); // Force-refresh profile
        }

        return true;
      } catch (error) {
        const fetchError = handleFetchError(error);
        if (fetchError) {
          console.warn(error);
          this.flash(['[loadAuth] Request Failed', fetchError, 'warning', true]);
        } else {
          console.error(error);
          this.flash(['Error in loadAuth()', String(error), 'error', true]);
          if (isDevelopment) {
            debugger;
          }
        }
      }

      return false;
    },
    saveAuth(data) {
      // Save to localStorage
      data = data ? data : api.export_token();
      if (data.access_token && data.refresh_token && data.expires) {
        try {
          window.localStorage.setItem(TRAKT_AUTH, JSON.stringify(data));
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
        window.localStorage.removeItem(TRAKT_AUTH_STATE);
        this.saveAuth();
        return true;
      } catch (error) {
        const fetchError = handleFetchError(error);
        if (fetchError) {
          console.warn(error);
          this.flash(['[exchangeCode] Request Failed', fetchError, 'warning', true]);
        } else {
          console.error(error);
          this.flash(['Error in exchangeCode()', String(error), 'error', true]);
          if (isDevelopment) {
            debugger;
          }
        }

        return false;
      }
    },
  },
});
</script>

<style>
  #app {
    padding-top: 25px;
  }
</style>
