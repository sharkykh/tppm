<template>
  <div id="debug">
    <sui-dropdown
      class="orange labeled icon"
      icon="envelope"
      :loading="busy"
      :disabled="busy"
      button
      text="Send test data"
    >
      <sui-dropdown-menu>
        <sui-dropdown-item @click="sendPlaybackItems()">
          <sui-icon
            name="star"
            title="All"
          />
          All
        </sui-dropdown-item>
        <sui-dropdown-item @click="sendPlaybackItems('episode')">
          <sui-icon
            name="tv"
            title="Episodes"
          />
          Episodes ({{ dataCount.episode }})
        </sui-dropdown-item>
        <sui-dropdown-item @click="sendPlaybackItems('movie')">
          <sui-icon
            name="film"
            title="Movies"
          />
          Movies ({{ dataCount.movie }})
        </sui-dropdown-item>
      </sui-dropdown-menu>
    </sui-dropdown>
    <sui-dropdown
      class="orange labeled icon"
      icon="play"
      :loading="busy"
      :disabled="busy"
      button
      text="Test scrobble start"
    >
      <sui-dropdown-menu>
        <sui-dropdown-item @click="sendScrobbleStart('episode')">
          <sui-icon
            name="tv"
            title="Episode"
          />
          Episode
        </sui-dropdown-item>
        <sui-dropdown-item @click="sendScrobbleStart('movie')">
          <sui-icon
            name="film"
            title="Movie"
          />
          Movie
        </sui-dropdown-item>
      </sui-dropdown-menu>
    </sui-dropdown>
    <sui-button
      content="Test check in"
      color="orange"
      icon="checkmark"
      :loading="busy"
      :disabled="busy"
      @click="sendCheckin()"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapMutations, mapActions } from 'vuex';

import api from '../api';
import { SET_BUSY } from '../store/mutation-types';
import { handleFetchError, wait } from '../utils';

import {
  SuiButton,
  SuiDropdown,
  SuiDropdownMenu,
  SuiDropdownItem,
  SuiIcon,
} from './sui-vue';

const testData = {
  movie: [
    { tmdb: 404368 }, // Ralph Breaks the Internet (2018)
  ],
  episode: [
    { tvdb: 5951173 }, // Tá no Ar: A TV na TV: 4x04 Episode 4
    { tvdb: 5950264 }, // Democracy Now!: 2017x32 Tuesday, February 14, 2017
    { tvdb: 5966778 }, // All In with Chris Hayes: 2017x32 February 14, 2017
    { tvdb: 5966780 }, // All In with Chris Hayes: 2017x33 February 15, 2017
    { tvdb: 5940102 }, // Chicago Fire: 5x13 Trading in Scuttlebutt
    { tvdb: 6636942 }, // Westworld: 2x03 Virtù e Fortuna
  ],
};

export default Vue.extend({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Debug',
  components: {
    SuiButton,
    SuiDropdown,
    SuiDropdownMenu,
    SuiDropdownItem,
    SuiIcon,
  },
  computed: {
    ...mapState([
      'busy',
    ]),
    dataCount() {
      return Object.fromEntries(Object.entries(testData).map(([category, items]) => [category, items.length]));
    },
  },
  methods: {
    ...mapMutations({
      setBusy: SET_BUSY,
    }),
    ...mapActions([
      'flash',
      'fetchPlaybackProgress',
      'fetchCurrentlyPlaying',
    ]),
    async sendPlaybackItems(...which) {
      this.setBusy(true);

      which = which.length === 0 ? Object.keys(testData) : which;
      let index = 1;
      const total = testData.movie.length + testData.episode.length;

      for (const [category, items] of Object.entries(testData)) {
        if (!which.includes(category)) {
          continue;
        }

        for (const item of items) {
          const params = {
            progress: this.randomProgress(),
            [category]: {
              ids: item,
            },
          };
          console.log(`Sending [${index}/${total}]: ${JSON.stringify(item)}`);

          try {
            // eslint-disable-next-line no-await-in-loop
            await api.scrobble.pause(params);
          } catch (error) {
            const fetchError = handleFetchError(error);
            if (fetchError) {
              console.warn(error);
              this.flash(['[sendPlaybackItems] Request Failed', fetchError, 'warning', true]);
            } else {
              console.log(error);
              debugger;
            }
          }

          ++index;

          // eslint-disable-next-line no-await-in-loop
          await wait(1050);
        }
      }

      console.log('Test data sent.');
      await this.fetchPlaybackProgress();

      this.setBusy(false);
    },
    randomProgress() {
      return Math.random() * (100.0 - 0.0);
    },
    async sendScrobbleStart(type) {
      this.setBusy(true);

      const data = {
        episode: { ids: { tvdb: 25333 } }, // Stargate Atlantis: 1x01 Rising (1)
        movie: { ids: { tmdb: 484247 } }, // A Simple Favor (2018)
      };

      try {
        await api.scrobble.start({ [type]: data[type], progress: 25.0 });
      } catch (error) {
        console.log(error);
        debugger;
      }

      await this.fetchCurrentlyPlaying();

      this.setBusy(false);
    },
    async sendCheckin() {
      this.setBusy(true);

      // A Simple Favor (2018)
      try {
        await api.checkin.add({ movie: { ids: { tmdb: 484247 } } });
      } catch (error) {
        const status = error?.response?.code;
        if (status === 409) {
          this.flash(['409 Conflict', 'Already checked in.', 'warning', false]);
        } else {
          console.log(error);
          debugger;
        }
      }

      await this.fetchCurrentlyPlaying();

      this.setBusy(false);
    },
  },
});
</script>

<style scoped>
  div#debug {
    padding-top: 10px;
  }
</style>
