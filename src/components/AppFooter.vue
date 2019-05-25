<template>
  <div>
    <a href="https://github.com/sharkykh/tppm">
      <sui-button
        color="black"
        icon="github"
        content="Source"
      />
    </a>
    <sui-divider hidden />
  </div>
</template>

<script>
import Vue from 'vue';

import {
  SuiButton,
  SuiDivider,
} from './sui-vue';

export default Vue.extend({
  name: 'AppFooter',
  components: {
    SuiButton,
    SuiDivider,
  },
});
</script>

<style scoped>
</style>
