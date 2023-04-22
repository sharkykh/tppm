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
          title="View on Trakt.tv"
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
        &ndash;
        {{ info.episode.title }}
      </sui-card-meta>
      <sui-card-meta v-else-if="isMovie">
        <sui-icon
          name="film"
          title="Movie"
          class="icon-fix"
        />
        {{ info.movie.year }}
      </sui-card-meta>

      <sui-card-meta>
        <sui-icon name="pause" />
        <time :datetime="info.paused_at">{{ date }}</time>
      </sui-card-meta>
    </sui-card-content>

    <sui-progress
      progress
      color="blue"
      :percent="info.progress.toFixed(0)"
      :title="`Watch progress: ${info.progress}%`"
    />

    <sui-button
      negative
      compact
      icon="trash"
      content="Remove"
      :loading="disableRemove"
      :disabled="disableRemove"
      @click="removePlayback(info.id)"
    />
  </sui-card>
</template>

<script>
import { format as formatDate, parseISO } from 'date-fns';
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

import { generateTraktUrl } from '../utils';

import {
  SuiButton,
  SuiCard,
  SuiCardContent,
  SuiCardHeader,
  SuiCardMeta,
  SuiIcon,
  SuiProgress,
} from './sui-vue';

export default Vue.extend({
  name: 'PlaybackItem',
  components: {
    SuiButton,
    SuiCard,
    SuiCardContent,
    SuiCardHeader,
    SuiCardMeta,
    SuiIcon,
    SuiProgress,
  },
  props: {
    info: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  computed: {
    ...mapState([
      'removing',
    ]),
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
      const date = parseISO(this.info.paused_at);
      const tz = date.getTimezoneOffset() ? 'xxx' : '';
      return formatDate(date, `yyyy-MM-dd HH:mm:ss (${tz})`);
    },
    disableRemove() {
      const { removing, info } = this;
      return info.id in removing || 'all' in removing;
    },
  },
  methods: {
    ...mapActions([
      'removePlayback',
    ]),
  },
});
</script>

<style scoped>
  .icon-fix {
    margin-right: .3em !important;
  }
  .header {
    margin-bottom: 0.35em;
  }
  .ui.progress {
    margin: -0.5em 0 0.5em;
  }
</style>
