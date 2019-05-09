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
import { mapState, mapGetters } from 'vuex';

import { SET_QUERY } from '../store/mutation-types';

import PlaybackItem from './PlaybackItem';

export default {
  name: 'PlaybackList',
  components: {
    PlaybackItem,
  },
  computed: {
    ...mapState([
      'busy',
      'firstLoad',
      'playback',
    ]),
    ...mapGetters([
      'filteredPlayback',
    ]),
    query: {
      get() {
        return this.$store.state.query;
      },
      set(value) {
        this.$store.commit(SET_QUERY, value);
      },
    },
    noResults() {
      return this.firstLoad && this.playback.length === 0;
    },
  },
};
</script>

<style scoped>
</style>
