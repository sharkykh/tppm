<template>
  <sui-card>
    <sui-card-content class="left aligned">
      <sui-card-header v-if="isEpisode">
        {{ info.show.title }}
      </sui-card-header>
      <sui-card-header v-else-if="isMovie">
        {{ info.movie.title }}
      </sui-card-header>

      <sui-card-meta v-if="isEpisode">
        <sui-icon
          name="tv"
          title="Episode"
        />
        {{ info.episode.season }}
        <sui-icon
          name="times"
          size="small"
          fitted
        />
        {{ info.episode.number }}
      </sui-card-meta>
      <sui-card-meta v-else-if="isMovie">
        <sui-icon
          name="film"
          title="Movie"
        />
        {{ info.movie.year }}
      </sui-card-meta>

      <sui-card-meta v-if="isEpisode">
        <sui-icon name="pencil alternate" />
        {{ info.episode.title }}
      </sui-card-meta>

      <sui-card-meta>
        <sui-icon name="pause" />
        {{ date }}
      </sui-card-meta>
    </sui-card-content>

    <sui-progress
      progress
      color="blue"
      :percent="info.progress.toFixed(0)"
    />

    <sui-button
      negative
      compact
      icon="trash"
      content="Remove"
      :loading="disableRemove"
      :disabled="disableRemove"
      @click="$emit('remove', info.id)"
    />
  </sui-card>
</template>

<script>
import formatDate from 'date-fns/format';

export default {
  name: 'PlaybackItem',
  props: {
    info: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    removing: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  computed: {
    isEpisode() {
      return this.info.type === 'episode';
    },
    isMovie() {
      return this.info.type === 'movie';
    },
    date() {
      const date = Date.parse(this.info.paused_at);
      const Z = new Date(date).getTimezoneOffset() ? 'Z' : '';
      return formatDate(date, `YYYY-MM-DD – HH:mm:SS – (UTC${Z})`);
    },
    disableRemove() {
      const { removing, info } = this;
      return info.id in removing || 'all' in removing;
    },
  },
};
</script>

<style scoped>
  .ui.progress {
    margin: -0.5em 0 0.5em;
  }
</style>
