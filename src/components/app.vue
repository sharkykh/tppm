<template>
  <div is="sui-container" text-align="center">

    <sui-header block id="app-header">
      <sui-image :src="logo" size="massive" />
      <br>
      <sui-header-content>
        Trakt.tv Playback Progress Manager
        <sui-label size="mini" color="red" circular>
          Beta
        </sui-label>
      </sui-header-content>
      <br>

      <sui-divider />

      <sui-loader v-if="!initialized" active centered inline />
      <sui-header-content v-else>
        <sui-button
          v-if="!loggedIn"
          content="Connect"
          icon="power"
          :loading="loggingIn"
          :positive="!loggingIn"
          @click="requestAuth()"
        />
        <template v-else>
          <sui-button
            content="Disconnect"
            icon="power"
            negative
            @click="revokeAuth()"
          />
        </template>

        <a is="sui-label" v-if="user" size="big" :href="user.profile">
          <sui-image v-if="user.avatar" avatar spaced="right" :src="user.avatar" />
          <sui-icon v-else name="user" size="small" />
          {{ user.fullName }}
        </a>

        <sui-button
          v-if="loggedIn && !user"
          content="Fetch Settings"
          @click="fetchSettings()"
        />

        <sui-divider v-if="loggedIn" hidden />

        <sui-button
          v-if="loggedIn"
          :content="firstLoad ? 'Refresh' : 'Fetch'"
          :icon="firstLoad ? 'sync alternate' : 'cloud download'"
          :loading="loading"
          :disabled="loading"
          positive
          @click="fetchInfo()"
        />

        <sui-button
          negative
          icon="trash"
          content="Remove All"
          v-if="loggedIn"
          :disabled="loading || playback.length === 0 || Object.keys(removing).length > 0"
          :loading="loading || Object.keys(removing).length > 0"
          @click="removeAllPlaybacks()"
        />
      </sui-header-content>
    </sui-header>

    <sui-divider hidden />

    <sui-message
      v-for="(m, $index) in messages"
      :key="`flash-${$index}`"
      v-bind="{
        header: m.header,
        content: m.content,
        [m.type || 'info']: true,
        dismissable: m.persist,
      }"
      @dismiss="dismissFlash(m)"
    />

    <template v-if="playing">
      <currently-playing
        :playing="playing"
        @stopped="playing = false; fetchPlaybackProgress()"
        @flash="flash(...$event)"
      />
      <sui-divider hidden />
    </template>

    <sui-loader v-if="loading" active centered inline />
    <sui-message v-else-if="noResults" info header="No results" content="There are no items to remove." />
    <sui-card-group v-else stackable :items-per-row="3" class="doubling">
      <playback-item v-for="item in playback" :key="item.id" :info="item" :removing="removing" @remove="removePlayback" />
    </sui-card-group>

    <sui-divider />

    <app-footer />
  </div>
</template>

<script>
import TraktLogo from '../trakt.png';
import api from '../api.js';
import { isDevelopment } from '../utils.js';
import AppFooter from './app-footer.vue';
import CurrentlyPlaying from './currently-playing.vue';
import PlaybackItem from './playback-item.vue';

export default {
  name: 'App',
  components: {
    AppFooter,
    CurrentlyPlaying,
    PlaybackItem,
  },
  data() {
    return {
      initialized: false,
      loggedIn: false,
      loggingIn: true,
      loading: false,
      firstLoad: false,
      settings: {},
      playback: [],
      messages: [],
      removing: {},
      playing: false,
    };
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
        await this.fetchSettings();
      }
    } catch (error) {
      console.error(error);
      this.flash('Error in mounted()', String(error), 'error', true);
      if (isDevelopment) debugger;
    } finally {
      this.loggingIn = false;
      this.initialized = true;
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
    logo() {
      return TraktLogo;
    },
    user() {
      if (!this.loggedIn) return undefined;
      const { user } = this.settings;
      if (!user) return undefined;
      const { username, name, images, ids } = user;
      const fullName = ['', username].includes(name) ? username : `${name} (${username})`;
      const avatar = images.avatar && images.avatar.full || undefined;
      const profile = ids.slug && `https://trakt.tv/users/${ids.slug}`;

      return {
        // avatar,
        fullName,
        profile,
      };
    },
    noResults() {
      return this.firstLoad && this.playback.length === 0;
    },
  },
  methods: {
    requestAuth() {
      window.location.replace(api.get_url());
      window.localStorage.setItem('traktAuthState', api._authentication.state);
    },
    /* async */ revokeAuth() {
      window.localStorage.removeItem('traktAuth');
      // await api.revoke_token();
      this.loggedIn = false;
    },
    async loadAuth() {
      // Load from localStorage
      const stored = window.localStorage.getItem('traktAuth');
      if (!stored) return false;
      try {
        const data = JSON.parse(stored);
        await api.import_token(data);
        this.loggedIn = true;
        return true;
      } catch (error) {
        console.error(error);
        this.flash('Error in loadAuth()', String(error), 'error', true);
        if (isDevelopment) debugger;
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
          this.flash('Error in saveAuth()', String(error), 'error', true);
          if (isDevelopment) debugger;
        }
      }
      return false;
    },
    async exchangeCode(code, state) {
      try {
        await api.exchange_code(code, state);
        this.loggedIn = true;
        window.localStorage.removeItem('traktAuthState');
        this.saveAuth();
      } catch (error) {
        console.error(error);
        this.flash('Error in exchangeCode()', String(error), 'error', true);
        if (isDevelopment) debugger;
      }
    },
    async fetchSettings() {
      try {
        const data = await api.users.settings();
        Object.keys(data).forEach(key => {
          this.$set(this.settings, key, data[key]);
        });
      } catch (error) {
        console.error(error);
        this.flash('Error in fetchSettings()', String(error), 'error', true);
        if (isDevelopment) debugger;
      }
    },
    async fetchInfo() {
      this.loading = true;
      await this.fetchPlaybackProgress();
      await this.fetchCurrentlyPlaying();
      this.loading = false;
    },
    async fetchPlaybackProgress() {
      try {
        this.playback = await api.sync.playback.get();
        if (!this.firstLoad) this.firstLoad = true;
      } catch (error) {
        console.error(error);
        this.flash('Error in fetchPlaybackProgress()', String(error), 'error', true);
        if (isDevelopment) debugger;
      }
    },
    async removePlayback(id, updateState = true) {
      this.$set(this.removing, id, null);
      try {
        await api.sync.playback.remove({ id });
        const index = this.playback.findIndex(item => item.id === id);
        if (updateState) {
          this.$delete(this.playback, index);
          this.flash('Playback item removed', '', 'success');
        }
      } catch (error) {
        console.error(error);
        this.flash('Error in removePlayback()', String(error), 'error', true);
        if (isDevelopment) debugger;
        return false;
      } finally {
        this.$delete(this.removing, id);
      }
      return true;
    },
    async removeAllPlaybacks() {
      let result = true;
      this.$set(this.removing, 'all', null);
      for (const item of this.playback) {
        result &= await this.removePlayback(item.id, false);
      }

      if (result) {
        this.playback = [];
        this.flash('All playback items removed', '', 'success');
      } else {
        this.flash('Some playback items failed to remove', '', 'warning');
        await this.fetchPlaybackProgress();
      }
      this.$delete(this.removing, 'all');
    },
    async fetchCurrentlyPlaying() {
      try {
        const data = await api.users.watching({ username: 'me' });
        this.playing = data || false;
      } catch (error) {
        console.error(error);
        this.flash('Error in fetchCurrentlyPlaying()', String(error), 'error', true);
        if (isDevelopment) debugger;
      }
    },
    flash(header, content, type, persist = false) {
      const msg = {
        header,
        content,
        type,
        persist,
      };
      this.messages.unshift(msg);
      if (!persist) setTimeout(this.dismissFlash, 3000, msg);
    },
    dismissFlash(msg) {
      const index = this.messages.findIndex(item => item === msg);
      this.$delete(this.messages, index);
    },
  }
};
</script>

<style scoped>
  #app-header {
    font-size: 1.5em;
    margin-top: 25px;
  }
</style>