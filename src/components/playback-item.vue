<template>
  <sui-card>
    <sui-card-content v-if="info.type === 'episode'" class="left aligned">
      <sui-card-header>{{ info.show.title }}</sui-card-header>
      <sui-card-meta>
        <sui-icon name="tv" title="Episode" />
        {{ info.episode.season }} <sui-icon name="times" size="small" fitted /> {{ info.episode.number }}
      </sui-card-meta>
      <sui-card-meta>
        <sui-icon name="pencil alternate" />
        {{ info.episode.title }}
      </sui-card-meta>
      <sui-card-meta>
        <sui-icon name="pause" />
        {{ formatDate(info.paused_at, 'YYYY-MM-DD HH:mm:SS (UTCZ)') }}
      </sui-card-meta>
    </sui-card-content>

    <sui-card-content v-else-if="info.type === 'movie'" class="left aligned">
      <sui-card-header>{{ info.movie.title }}</sui-card-header>
      <sui-card-meta>
        <sui-icon name="film" title="Movie" />
        {{ info.movie.year }}
      </sui-card-meta>
      <sui-card-meta>
        <sui-icon name="pause" />
        {{ formatDate(info.paused_at, 'YYYY-MM-DD HH:mm:SS (UTCZZ)') }}
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
    }
  },
  methods: {
    formatDate(rawDate, format) {
      const date = Date.parse(rawDate);
      return formatDate(date, format);
    },
  },
};
</script>

<style scoped>
  .ui.progress {
    margin: -0.5em 0 0.5em;
  }
</style>