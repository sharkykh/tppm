<template>
  <sui-card>
    <sui-card-content class="left aligned">
      <sui-card-header>
        <template v-if="isEpisode">
          {{ info.show.title }}
        </template>
        <template v-else-if="isMovie">
          {{ info.movie.title }}
        </template>

        <a
          :href="url"
          class="right floated"
        >
          <sui-icon
            name="external"
            size="small"
          />
        </a>
      </sui-card-header>

      <sui-card-meta v-if="isEpisode">
        <sui-icon
          name="tv"
          title="Episode"
          class="icon-fix"
        />
        {{ info.episode.season }}
        <sui-icon
          name="times"
          size="small"
          fitted
        />
        {{ info.episode.number }}
        –
        {{ info.episode.title }}
      </sui-card-meta>
      <sui-card-meta v-else-if="isMovie">
        <sui-icon
          name="film"
          title="Movie"
        />
        {{ info.movie.year }}
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

import { generateTraktUrl } from '../utils.js';

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
    url() {
      return generateTraktUrl(this.info) || undefined;
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
  .icon-fix {
    margin-left: -.1em;
    margin-right: .1em !important;
  }
  .ui.progress {
    margin: -0.5em 0 0.5em;
  }
</style>
