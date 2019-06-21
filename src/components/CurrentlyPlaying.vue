<template>
  <sui-segment>
    <h2 is="sui-header">
      {{ event.title }}
    </h2>

    <a :href="url">
      <h3
        is="sui-header"
        v-if="playing.type === 'episode'"
      >
        {{ playing.show.title }}
        {{ playing.episode.season }}x{{ playing.episode.number }}
        "{{ playing.episode.title }}"
      </h3>
      <h3
        is="sui-header"
        v-else-if="playing.type === 'movie'"
      >
        {{ playing.movie.title }}
        ({{ playing.movie.year }})
      </h3>
    </a>

    <sui-button
      negative
      v-bind="event.buttonAttrs"
      size="large"
      :loading="stopping"
      :disabled="stopping"
      @click="stopCurrentlyPlaying()"
    />

    <sui-progress
      progress
      state="active"
      color="red"
      :percent="progress.percent.toFixed(0)"
      :label="progress.label"
    />
  </sui-segment>
</template>

<script>
import { format as formatDate, parseISO } from 'date-fns';
import Vue from 'vue';
import { mapState, mapActions, mapMutations } from 'vuex';

import {
  SET_PLAYING,
} from '../store/mutation-types';
import api from '../api';
import { isDevelopment, generateTraktUrl } from '../utils';

import {
  SuiButton,
  SuiHeader,
  SuiProgress,
  SuiSegment,
} from './sui-vue';

export default Vue.extend({
  name: 'CurrentlyPlaying',
  components: {
    SuiButton,
    SuiHeader,
    SuiProgress,
    SuiSegment,
  },
  data() {
    return {
      stopping: false,
      now: new Date().getTime(),
      updateTime: null,
    };
  },
  computed: {
    ...mapState([
      'playing',
    ]),
    event() {
      const { playing } = this;
      let title;
      let buttonAttrs;

      if (playing.action === 'scrobble') {
        title = 'Currently playing';
        buttonAttrs = {
          icon: 'stop',
          content: 'Stop',
        };
      }

      if (this.playing.action === 'checkin') {
        title = 'Currently checked in';
        buttonAttrs = {
          icon: 'times circle',
          content: 'Cancel check in',
        };
      }

      return {
        title,
        buttonAttrs,
      };
    },
    url() {
      return generateTraktUrl(this.playing) || undefined;
    },
    progress() {
      const { now, playing } = this;
      const { expires_at, started_at } = playing; // eslint-disable-line camelcase
      const expires = parseISO(expires_at).getTime();
      const started = parseISO(started_at).getTime();

      if (now > expires) {
        this.setPlaying(false);
      }

      const watched = now - started;
      const total = expires - started;
      const progress = (watched / total) * 100;

      const { actualDuration } = this;

      const watchedDuration = formatDate(actualDuration(watched), 'HH:mm:ss');
      const totalDuration = formatDate(actualDuration(total), 'HH:mm:ss');
      const label = `${watchedDuration} / ${totalDuration}`;

      return {
        percent: watched > 0 ? progress : 0,
        label,
      };
    },
  },
  mounted() {
    this.updateTime = setInterval(() => {
      this.now = new Date().getTime();
    }, 500);
  },
  destroyed() {
    if (this.updateTime) {
      clearInterval(this.updateTime);
      this.updateTime = null;
    }
  },
  methods: {
    ...mapActions([
      'flash',
      'fetchPlaybackProgress',
    ]),
    ...mapMutations({
      setPlaying: SET_PLAYING,
    }),
    actualDuration(diff) {
      if (diff < 0) {
        diff = 0;
      }

      return diff + (60 * 1000 * new Date(diff).getTimezoneOffset());
    },
    stopCurrentlyPlaying() {
      const { playing } = this;
      if (!['episode', 'movie'].includes(playing.type)) {
        this.flash(['Nothing is currently playing.', '', 'error']);
        return false;
      }

      if (playing.action === 'scrobble') {
        return this.scrobblePause();
      }

      if (playing.action === 'checkin') {
        return this.cancelCheckin();
      }
    },
    async scrobblePause() {
      const { playing } = this;
      const progress = this.progress.percent;
      try {
        this.stopping = true;
        const data = {
          ids: {
            trakt: playing[playing.type].ids.trakt,
          },
        };
        await api.scrobble.pause({ progress, [playing.type]: data });
        this.setPlaying(false);
        this.fetchPlaybackProgress();
        this.flash([`Stopped currently playing ${playing.type} at ${progress.toFixed(0)}%`, '', 'success']);
        return true;
      } catch (error) {
        console.error(error);
        this.flash(['Error in scrobblePause()', String(error), 'error', true]);
        if (isDevelopment) {
          debugger;
        }
      } finally {
        this.stopping = false;
      }
    },
    async cancelCheckin() {
      const { playing } = this;
      const progress = this.progress.percent;
      try {
        this.stopping = true;
        await api.checkin.delete();
        this.setPlaying(false);
        this.flash([`Canceled currently checked in ${playing.type} at ${progress.toFixed(0)}%`, '', 'success']);
        return true;
      } catch (error) {
        console.error(error);
        this.flash(['Error in cancelCheckin()', String(error), 'error', true]);
        if (isDevelopment) {
          debugger;
        }
      } finally {
        this.stopping = false;
      }
    },
  },
});
</script>

<style scoped>
  .ui.button {
    margin-top: 0.5em;
  }
  .ui.progress {
    margin: 0.5em 0 1.5em;
  }
</style>
