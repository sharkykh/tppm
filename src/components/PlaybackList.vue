<template>
  <div>
    <sui-loader
      v-if="busy"
      active
      centered
      inline
    />
    <sui-message
      v-else-if="noResults"
      info
      header="No results"
      content="There are no items to remove."
    />
    <template v-else-if="playback.length > 0">
      <sui-input
        v-model="query"
        placeholder="Search..."
        icon="search"
      />
      <sui-divider hidden />
      <sui-card-group
        stackable
        :items-per-row="3"
        class="doubling"
      >
        <playback-item
          v-for="item in filteredPlayback"
          :key="item.id"
          :info="item"
        />
      </sui-card-group>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import PlaybackItem from './PlaybackItem';

export default {
  name: 'PlaybackList',
  components: {
    PlaybackItem,
  },
  data() {
    return {
      query: '',
    };
  },
  computed: {
    ...mapState([
      'busy',
      'firstLoad',
      'playback',
    ]),
    noResults() {
      return this.firstLoad && this.playback.length === 0;
    },
    filteredPlayback() {
      return this.playback.filter(item => {
        const titles = ['episode', 'show', 'movie'].map(type => item[type]?.title).filter(Boolean);
        return titles.some(title => {
          return title.toLowerCase().includes(this.query);
        });
      });
    },
  },
};
</script>

<style scoped>
</style>
