<template>
  <sui-header
    id="app-header"
    block
  >
    <sui-image
      id="app-logo"
      :src="logo"
      size="massive"
      alt="Logo"
    />
    <sui-label
      size="mini"
      color="red"
      circular
      class="beta"
    >
      Beta
    </sui-label>
    <br>
    <sui-header-content>
      Trakt.tv Playback Progress Manager
    </sui-header-content>
    <br>

    <sui-divider />

    <sui-loader
      v-if="!ready"
      active
      centered
      inline
    />
    <sui-header-content v-else>
      <sui-button
        v-if="!loggedIn"
        content="Connect"
        icon="power"
        :loading="loggingIn"
        :positive="!loggingIn"
        @click="requestAuth()"
      />
      <sui-button
        v-else
        content="Disconnect"
        icon="power"
        negative
        @click="revokeAuth()"
      />

      <a
        is="sui-label"
        v-if="user"
        size="big"
        :href="user.profile"
      >
        <sui-icon
          name="user"
          size="small"
        />
        {{ user.fullName }}
      </a>

      <sui-button
        v-if="loggedIn && !user"
        content="Fetch Profile"
        @click="fetchProfile()"
      />

      <sui-divider
        v-if="loggedIn"
        hidden
      />

      <sui-button
        v-if="loggedIn"
        :content="firstLoad ? 'Refresh' : 'Fetch'"
        :icon="firstLoad ? 'sync alternate' : 'cloud download'"
        :loading="busy"
        :disabled="busy"
        positive
        @click="fetchInfo()"
      />

      <sui-button
        v-if="loggedIn"
        negative
        icon="trash"
        content="Remove All"
        :disabled="busy || playback.length === 0 || removingAnything"
        :loading="busy || removingAnything"
        @click="removeAllPlaybacks()"
      />

      <debug v-if="isDevelopment && loggedIn" />

      <div class="notice">
        This site does not store any of your Trakt information.
      </div>
    </sui-header-content>
  </sui-header>
</template>

<script>
import Vue from 'vue';
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';

import {
  SET_BUSY,
  SET_LOGGED_IN,
} from '../store/mutation-types';
import api from '../api';
import AppLogo from '../assets/tppm.svg';
import { handleFetchError, isDevelopment } from '../utils';

import {
  SuiButton,
  SuiDivider,
  SuiHeader,
  SuiHeaderContent,
  SuiIcon,
  SuiImage,
  SuiLabel,
  SuiLoader,
} from './sui-vue';

let debugComponent;
// Can't use `isDevelopment` directly because webpack doesn't recognize it.
if (process.env.NODE_ENV === 'development') {
  debugComponent = { Debug: () => import(/* webpackChunkName: 'debug' */ './Debug') };
}

export default Vue.extend({
  name: 'AppHeader',
  components: {
    ...debugComponent,
    SuiButton,
    SuiDivider,
    SuiHeader,
    SuiHeaderContent,
    SuiIcon,
    SuiImage,
    SuiLabel,
    SuiLoader,
  },
  props: {
    ready: Boolean,
    loggingIn: Boolean,
  },
  data() {
    return {
      isDevelopment,
      logo: AppLogo,
    };
  },
  computed: {
    ...mapState([
      'busy',
      'loggedIn',
      'profile',
      'firstLoad',
      'playback',
    ]),
    ...mapGetters([
      'removingAnything',
    ]),
    user() {
      if (!this.loggedIn) {
        return undefined;
      }

      const { username, name, ids } = this.profile;
      if (!username) {
        return undefined;
      }

      const fullName = ['', username].includes(name) ? username : `${name} (${username})`;
      const profile = ids.slug && `https://trakt.tv/users/${ids.slug}`;

      return {
        fullName,
        profile,
      };
    },
  },
  methods: {
    ...mapMutations({
      setBusy: SET_BUSY,
      setLoggedIn: SET_LOGGED_IN,
    }),
    ...mapActions([
      'flash',
      'fetchProfile',
      'fetchCurrentlyPlaying',
      'fetchPlaybackProgress',
      'removeAllPlaybacks',
    ]),
    requestAuth() {
      // Generate the URL first, so we can save the CSRF state value
      const url = api.get_url();
      window.localStorage.setItem('traktAuthState', api._authentication.state);
      window.location.replace(url);
    },
    async revokeAuth() {
      window.localStorage.removeItem('traktAuth');
      try {
        await api.revoke_token();
      } catch (error) {
        const fetchError = handleFetchError(error);
        if (fetchError) {
          console.warn(error);
          this.flash(['[revokeAuth] Request Failed', fetchError, 'warning', true]);
        } else {
          console.error(error);
          this.flash(['Error in revokeAuth()', String(error), 'error', true]);
          if (isDevelopment) {
            debugger;
          }
        }
      }

      this.setLoggedIn(false);
    },
    async fetchInfo() {
      this.setBusy(true);
      await this.fetchPlaybackProgress();
      await this.fetchCurrentlyPlaying();
      this.setBusy(false);
    },
  },
});
</script>

<style scoped>
  #app-header {
    font-size: 1.5em;
  }
  #app-logo {
    margin-bottom: 0.5rem;
  }
  .ui.label.beta {
    position: absolute;
    margin: 0 0 0 -0.5rem;
  }
  .notice {
    font-size: 0.6em;
  }
</style>
