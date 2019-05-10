<template>
  <div id="debug">
    <sui-button
      content="Send test data"
      color="orange"
      icon="envelope"
      :loading="busy"
      :disabled="busy"
      @click="sendPlaybackItems()"
    />
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
          Episode
        </sui-dropdown-item>
        <sui-dropdown-item @click="sendScrobbleStart('movie')">
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
import { mapState, mapActions } from 'vuex';

import api from '../api';

const testData = {
  movie: [
    {tmdb: 404368}, // Ralph Breaks the Internet (2018)
  ],
  episode: [
    {tvdb: 5951173}, // Tá no Ar: A TV na TV: 4x04 Episode 4
    {tvdb: 5950264}, // Democracy Now!: 2017x32 Tuesday, February 14, 2017
    {tvdb: 5966778}, // All In with Chris Hayes: 2017x32 February 14, 2017
    {tvdb: 5966780}, // All In with Chris Hayes: 2017x33 February 15, 2017
    {tvdb: 5940102}, // Chicago Fire: 5x13 Trading in Scuttlebutt
    {tvdb: 6636942}, // Westworld: 2x03 Virtù e Fortuna
  ],
};

export default {
  name: 'Debug',
  computed: {
    ...mapState([
      'busy',
    ]),
  },
  methods: {
    ...mapActions([
      'fetchPlaybackProgress',
      'fetchCurrentlyPlaying',
    ]),
    async sendPlaybackItems() {
      let index = 1;
      const total = testData.movie.length + testData.episode.length;

      for (const [category, items] of Object.entries(testData)) {
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
            console.log(error);
            debugger;
          }

          ++index;

          try {
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => {
              setTimeout(resolve, 100);
            });
          } catch (error) {}
        }
      }

      console.log('Test data sent.');
      this.fetchPlaybackProgress();
    },
    randomProgress() {
      return Math.random() * (100.0 - 0.0);
    },
    async sendScrobbleStart(type) {
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

      this.fetchCurrentlyPlaying();
    },
    async sendCheckin() {
      // A Simple Favor (2018)
      try {
        await api.checkin.add({ movie: { ids: { tmdb: 484247 } } });
      } catch (error) {
        console.log(error);
        debugger;
      }

      this.fetchCurrentlyPlaying();
    },
  },
};
</script>

<style scoped>
  div#debug {
    padding-top: 10px;
  }
</style>
