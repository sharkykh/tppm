<template>
  <sui-segment>
    <h2 is="sui-header">Currently playing</h2>

    <a :href="url">
      <h3 is="sui-header" v-if="playing.type === 'episode'">
        {{ playing.show.title }}
        {{ playing.episode.season }}x{{ playing.episode.number }}
        "{{ playing.episode.title }}"
      </h3>
      <h3 is="sui-header" v-else-if="playing.type === 'movie'">
        {{ playing.movie.title }}
        ({{ playing.movie.year }})
      </h3>
    </a>

    <sui-button
      negative
      icon="stop"
      content="Stop"
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
import api from '../api.js';
import { isDevelopment } from '../utils.js';

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
    };
  },
  computed: {
    url() {
      const type = 'episode' in this.playing ? 'episode' : 'movie' in this.playing ? 'movie' : undefined;
      if (!type) return undefined;
      const id = this.playing[type].ids.trakt;
      return `https://trakt.tv/search/trakt/${id}?id_type=${type}`;
    },
    progress() {
      const { expires_at, started_at } = this.playing;
      const expires = new Date(expires_at).getTime();
      const started = new Date(started_at).getTime();
      const now = new Date().getTime();

      const watched = now - started;
      const total = expires - started;
      return (watched / total) * 100;
    },
  },
  methods: {
    async stopCurrentlyPlaying() {
      const { playing, progress } = this;
      if (!['episode', 'movie'].includes(playing.type)) {
        this.flash('Nothing is currently playing.', '', 'error');
        return false;
      }
      try {
        this.stopping = true;
        const data = {
          ids: {
            trakt: playing[playing.type].ids.trakt,
          },
        };
        await api.scrobble.pause({ progress, [playing.type]: data });
        this.$emit('stopped');
        this.flash(`Stopped currently playing ${playing.type} at ${progress.toFixed(0)}%`, '', 'success');
      } catch (error) {
        console.error(error);
        this.flash('Error in stopCurrentlyPlaying()', String(error), 'error', true);
        if (isDevelopment) debugger;
      } finally {
        this.stopping = false;
      }
    },
    flash() {
      this.$emit('flash', arguments);
    },
  }
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