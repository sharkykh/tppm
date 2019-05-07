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
      :percent="progress.toFixed(0)"
    />
  </sui-segment>
</template>

<script>
import { mapActions } from 'vuex';

import api from '../api';
import { isDevelopment, generateTraktUrl } from '../utils';

export default {
  name: 'CurrentlyPlaying',
  props: {
    playing: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  data() {
    return {
      stopping: false,
      now: new Date().getTime(),
      updateTime: null,
    };
  },
  computed: {
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
      const expires = new Date(expires_at).getTime();
      const started = new Date(started_at).getTime();

      const watched = now - started;
      const total = expires - started;
      const progress = (watched / total) * 100;
      return progress > 0 ? progress : 0;
    },
  },
  mounted() {
    this.updateTime = setInterval(() => {
      this.now = new Date().getTime();
    }, 1000);
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
    ]),
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
      const { playing, progress } = this;
      try {
        this.stopping = true;
        const data = {
          ids: {
            trakt: playing[playing.type].ids.trakt,
          },
        };
        await api.scrobble.pause({ progress, [playing.type]: data });
        this.$emit('stopped');
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
      const { playing, progress } = this;
      try {
        this.stopping = true;
        await api.checkin.delete();
        this.$emit('canceled');
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
};
</script>

<style scoped>
  .ui.button {
    margin-top: 0.5em;
  }
  .ui.progress {
    margin: 0.5em 0 0.5em;
  }
</style>
