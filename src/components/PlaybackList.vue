<template>
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
  <sui-card-group
    v-else
    stackable
    :items-per-row="3"
    class="doubling"
  >
    <playback-item
      v-for="item in playback"
      :key="item.id"
      :info="item"
    />
  </sui-card-group>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  PlaybackItem,
  SuiCardGroup,
  SuiLoader,
  SuiMessage,
} from '.';

export default Vue.extend({
  name: 'PlaybackList',
  components: {
    PlaybackItem,
    SuiCardGroup,
    SuiLoader,
    SuiMessage,
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
  },
});
</script>

<style scoped>
</style>
